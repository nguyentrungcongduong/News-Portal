<?php

namespace App\Services;

use App\Models\Post;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;

class PostService
{
    protected $versionService;

    public function __construct(PostVersionService $versionService)
    {
        $this->versionService = $versionService;
    }

    /**
     * Get list of posts with filters and pagination
     */
    public function getList(array $filters = [], int $perPage = 10)
    {
        $query = Post::query()->with(['author', 'categories']);

        // Filter by Status
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Search by Title
        if (!empty($filters['q'])) {
            $query->where('title', 'like', '%' . $filters['q'] . '%');
        }

        // Filter by Category
        if (!empty($filters['category_id'])) {
            $query->whereHas('categories', function (Builder $q) use ($filters) {
                $q->where('categories.id', $filters['category_id']);
            });
        }

        // Sort (Default: Newest Update)
        $query->orderBy('updated_at', 'desc');

        return $query->paginate($perPage);
    }

    /**
     * Get single post detail
     */
    public function getDetail($id)
    {
        return Post::with(['author', 'categories', 'approvalLogs.user', 'approver'])->findOrFail($id);
    }

    /**
     * Create new Post
     */
    public function create(array $data)
    {
        $user = auth()->user();
        
        return DB::transaction(function () use ($data, $user) {
            // Auto generate slug if not present
            if (empty($data['slug'])) {
                $data['slug'] = Str::slug($data['title']) . '-' . time();
            }

            // Create Post
            $post = Post::create($data);

            // Sync Categories
            if (!empty($data['category_ids'])) {
                $post->categories()->attach($data['category_ids']);
            }

            // Audit: post.create
            AuditService::log(
                $user,
                'post.create',
                $post,
                null,
                ['status' => $post->status, 'title' => $post->title]
            );

            return $post->load(['categories', 'author']);
        });
    }

    /**
     * Update existing Post
     */
    public function update($id, array $data)
    {
        $post = Post::findOrFail($id);
        $user = auth()->user() ?? $post->author;

        return DB::transaction(function () use ($post, $data, $user) {
            // Save before state for audit
            $before = [
                'status' => $post->status,
                'title' => $post->title,
                'content' => substr($post->content, 0, 100) . '...', // Truncate for audit
            ];

            // Save current state as a version before updating
            $this->versionService->createFromPost($post, $user);

            // Auto set published_at if status is changing to published
            if (isset($data['status']) && $data['status'] === 'published' && $post->status !== 'published') {
                if (empty($post->published_at)) {
                    $data['published_at'] = now();
                }
            }

            $post->update($data);

            // Sync Categories
            if (isset($data['category_ids'])) {
                $post->categories()->sync($data['category_ids']);
            }

            if ($post->status === 'published') {
                $this->clearPublicCache($post);
            }

            // Audit: post.update
            $after = [
                'status' => $post->status,
                'title' => $post->title,
                'content' => substr($post->content, 0, 100) . '...',
            ];
            
            AuditService::log(
                $user,
                'post.update',
                $post,
                $before,
                $after
            );

            return $post->load(['categories', 'author']);
        });
    }

    /**
     * Capture a version of the post (Wrapper for workflow actions)
     */
    public function captureVersion(Post $post)
    {
        $user = auth()->user() ?? $post->author;
        return $this->versionService->createFromPost($post, $user);
    }

    /**
     * Soft delete Post
     */
    public function delete($id)
    {
        $user = auth()->user();
        $post = Post::findOrFail($id);
        
        // Audit: post.delete (before delete)
        $before = [
            'status' => $post->status,
            'title' => $post->title,
            'deleted_at' => null,
        ];
        
        AuditService::log(
            $user,
            'post.delete',
            $post,
            $before,
            null
        );
        
        return $post->delete();
    }

    /**
     * Workflow: Submit for review
     */
    public function submit(Post $post, $user)
    {
        return DB::transaction(function () use ($post, $user) {
            $before = ['status' => $post->status];
            $post->update(['status' => 'pending']);
            $after = ['status' => 'pending'];
            
            $post->approvalLogs()->create([
                'user_id' => $user->id,
                'action' => 'submit',
                'note' => 'Gửi duyệt bài viết'
            ]);

            // Audit: post.submit_review
            AuditService::log(
                $user,
                'post.submit_review',
                $post,
                $before,
                $after
            );

            return $post;
        });
    }

    /**
     * Workflow: Approve (Editor)
     */
    public function approve(Post $post, $user, $note = null)
    {
        return DB::transaction(function () use ($post, $user, $note) {
            $before = [
                'status' => $post->status,
                'approved_by' => $post->approved_by,
                'approved_at' => $post->approved_at,
            ];
            
            $post->update([
                'status' => 'approved',
                'approved_by' => $user->id,
                'approved_at' => now()
            ]);
            
            $after = [
                'status' => 'approved',
                'approved_by' => $user->id,
                'approved_at' => now()->toDateTimeString(),
            ];
            
            $post->approvalLogs()->create([
                'user_id' => $user->id,
                'action' => 'approve',
                'note' => $note ?? 'Đã duyệt nội dung'
            ]);

            // Audit: post.approve
            AuditService::log(
                $user,
                'post.approve',
                $post,
                $before,
                $after
            );

            return $post;
        });
    }

    /**
     * Workflow: Reject
     */
    public function reject(Post $post, $user, $note)
    {
        return DB::transaction(function () use ($post, $user, $note) {
            $before = ['status' => $post->status];
            $post->update(['status' => 'rejected']);
            $after = ['status' => 'rejected', 'rejection_note' => $note];
            
            $post->approvalLogs()->create([
                'user_id' => $user->id,
                'action' => 'reject',
                'note' => $note
            ]);

            // Audit: post.reject
            AuditService::log(
                $user,
                'post.reject',
                $post,
                $before,
                $after
            );

            return $post;
        });
    }

    /**
     * Workflow: Publish (Admin)
     */
    public function publish(Post $post, $user)
    {
        return DB::transaction(function () use ($post, $user) {
            // Capture version before publishing
            $this->versionService->createFromPost($post, $user);

            $before = [
                'status' => $post->status,
                'published_at' => $post->published_at,
            ];
            
            $post->update([
                'status' => 'published',
                'published_at' => now()
            ]);
            
            $after = [
                'status' => 'published',
                'published_at' => now()->toDateTimeString(),
            ];
            
            $post->approvalLogs()->create([
                'user_id' => $user->id,
                'action' => 'publish',
                'note' => 'Đã xuất bản bài viết lên website'
            ]);

            // Audit: post.publish
            AuditService::log(
                $user,
                'post.publish',
                $post,
                $before,
                $after
            );

            // Clear Public Cache
            $this->clearPublicCache($post);

            return $post;
        });
    }

    /**
     * Clear public caches related to this post
     */
    protected function clearPublicCache(Post $post)
    {
        try {
            // Clear home page caches (first few pages)
            for ($i = 1; $i <= 5; $i++) {
                \Illuminate\Support\Facades\Cache::forget("posts.home.$i");
            }

            // Clear post detail cache
            \Illuminate\Support\Facades\Cache::forget("post.{$post->slug}");

            // Clear category caches
            foreach ($post->categories as $category) {
                for ($i = 1; $i <= 5; $i++) {
                    \Illuminate\Support\Facades\Cache::forget("category.{$category->slug}.posts.$i");
                }
            }
        } catch (\Exception $e) {
            // Silent fail
        }
    }
}
