<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostReviewComment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class ReviewCommentController extends Controller
{
    /**
     * Get all review comments for a post
     */
    public function index(Request $request, $postId): JsonResponse
    {
        $post = Post::findOrFail($postId);
        
        $comments = $post->reviewComments()
            ->with(['user:id,name', 'resolver:id,name'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $comments]);
    }

    /**
     * Create a new review comment
     */
    public function store(Request $request, $postId): JsonResponse
    {
        $validated = $request->validate([
            'comment_id' => 'nullable|string',
            'from' => 'required|integer|min:0',
            'to' => 'required|integer|min:0|gte:from',
            'text' => 'required|string|min:1|max:1000',
        ]);

        $post = Post::findOrFail($postId);
        $user = $request->user();

        // Generate unique comment_id if not provided
        if (empty($validated['comment_id'])) {
            $validated['comment_id'] = 'cmt_' . Str::random(10) . '_' . time();
        }

        $comment = PostReviewComment::create([
            'post_id' => $post->id,
            'user_id' => $user->id,
            'comment_id' => $validated['comment_id'],
            'from' => $validated['from'],
            'to' => $validated['to'],
            'text' => $validated['text'],
            'status' => 'open',
        ]);

        $comment->load(['user:id,name']);

        return response()->json(['data' => $comment], 201);
    }

    /**
     * Update review comment status (resolve)
     */
    public function update(Request $request, $postId, $id): JsonResponse
    {
        $comment = PostReviewComment::where('post_id', $postId)->findOrFail($id);
        $user = $request->user();

        $validated = $request->validate([
            'status' => 'required|in:open,resolved',
            'text' => 'sometimes|string|min:1|max:1000',
        ]);

        $comment->status = $validated['status'];
        
        if (isset($validated['text'])) {
            $comment->text = $validated['text'];
        }

        if ($validated['status'] === 'resolved') {
            $comment->resolved_by = $user->id;
            $comment->resolved_at = now();
        } else {
            $comment->resolved_by = null;
            $comment->resolved_at = null;
        }

        $comment->save();
        $comment->load(['user:id,name', 'resolver:id,name']);

        return response()->json(['data' => $comment]);
    }

    /**
     * Delete review comment
     */
    public function destroy($postId, $id): JsonResponse
    {
        $comment = PostReviewComment::where('post_id', $postId)->findOrFail($id);
        $comment->delete();

        return response()->json(['message' => 'Đã xóa comment']);
    }
}
