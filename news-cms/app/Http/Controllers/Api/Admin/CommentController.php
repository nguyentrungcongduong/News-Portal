<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\ModerationLog;
use Illuminate\Http\Request;
use App\Services\AuditService;
use Illuminate\Support\Facades\Gate;

class CommentController extends Controller
{
    /**
     * Display a listing of comments for moderation.
     */
    public function index(Request $request)
    {
        Gate::authorize('moderate', Comment::class);
        $status = $request->get('status', 'pending');
        $keyword = $request->get('keyword');
        $postId = $request->get('post_id');

        $comments = Comment::with(['user:id,name,email', 'post:id,title,slug', 'reports'])
            ->withCount('reports')
            ->when($status, function ($q) use ($status) {
                if ($status === 'reported') {
                    $q->has('reports');
                } else {
                    $q->where('status', $status);
                }
            })
            ->when($postId, function ($q) use ($postId) {
                $q->where('post_id', $postId);
            })
            ->when($keyword, function ($q) use ($keyword) {
                $q->where('content', 'like', '%' . $keyword . '%');
            })
            ->latest()
            ->paginate(20);

        return response()->json($comments);
    }

    public function approve(int $id)
    {
        $comment = Comment::findOrFail($id);
        Gate::authorize('moderate', Comment::class);
        $oldStatus = $comment->status;
        $comment->update(['status' => 'approved']);

        // Reward user if it was a pending comment
        if ($oldStatus === 'pending' && $comment->user_id) {
            $comment->user()->increment('trust_score', 1);
        }

        // When approving, we can clear the reports
        $comment->reports()->delete();

        AuditService::log(null, 'approve_comment', $comment, null, ['old_status' => $oldStatus, 'new_status' => 'approved']);

        return response()->json(['message' => 'Đã duyệt bình luận và cộng điểm tin cậy cho người dùng']);
    }

    /**
     * Ignore reports for a comment.
     */
    public function ignore(int $id)
    {
        $comment = Comment::findOrFail($id);
        Gate::authorize('moderate', Comment::class);
        
        // Clear reports but keep current status (should be approved or reported)
        if ($comment->status === 'reported') {
            $comment->update(['status' => 'approved']);
        }
        
        $comment->reports()->delete();
        
        AuditService::log(null, 'ignore_reports', $comment);

        return response()->json(['message' => 'Đã bỏ qua các báo cáo']);
    }

    public function hide(int $id)
    {
        $comment = Comment::findOrFail($id);
        Gate::authorize('moderate', Comment::class);
        $comment->update(['status' => 'hidden']);
        
        AuditService::log(null, 'hide_comment', $comment);

        return response()->json(['message' => 'Đã ẩn bình luận']);
    }

    public function reject(int $id)
    {
        $comment = Comment::findOrFail($id);
        Gate::authorize('moderate', Comment::class);
        $comment->update(['status' => 'rejected']);
        
        // Penalize user
        if ($comment->user_id) {
            $comment->user()->decrement('trust_score', 5);
        }

        AuditService::log(null, 'reject_comment', $comment);

        return response()->json(['message' => 'Đã từ chối bình luận và trừ điểm tin cậy']);
    }

    public function destroy(int $id)
    {
        $comment = Comment::findOrFail($id);
        Gate::authorize('delete', $comment);
        $comment->delete();
        
        AuditService::log(null, 'delete_comment', (object)['id' => $id, 'content' => $comment->content], null, ['comment_id' => $id]);

        return response()->json(['message' => 'Đã xóa bình luận']);
    }

    /**
     * Block the user who wrote the comment.
     */
    public function blockUser(int $id)
    {
        Gate::authorize('moderate', Comment::class);
        $comment = Comment::with('user')->findOrFail($id);
        
        if ($comment->user) {
            $comment->user->update(['is_blocked' => true]);
            
            // Reject all comments from this user
            Comment::where('user_id', $comment->user_id)
                ->update(['status' => 'rejected']);
                
            AuditService::log(null, 'block_user', $comment->user, null, ['reason' => 'Moderate from comment #' . $id]);
                
            return response()->json(['message' => 'Đã khóa tài khoản người dùng']);
        }

        return response()->json(['message' => 'Không tìm thấy người dùng'], 404);
    }

    /**
     * Unblock the user.
     */
    public function unblockUser(int $id)
    {
        $comment = Comment::with('user')->findOrFail($id);
        
        if ($comment->user) {
            $comment->user->update(['is_blocked' => false]);
            return response()->json(['message' => 'Đã gỡ khóa tài khoản người dùng']);
        }

        return response()->json(['message' => 'Không tìm thấy người dùng'], 404);
    }
}
