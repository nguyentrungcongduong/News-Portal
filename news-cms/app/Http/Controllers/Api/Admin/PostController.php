<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\PostService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

use App\Http\Resources\Admin\PostListResource;
use App\Services\AuditService;
use Illuminate\Support\Facades\Gate;

class PostController extends Controller
{
    protected $postService;

    public function __construct(PostService $postService)
    {
        $this->postService = $postService;
    }

    /**
     * list posts
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'q', 'category_id']);
        $posts = $this->postService->getList($filters);

        return response()->json([
            'data' => PostListResource::collection($posts->items()),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'total' => $posts->total(),
                'per_page' => $posts->perPage(),
            ]
        ]);
    }

    /**
     * Show detail
     */
    public function show($id): JsonResponse
    {
        \Illuminate\Support\Facades\Log::info('PostController::show() called', [
            'post_id' => $id,
            'user_id' => auth()->id(),
            'user_email' => auth()->user()->email ?? null,
            'user_role' => auth()->user()->role ?? null,
        ]);

        try {
            $post = $this->postService->getDetail($id);
            \Illuminate\Support\Facades\Log::info('Post retrieved successfully', ['post_id' => $post->id]);
            return response()->json(['data' => $post]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error in PostController::show()', [
                'post_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Create Post
     */
    public function store(Request $request): JsonResponse
    {
        // Simple validation here, better to use FormRequest in production
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string',
            'content' => 'required|string',
            'status' => ['required', Rule::in(['draft', 'pending', 'approved', 'published', 'rejected', 'archived'])],
            'category_ids' => 'required|array',
            'category_ids.*' => 'exists:categories,id',
            'thumbnail' => 'nullable|string',
        ]);

        // Auto assign author (current logged in user)
        // For now, let's assume raw ID or use Auth::id() later
        // $validated['author_id'] = $request->user()->id; 
        // Fallback for dev without auth middleware:
        $validated['author_id'] = $validated['author_id'] ?? 1; // Default Admin

        $post = $this->postService->create($validated);

        // Audit log is handled in PostService

        return response()->json(['data' => $post], 201);
    }

    /**
     * Update Post
     */
    public function update(Request $request, $id): JsonResponse
    {
        \Illuminate\Support\Facades\Log::info('PostController::update() called', [
            'post_id' => $id,
            'user_id' => auth()->id(),
            'user_email' => auth()->user()->email ?? null,
            'user_role' => auth()->user()->role ?? null,
            'user_tenant_id' => auth()->user()->tenant_id ?? null,
            'app_has_tenant' => app()->has('tenant'),
            'tenant_id' => app()->has('tenant') ? app('tenant')->id : null,
        ]);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'summary' => 'nullable|string',
            'content' => 'sometimes|string',
            'status' => ['sometimes', Rule::in(['draft', 'pending', 'published', 'archived'])],
            'category_ids' => 'sometimes|array',
            'category_ids.*' => 'exists:categories,id',
            'thumbnail' => 'nullable|string',
        ]);

        try {
            $post = \App\Models\Post::findOrFail($id);
            \Illuminate\Support\Facades\Log::info('Post found successfully', [
                'post_id' => $post->id,
                'post_tenant_id' => $post->tenant_id,
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Post not found', [
                'post_id' => $id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }

        // Security check: Only check publish permission if user is CHANGING status TO published
        // If the post is already published and user is just editing it, check update permission
        try {
            $isChangingToPublished = isset($validated['status']) 
                && $validated['status'] === 'published' 
                && $post->status !== 'published';
            
            if ($isChangingToPublished) {
                \Illuminate\Support\Facades\Log::info('Checking publish permission (transitioning to published)');
                Gate::authorize('publish', $post);
            } else {
                \Illuminate\Support\Facades\Log::info('Checking update permission', [
                    'current_status' => $post->status,
                    'new_status' => $validated['status'] ?? 'not changed',
                ]);
                Gate::authorize('update', $post);
            }
            \Illuminate\Support\Facades\Log::info('Authorization passed');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Authorization failed', [
                'error' => $e->getMessage(),
                'user_role' => auth()->user()->role ?? null,
                'post_status' => $post->status,
                'requested_status' => $validated['status'] ?? 'not changed',
            ]);
            throw $e;
        }

        $post = $this->postService->update($id, $validated);

        return response()->json(['data' => $post]);
    }

    /**
     * Delete Post
     */
    public function destroy($id): JsonResponse
    {
        $post = \App\Models\Post::findOrFail($id);
        Gate::authorize('delete', $post);
        
        $this->postService->delete($id);
        
        // Audit log is handled in PostService (post.delete)
        
        return response()->json(['message' => 'Post deleted successfully']);
    }

    /**
     * Submit for Review
     */
    public function submit($id, Request $request): JsonResponse
    {
        $post = \App\Models\Post::findOrFail($id);
        Gate::authorize('submit', $post);

        if ($post->status !== 'draft' && $post->status !== 'rejected') {
            return response()->json(['message' => 'Trạng thái bài viết không hợp lệ để gửi duyệt'], 422);
        }

        $user = $request->user() ?? \App\Models\User::first();
        $this->postService->submit($post, $user);
        
        // Notify Admins
        \App\Services\NotificationService::notifyAdmins('post_pending', [
            'post_id' => $post->id,
            'title' => $post->title,
            'submitted_by' => $user->name
        ]);

        AuditService::log(null, 'submit_post', $post, null, ['from_status' => 'draft', 'to_status' => 'pending']);

        return response()->json(['message' => 'Đã gửi duyệt bài viết', 'data' => $post]);
    }

    /**
     * Approve (Editor)
     */
    public function approve($id, Request $request): JsonResponse
    {
        $post = \App\Models\Post::findOrFail($id);
        Gate::authorize('approve', $post);

        if ($post->status !== 'pending') {
            return response()->json(['message' => 'Chỉ có thể duyệt bài đang chờ'], 422);
        }

        $user = $request->user() ?? \App\Models\User::first();
        $this->postService->approve($post, $user, $request->note);

        // Notify Admins (Editor đã approve, cần Admin publish)
        \App\Services\NotificationService::notifyAdmins('post_approved', [
            'post_id' => $post->id,
            'title' => $post->title,
            'approved_by' => $user->name,
            'author_name' => $post->author->name ?? 'N/A',
        ]);

        // Audit log is handled in PostService (post.approve)

        return response()->json(['message' => 'Đã duyệt nội dung bài viết', 'data' => $post]);
    }

    /**
     * Reject (Editor/Admin)
     */
    public function reject($id, Request $request): JsonResponse
    {
        $request->validate(['note' => 'required|string']);
        $post = \App\Models\Post::findOrFail($id);
        Gate::authorize('approve', $post); // Reusing approve check or specific reject if needed

        $user = $request->user() ?? \App\Models\User::first();
        $this->postService->reject($post, $user, $request->note);

        // Notify Author về rejection
        \App\Services\NotificationService::create([
            'user_id' => $post->author_id,
            'type' => 'post_rejected',
            'title' => 'Bài viết bị từ chối',
            'message' => "Bài viết \"{$post->title}\" của bạn đã bị từ chối. Lý do: {$request->note}",
            'data' => [
                'post_id' => $post->id,
                'title' => $post->title,
                'reason' => $request->note,
                'rejected_by' => $user->name,
            ],
        ]);

        // Audit log is handled in PostService (post.reject)

        return response()->json(['message' => 'Đã từ chối bài viết', 'data' => $post]);
    }

    /**
     * Publish (Admin)
     */
    public function publish($id, Request $request): JsonResponse
    {
        $post = \App\Models\Post::findOrFail($id);
        Gate::authorize('publish', $post);

        if ($post->status !== 'approved') {
            return response()->json(['message' => 'Chỉ bài viết đã duyệt mới có thể xuất bản'], 422);
        }

        $user = $request->user() ?? \App\Models\User::first();
        $this->postService->publish($post, $user);

        // Notify Admins
        \App\Services\NotificationService::notifyAdmins('post_published', [
            'post_id' => $post->id,
            'title' => $post->title,
            'published_by' => $user->name
        ]);

        // Audit log is handled in PostService (post.publish)

        return response()->json(['message' => 'Đã xuất bản bài viết thành công!', 'data' => $post]);
    }

    /**
     * Archive Post
     */
    public function archive($id, Request $request): JsonResponse
    {
        $post = \App\Models\Post::findOrFail($id);
        Gate::authorize('archive', $post);

        if ($post->status !== 'published') {
            return response()->json(['message' => 'Chỉ bài viết đang công khai mới có thể gỡ bài'], 422);
        }

        $user = $request->user() ?? \App\Models\User::first();
        $post->update(['status' => 'archived']);
        
        $post->approvalLogs()->create([
            'user_id' => $user->id,
            'action' => 'archive',
            'note' => 'Đã gỡ bài viết'
        ]);

        AuditService::log(null, 'archive_post', $post, null, ['status' => 'archived']);

        return response()->json(['message' => 'Đã gỡ bài viết và chuyển vào lưu trữ', 'data' => $post]);
    }

    /**
     * Mark/Unmark as Breaking News
     */
    public function toggleBreaking($id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'is_breaking' => 'required|boolean',
            'breaking_until' => 'nullable|date|after:now',
        ]);

        $post = \App\Models\Post::findOrFail($id);
        
        if ($post->status !== 'published' && $validated['is_breaking']) {
            return response()->json(['message' => 'Chỉ bài viết đã xuất bản mới có thể thành Tin nóng'], 422);
        }

        $post->update($validated);

        if ($post->is_breaking) {
            $expireText = $post->breaking_until ? $post->breaking_until->format('H:i d/m/Y') : 'vô thời hạn';
            \App\Services\NotificationService::notifyAdmins('system_alert', [
                'title' => 'TIN NÓNG MỚI',
                'reason' => "Bài viết '{$post->title}' đã được set là Tin nóng đến {$expireText}",
                'post_id' => $post->id
            ]);
        }

        return response()->json([
            'message' => $post->is_breaking ? 'Đã thiết lập Tin nóng thành công' : 'Đã gỡ trạng thái Tin nóng',
            'data' => $post
        ]);
    }
}
