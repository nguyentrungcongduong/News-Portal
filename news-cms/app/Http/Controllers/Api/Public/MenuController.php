<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class MenuController extends Controller
{
    /**
     * Get a specific menu by its location (e.g., 'header', 'footer').
     * Returns a nested tree structure.
     */
    public function showByLocation($location)
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : 'global';
        $cacheKey = "public_menu_{$tenantId}_{$location}";

        return Cache::remember($cacheKey, 3600, function () use ($location) {
            $menu = Menu::where('location', $location)
                ->where('status', true)
                ->first();

            if (!$menu) {
                return response()->json(['items' => []]);
            }

            // Get all items flat
            $items = $menu->items()
                ->where('status', true)
                ->orderBy('order')
                ->with('linkable')
                ->get();

            // Build Tree using efficient GroupBy method
            $tree = $this->buildTree($items);

            return response()->json([
                'id' => $menu->id,
                'name' => $menu->name,
                'location' => $menu->location,
                'items' => $tree
            ]);
        });
    }

    /**
     * Build nested tree from flat collection
     */
    private function buildTree($items)
    {
        // Group items by parent_id
        $grouped = $items->groupBy('parent_id');

        // Recursive function to attach children
        $attachChildren = function ($items) use ($grouped, &$attachChildren) {
            foreach ($items as $item) {
                // Determine URL for frontend convenience
                $item->setAttribute('url', $item->link); 
                
                // Get children for this item
                $children = $grouped->get($item->id);
                
                if ($children && $children->count() > 0) {
                    $item->setRelation('children', $children);
                    // Recursively attach children's children
                    $attachChildren($children);
                } else {
                    $item->setRelation('children', collect([]));
                }
            }
        };

        // Start with root items (parent_id is null)
        $rootItems = $grouped->get(null, collect([]));
        
        // Attach children starting from root
        $attachChildren($rootItems);

        return $rootItems;
    }
}
