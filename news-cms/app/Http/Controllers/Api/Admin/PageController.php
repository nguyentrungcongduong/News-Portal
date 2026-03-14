<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\PageVersion;
use App\Services\BlockValidationService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PageController extends Controller
{
    protected $validator;

    public function __construct(BlockValidationService $validator)
    {
        $this->validator = $validator;
    }

    /**
     * List all pages
     */
    public function index(Request $request)
    {
        $query = Page::orderBy('updated_at', 'desc');

        // Search by title or slug
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                  ->orWhere('slug', 'ilike', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $pages = $query->paginate($request->per_page ?? 20);
        return response()->json($pages);
    }

    /**
     * Get a single page with versions
     */
    public function show($id)
    {
        $page = Page::with('versions')->findOrFail($id);
        return response()->json($page);
    }

    /**
     * Create a new page
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'locale' => 'string|in:vi,en',
            'status' => 'string|in:draft,published',
            'menu_visible' => 'boolean',
            'seo' => 'nullable|array',
            'seo.title' => 'nullable|string|max:255',
            'seo.description' => 'nullable|string|max:500',
            'seo.keywords' => 'nullable|string|max:500',
            'seo.canonical_url' => 'nullable|url',
            'seo.og_image' => 'nullable|string',
            'blocks' => 'nullable|array',
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Ensure unique slug
        $baseSlug = $validated['slug'];
        $counter = 1;
        while (Page::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $baseSlug . '-' . $counter++;
        }

        // Validate blocks
        if (!empty($validated['blocks'])) {
            $errors = $this->validator->validateBlocks($validated['blocks']);
            if (!empty($errors)) {
                return response()->json(['errors' => $errors], 422);
            }
        }

        $page = Page::create($validated);

        // Create initial version
        PageVersion::create([
            'page_id' => $page->id,
            'version' => 1,
            'snapshot' => [
                'title' => $page->title,
                'seo' => $page->seo,
                'blocks' => $page->blocks,
            ],
            'user_id' => auth()->id(),
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Page created successfully',
            'page' => $page
        ], 201);
    }

    /**
     * Update a page (auto-creates a new version snapshot)
     */
    public function update(Request $request, $id)
    {
        $page = Page::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255',
            'locale' => 'sometimes|string|in:vi,en',
            'status' => 'sometimes|string|in:draft,published',
            'menu_visible' => 'sometimes|boolean',
            'seo' => 'nullable|array',
            'blocks' => 'nullable|array',
        ]);

        // Validate blocks if provided
        if (isset($validated['blocks'])) {
            $errors = $this->validator->validateBlocks($validated['blocks']);
            if (!empty($errors)) {
                return response()->json(['errors' => $errors], 422);
            }
        }

        // Check if content changed → create version snapshot
        $contentChanged = isset($validated['blocks']) || isset($validated['seo']) || isset($validated['title']);

        $page->update($validated);
        $page->refresh();

        if ($contentChanged) {
            PageVersion::create([
                'page_id' => $page->id,
                'version' => $page->version ?? 1,
                'snapshot' => [
                    'title' => $page->title,
                    'seo' => $page->seo,
                    'blocks' => $page->blocks,
                ],
                'user_id' => auth()->id(),
                'created_at' => now(),
            ]);
        }

        return response()->json([
            'message' => 'Page updated successfully',
            'page' => $page->fresh()
        ]);
    }

    /**
     * Delete a page
     */
    public function destroy($id)
    {
        $page = Page::findOrFail($id);
        $page->delete();

        return response()->json([
            'message' => 'Page deleted successfully'
        ]);
    }

    /**
     * Duplicate / Clone a page
     */
    public function duplicate($id)
    {
        $original = Page::findOrFail($id);

        // Generate unique slug
        $baseSlug = $original->slug . '-copy';
        $slug = $baseSlug;
        $counter = 1;
        while (Page::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter++;
        }

        // Clone page with new IDs for blocks
        $newBlocks = collect($original->blocks)->map(function ($block) {
            $block['id'] = Str::uuid()->toString();
            return $block;
        })->toArray();

        $newPage = Page::create([
            'title' => $original->title . ' (Copy)',
            'slug' => $slug,
            'locale' => $original->locale,
            'status' => 'draft', // Always start as draft
            'menu_visible' => false,
            'seo' => $original->seo,
            'blocks' => $newBlocks,
        ]);

        // Create initial version for the clone
        PageVersion::create([
            'page_id' => $newPage->id,
            'version' => 1,
            'snapshot' => [
                'title' => $newPage->title,
                'seo' => $newPage->seo,
                'blocks' => $newPage->blocks,
            ],
            'user_id' => auth()->id(),
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Page duplicated successfully',
            'page' => $newPage
        ], 201);
    }

    /**
     * Toggle publish status
     */
    public function toggleStatus($id)
    {
        $page = Page::findOrFail($id);
        $newStatus = $page->status === 'published' ? 'draft' : 'published';
        $page->update(['status' => $newStatus]);

        return response()->json([
            'message' => $newStatus === 'published' ? 'Page published' : 'Page unpublished',
            'page' => $page->fresh()
        ]);
    }

    /**
     * Get all versions of a page
     */
    public function versions($id)
    {
        $page = Page::findOrFail($id);
        $versions = $page->versions()->with('user:id,name')->get();

        return response()->json($versions);
    }

    /**
     * Restore a specific version
     */
    public function restore(Request $request, $pageId, $versionId)
    {
        $page = Page::findOrFail($pageId);
        $version = PageVersion::where('page_id', $pageId)
            ->where('id', $versionId)
            ->firstOrFail();

        $snapshot = $version->snapshot;

        // Restore from snapshot
        $page->update([
            'title' => $snapshot['title'],
            'seo' => $snapshot['seo'],
            'blocks' => $snapshot['blocks'],
        ]);

        return response()->json([
            'message' => "Page restored to version {$version->version}",
            'page' => $page->fresh()
        ]);
    }

    /**
     * Get allowed block types with metadata
     */
    public function blockTypes()
    {
        return response()->json([
            'types' => $this->validator->getAllowedBlockTypes()
        ]);
    }
}
