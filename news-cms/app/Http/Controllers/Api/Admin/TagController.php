<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TagController extends Controller
{
    /**
     * Display a listing of the tags.
     */
    public function index(Request $request)
    {
        $query = Tag::query();

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by featured
        if ($request->has('is_featured')) {
            $query->where('is_featured', $request->boolean('is_featured'));
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $allowedSorts = ['name', 'slug', 'post_count', 'created_at', 'is_featured'];
        
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder === 'asc' ? 'asc' : 'desc');
        }

        // Pagination
        $perPage = min($request->get('per_page', 15), 100);
        $tags = $query->paginate($perPage);

        return response()->json($tags);
    }

    /**
     * Store a newly created tag.
     */
    public function store(Request $request)
    {
        $tenantId = $request->header('X-Tenant-ID') ?? app('tenant')?->id;

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'slug' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('tags')->where(function ($query) use ($tenantId) {
                    return $query->where('tenant_id', $tenantId);
                })
            ],
            'description' => 'nullable|string|max:500',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'icon' => 'nullable|string|max:50',
            'meta' => 'nullable|array',
            'meta.title' => 'nullable|string|max:70',
            'meta.description' => 'nullable|string|max:160',
            'meta.keywords' => 'nullable|string|max:255',
            'is_featured' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        $data['tenant_id'] = $tenantId;

        // Check for duplicate slug
        $existingTag = Tag::where('tenant_id', $tenantId)
                          ->where('slug', $data['slug'])
                          ->first();
        
        if ($existingTag) {
            return response()->json([
                'errors' => ['slug' => ['Tag slug already exists.']]
            ], 422);
        }

        $tag = Tag::create($data);

        return response()->json([
            'message' => 'Tag created successfully.',
            'tag' => $tag
        ], 201);
    }

    /**
     * Display the specified tag.
     */
    public function show(Tag $tag)
    {
        $tag->load(['posts' => function ($query) {
            $query->select('posts.id', 'title', 'slug', 'status', 'published_at')
                  ->orderByDesc('published_at')
                  ->limit(10);
        }]);

        return response()->json($tag);
    }

    /**
     * Update the specified tag.
     */
    public function update(Request $request, Tag $tag)
    {
        $tenantId = $request->header('X-Tenant-ID') ?? app('tenant')?->id;

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:100',
            'slug' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('tags')->where(function ($query) use ($tenantId) {
                    return $query->where('tenant_id', $tenantId);
                })->ignore($tag->id)
            ],
            'description' => 'nullable|string|max:500',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'icon' => 'nullable|string|max:50',
            'meta' => 'nullable|array',
            'meta.title' => 'nullable|string|max:70',
            'meta.description' => 'nullable|string|max:160',
            'meta.keywords' => 'nullable|string|max:255',
            'is_featured' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tag->update($validator->validated());

        return response()->json([
            'message' => 'Tag updated successfully.',
            'tag' => $tag->fresh()
        ]);
    }

    /**
     * Remove the specified tag.
     */
    public function destroy(Tag $tag)
    {
        // Detach from all posts first
        $tag->posts()->detach();
        
        $tag->delete();

        return response()->json([
            'message' => 'Tag deleted successfully.'
        ]);
    }

    /**
     * Bulk delete tags.
     */
    public function bulkDestroy(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:tags,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tenantId = $request->header('X-Tenant-ID') ?? app('tenant')?->id;

        $deleted = Tag::where('tenant_id', $tenantId)
                      ->whereIn('id', $request->ids)
                      ->delete();

        return response()->json([
            'message' => "{$deleted} tag(s) deleted successfully."
        ]);
    }

    /**
     * Toggle featured status.
     */
    public function toggleFeatured(Tag $tag)
    {
        $tag->update(['is_featured' => !$tag->is_featured]);

        return response()->json([
            'message' => 'Tag featured status updated.',
            'tag' => $tag->fresh()
        ]);
    }

    /**
     * Merge tags - transfer posts from source tags to target tag.
     */
    public function merge(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'target_tag_id' => 'required|integer|exists:tags,id',
            'source_tag_ids' => 'required|array|min:1',
            'source_tag_ids.*' => 'integer|exists:tags,id|different:target_tag_id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $targetTag = Tag::findOrFail($request->target_tag_id);
        $sourceTags = Tag::whereIn('id', $request->source_tag_ids)->get();

        $transferredCount = 0;

        foreach ($sourceTags as $sourceTag) {
            // Get posts from source tag
            $postIds = $sourceTag->posts()->pluck('posts.id')->toArray();
            
            // Attach to target tag (ignore duplicates)
            foreach ($postIds as $postId) {
                try {
                    $targetTag->posts()->attach($postId);
                    $transferredCount++;
                } catch (\Exception $e) {
                    // Post already attached to target tag
                }
            }
            
            // Detach all posts from source tag
            $sourceTag->posts()->detach();
            
            // Delete source tag
            $sourceTag->delete();
        }

        // Update target tag post count
        $targetTag->updatePostCount();

        return response()->json([
            'message' => 'Tags merged successfully.',
            'transferred_posts' => $transferredCount,
            'deleted_tags' => count($request->source_tag_ids),
            'tag' => $targetTag->fresh()
        ]);
    }

    /**
     * Get popular tags.
     */
    public function popular(Request $request)
    {
        $limit = min($request->get('limit', 20), 50);

        $tags = Tag::popular()
                   ->take($limit)
                   ->get(['id', 'name', 'slug', 'color', 'icon', 'post_count']);

        return response()->json($tags);
    }

    /**
     * Recalculate post counts for all tags.
     */
    public function recalculateCounts()
    {
        $tenantId = app('tenant')?->id;
        
        $tags = Tag::where('tenant_id', $tenantId)->get();
        
        foreach ($tags as $tag) {
            $tag->updatePostCount();
        }

        return response()->json([
            'message' => 'Post counts recalculated for ' . $tags->count() . ' tags.'
        ]);
    }

    /**
     * Search tags for autocomplete.
     */
    public function search(Request $request)
    {
        $query = $request->get('q', '');
        
        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $tags = Tag::where('name', 'like', "%{$query}%")
                   ->orWhere('slug', 'like', "%{$query}%")
                   ->orderByDesc('post_count')
                   ->limit(10)
                   ->get(['id', 'name', 'slug', 'color', 'post_count']);

        return response()->json($tags);
    }
}
