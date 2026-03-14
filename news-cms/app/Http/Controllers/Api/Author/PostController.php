<?php

namespace App\Http\Controllers\Api\Author;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Http\Resources\Admin\PostListResource;
use App\Services\PostService;
use App\Services\AuditService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class PostController extends Controller
{
    protected $postService;

    public function __construct(PostService $postService)
    {
        $this->postService = $postService;
    }

    /**
     * List current author's posts
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $filters = $request->only(['status', 'q', 'category_id']);
        
        // Force filter by current user
        $query = Post::where('author_id', $user->id)
            ->with(['categories'])
            ->orderBy('updated_at', 'desc');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['q'])) {
            $query->where('title', 'like', '%' . $filters['q'] . '%');
        }

        if (!empty($filters['category_id'])) {
            $query->whereHas('categories', function ($q) use ($filters) {
                $q->where('categories.id', $filters['category_id']);
            });
        }

        $posts = $query->paginate($request->get('per_page', 10));

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
     * Show own post detail
     */
    public function show($id, Request $request): JsonResponse
    {
        $post = Post::with(['categories', 'approvalLogs.user'])->findOrFail($id);
        
        if ($post->author_id !== $request->user()->id) {
            return response()->json(['message' => 'Bạn không có quyền xem bài viết này'], 403);
        }

        return response()->json(['data' => $post]);
    }

    /**
     * Create own post
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string',
            'content' => 'required|string',
            'content_html' => 'nullable|string',
            'content_json' => 'nullable|json',
            'category_ids' => 'required|array',
            'category_ids.*' => 'exists:categories,id',
            'thumbnail' => 'nullable|string',
        ]);

        // If content_html not provided, use content
        if (empty($validated['content_html'])) {
            $validated['content_html'] = $validated['content'];
        }

        $validated['author_id'] = $request->user()->id;
        $validated['status'] = 'draft'; // Authors always start with draft

        $post = $this->postService->create($validated);

        // Audit log is handled in PostService (post.create)

        return response()->json(['data' => $post], 201);
    }

    /**
     * Update own post
     */
    public function update(Request $request, $id): JsonResponse
    {
        $post = Post::findOrFail($id);
        Gate::authorize('update', $post);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'summary' => 'nullable|string',
            'content' => 'sometimes|string',
            'content_html' => 'nullable|string',
            'content_json' => 'nullable|json',
            'category_ids' => 'sometimes|array',
            'category_ids.*' => 'exists:categories,id',
            'thumbnail' => 'nullable|string',
        ]);

        // If content_html not provided but content is, use content
        if (empty($validated['content_html']) && !empty($validated['content'])) {
            $validated['content_html'] = $validated['content'];
        }

        // Don't let author change status to published via update
        if (isset($validated['status'])) {
            unset($validated['status']);
        }

        $post = $this->postService->update($id, $validated);

        // Audit log is handled in PostService (post.update)

        return response()->json(['data' => $post]);
    }

    /**
     * Submit own post for review
     */
    public function submit($id, Request $request): JsonResponse
    {
        $post = Post::findOrFail($id);
        Gate::authorize('submit', $post);

        $user = $request->user();
        $this->postService->submit($post, $user);
        
        NotificationService::notifyAdmins('post_pending', [
            'post_id' => $post->id,
            'title' => $post->title,
            'submitted_by' => $user->name
        ]);

        // Audit log is handled in PostService (post.submit_review)

        return response()->json(['message' => 'Đã gửi duyệt bài viết', 'data' => $post]);
    }

    /**
     * Delete own post (only if draft or rejected)
     */
    public function destroy($id, Request $request): JsonResponse
    {
        $post = Post::findOrFail($id);
        Gate::authorize('delete', $post);
        
        $this->postService->delete($id);
        
        // Audit log is handled in PostService (post.delete)
        
        return response()->json(['message' => 'Đã xóa bài viết']);
    }
}
