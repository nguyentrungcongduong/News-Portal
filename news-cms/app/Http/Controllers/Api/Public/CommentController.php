<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Comment;
use App\Http\Resources\Public\CommentResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CommentController extends Controller
{
    /**
     * Display a listing of approved comments for a post.
     */
    public function index(string $slug)
    {
        $post = Post::where('slug', $slug)->firstOrFail();

        // Load comments (only root comments, with approved children)
        $isAdmin = auth('sanctum')->check() && auth('sanctum')->user()->hasRole(['admin', 'editor']);

        $userId = auth('sanctum')->id();

        $comments = Comment::where('post_id', $post->id)
            ->when(!$isAdmin, function ($q) use ($userId) {
                $q->where(function ($query) use ($userId) {
                    $query->approved();
                    if ($userId) {
                        $query->orWhere('user_id', $userId);
                    }
                });
            })
            ->whereNull('parent_id')
            ->with(['user', 'children' => function ($q) use ($isAdmin, $userId) {
                $q->when(!$isAdmin, function ($sub) use ($userId) {
                    $sub->where(function ($query) use ($userId) {
                        $query->approved();
                        if ($userId) {
                            $query->orWhere('user_id', $userId);
                        }
                    });
                })->orderBy('created_at', 'asc');
            }])
            ->orderBy('created_at', 'asc')
            ->get();

        return CommentResource::collection($comments);
    }

    /**
     * Store a newly created comment in storage.
     */
    public function store(Request $request, string $slug)
    {
        $post = Post::where('slug', $slug)->firstOrFail();
        $user = $request->user(); // Authenticated user via Sanctum

        if ($user->is_blocked) {
            return response()->json([
                'message' => 'Tài khoản của bạn đã bị khóa tính năng bình luận.'
            ], 403);
        }

        $data = $request->validate([
            'content'      => 'required|string|min:3|max:1000',
            'parent_id'    => 'nullable|exists:comments,id',
        ]);

        // Spam Detection
        $spamCheck = \App\Services\SpamDetectionService::check($data['content'], $user);
        $status = $spamCheck['status'];
        $spamReason = $spamCheck['reason'];

        // Admin/Editor comments are auto-approved unless they contain explicit blacklisted words
        if ($user->hasRole(['admin', 'editor']) && $status !== 'hidden') {
            $status = 'approved';
        }

        $comment = Comment::create([
            'post_id'      => $post->id,
            'user_id'      => $user->id,
            'content'      => $data['content'],
            'parent_id'    => $data['parent_id'],
            'ip_address'   => $request->ip(),
            'status'       => $status,
            'spam_reason'  => $spamReason,
        ]);

        // Auto-Block Rule: If user has 3+ hidden (spam) comments, block them
        if ($status === 'hidden' && $user) {
            $spamCount = Comment::where('user_id', $user->id)
                ->where('status', 'hidden')
                ->count();
            
            if ($spamCount >= 3) {
                $user->update(['is_blocked' => true]);
                
                \App\Services\NotificationService::notifyAdmins('system_alert', [
                    'title' => 'Tự động khóa tài khoản nội dung rác',
                    'reason' => "Người dùng {$user->name} bị khóa do có {$spamCount} bình luận vi phạm.",
                    'user_id' => $user->id
                ]);
            }
        }

        // Notify Admins if suspected spam
        if ($status === 'reported') {
            \App\Services\NotificationService::notifyAdmins('comment_reported', [
                'comment_id' => $comment->id,
                'post_id' => $post->id,
                'post_title' => $post->title,
                'reason' => 'Tự động phát hiện nghi vấn: ' . $spamReason
            ]);
        }

        // Notify Admins if pending approval
        if ($status === 'pending') {
            \App\Services\NotificationService::notifyAdmins('comment_pending', [
                'comment_id' => $comment->id,
                'post_id' => $post->id,
                'post_title' => $post->title,
                'user_name' => $user->name,
                'content' => \Illuminate\Support\Str::limit($data['content'], 50)
            ]);
        }

        return response()->json([
            'message' => $status === 'hidden' 
                ? 'Bình luận không thể đăng do vi phạm chính sách nội dung.' 
                : ($status === 'approved' ? 'Bình luận thành công.' : 'Bình luận đang được hệ thống kiểm duyệt.'),
        ]);
    }

    /**
     * Report a comment.
     */
    public function report(Request $request, int $comment_id)
    {
        $comment = Comment::findOrFail($comment_id);

        $data = $request->validate([
            'reason' => 'required|string|max:100',
            'details' => 'nullable|string|max:500',
        ]);

        \App\Models\CommentReport::updateOrCreate(
            [
                'comment_id' => $comment->id,
                'user_id' => auth('sanctum')->id(),
            ],
            [
                'reason' => $data['reason'],
                'details' => $data['details'] ?? null,
                'status' => 'pending',
            ]
        );

        // Notify Admins
        \App\Services\NotificationService::notifyAdmins(
            'comment_reported',
            [
                'comment_id' => $comment->id,
                'post_id' => $comment->post_id,
                'post_title' => $comment->post?->title,
                'reason' => $data['reason']
            ]
        );

        // Increment report count
        $comment->increment('report_count');

        // Update comment status to reported if it was approved and reaches 3 reports
        if ($comment->status === 'approved' && $comment->report_count >= 3) {
            $comment->update(['status' => 'reported']);
        }

        // Auto-moderation: hide if reports exceed threshold (e.g., 5)
        if ($comment->report_count >= 5) {
            $comment->update(['status' => 'hidden']);
        }

        return response()->json([
            'message' => 'Cảm ơn bạn đã báo cáo. Chúng tôi sẽ sớm xem xét bình luận này.'
        ]);
    }
}
