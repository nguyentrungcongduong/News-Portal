<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class MenuController extends Controller
{
    /**
     * Display a listing of menus.
     */
    public function index()
    {
        $menus = Menu::withCount('items')->get();
        return response()->json($menus);
    }

    /**
     * Store a newly created menu.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:100|unique:menus,location',
            'status' => 'boolean',
        ]);

        $menu = Menu::create($validated);
        $this->clearMenuCache($menu->location);

        return response()->json([
            'message' => 'Menu created successfully',
            'menu' => $menu
        ], 201);
    }

    /**
     * Display the specified menu with its items.
     */
    public function show($id)
    {
        $menu = Menu::with(['items.linkable'])->findOrFail($id);
        return response()->json($menu);
    }

    /**
     * Update the specified menu.
     */
    public function update(Request $request, $id)
    {
        $menu = Menu::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'location' => 'nullable|string|max:100|unique:menus,location,' . $id,
            'status' => 'boolean',
        ]);

        $menu->update($validated);
        $this->clearMenuCache($menu->location);

        return response()->json([
            'message' => 'Menu updated successfully',
            'menu' => $menu
        ]);
    }

    /**
     * Remove the specified menu.
     */
    public function destroy($id)
    {
        $menu = Menu::findOrFail($id);
        $location = $menu->location;
        $menu->delete();
        $this->clearMenuCache($location);

        return response()->json([
            'message' => 'Menu deleted successfully'
        ]);
    }

    /**
     * Save/Update menu items in bulk (NESTED STRUCTURE).
     * EXPECTS: Nested JSON tree of items.
     */
    public function updateItems(Request $request, $id)
    {
        $menu = Menu::findOrFail($id);
        $items = $request->input('items', []);

        DB::transaction(function () use ($menu, $items) {
            // 1. Get all IDs sent from frontend to handle deletions
            $sentIds = $this->collectIds($items);
            
            // 2. Delete items not in the list (orphan removal)
            // Filter out 'new_' IDs as they are not in DB yet
            $existingIds = array_filter($sentIds, function($val) {
                return Is_numeric($val);
            });
            
            $menu->items()->whereNotIn('id', $existingIds)->delete();

            // 3. Upsert items recursively
            $this->syncItems($menu->id, $items, null);
        });

        $this->clearMenuCache($menu->location);

        return response()->json([
            'message' => 'Menu items updated successfully',
            'items' => $menu->items()->orderBy('order')->get() // Return flat list or re-fetched tree
        ]);
    }

    /**
     * Recursively collect IDs from nested items
     */
    private function collectIds($items) {
        $ids = [];
        foreach ($items as $item) {
            if (isset($item['id'])) {
                $ids[] = $item['id'];
            }
            if (!empty($item['children'])) {
                $ids = array_merge($ids, $this->collectIds($item['children']));
            }
        }
        return $ids;
    }

    /**
     * Recursively sync items
     */
    private function syncItems($menuId, $items, $parentId)
    {
        foreach ($items as $index => $itemData) {
            // Check if ID is new (string starting with 'new_') or existing (numeric)
            $paramId = (isset($itemData['id']) && is_numeric($itemData['id'])) ? $itemData['id'] : null;
            
            $attributes = [
                'menu_id' => $menuId,
                'parent_id' => $parentId,
                'title' => $itemData['title'],
                'type' => $itemData['type'] ?? 'custom',
                'url' => $itemData['url'] ?? null,
                'target' => $itemData['target'] ?? '_self',
                'icon' => $itemData['icon'] ?? null,
                'order' => $index,
                'status' => $itemData['status'] ?? true,
            ];

            // Handle Linkable
            if (isset($itemData['reference_id'])) {
                $attributes['linkable_id'] = $itemData['reference_id'];
                
                if ($attributes['type'] === 'page') {
                    $attributes['linkable_type'] = \App\Models\Page::class;
                } elseif ($attributes['type'] === 'category') {
                    $attributes['linkable_type'] = \App\Models\Category::class;
                } elseif ($attributes['type'] === 'post') {
                    $attributes['linkable_type'] = \App\Models\Post::class;
                }
            } else {
                 // Reset if needed, but only if explicit (or always reset if type != linkable)
                 if ($attributes['type'] === 'custom') {
                    $attributes['linkable_id'] = null;
                    $attributes['linkable_type'] = null;
                 }
            }

            $item = MenuItem::updateOrCreate(
                ['id' => $paramId],
                $attributes
            );

            if (!empty($itemData['children'])) {
                $this->syncItems($menuId, $itemData['children'], $item->id);
            }
        }
    }

    /**
     * Delete a specific menu item.
     */
    public function destroyItem($id)
    {
        $item = MenuItem::findOrFail($id);
        $item->delete();

        return response()->json(['message' => 'Item deleted']);
    }

    /**
     * Clear the public menu cache for a specific location.
     */
    private function clearMenuCache($location)
    {
        if (!$location) return;
        
        // This is a bit tricky with multiple tenants, 
        // but clearing 'global' and any common keys is a start.
        // For a full solution, we might need to tag the cache or loop through tenants.
        $tenantId = app()->has('tenant') ? app('tenant')->id : 'global';
        Cache::forget("public_menu_{$tenantId}_{$location}");
        Cache::forget("public_menu_global_{$location}"); // Also clear global just in case
        
        // If we want to be absolute:
        // Cache::flush(); // Too aggressive
    }
}
