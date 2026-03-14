<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AnnouncementController extends Controller
{
    /**
     * Get active announcements by type.
     */
    public function index(Request $request)
    {
        $type = $request->get('type', 'breaking');

        return Cache::remember("public.announcements.$type", 60, function () use ($type) {
            return Announcement::where('type', $type)
                ->where('status', 'active')
                ->get()
                ->filter(function ($n) {
                    return $n->isActive();
                })
                ->values();
        });
    }

    /**
     * Get combined breaking news (Posts + Announcements)
     */
    public function breakingNews()
    {
        // Cache shorter time (e.g. 30s) or clear on update
        return Cache::remember('public_breaking_news_combined', 30, function () {
            // 1. Manual Announcements
            $announcements = Announcement::active()
                ->where('type', 'breaking')
                ->get(); 

            // 2. Breaking News from dedicated table
            $breakingItems = \App\Models\BreakingNews::active()
                ->with('post:id,title,slug,published_at')
                ->orderBy('priority', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();
            
            // Transform and combine
            $data = collect();
            
            // From Breaking News Table
            foreach ($breakingItems as $item) {
                if ($item->post) {
                    $data->push([
                        'id' => 'breaking-' . $item->id,
                        'title' => $item->post->title,
                        'slug' => $item->post->slug,
                        'link' => '/post/' . $item->post->slug,
                        'published_at' => $item->post->published_at,
                        'priority' => $item->priority
                    ]);
                }
            }
            
            // From Manual Announcements
            foreach ($announcements as $ann) {
                $data->push([
                    'id' => 'ann-' . $ann->id,
                    'title' => $ann->title,
                    'slug' => null,
                    'link' => $ann->link,
                    'published_at' => $ann->start_at ?? $ann->created_at,
                    'priority' => 0 // Default priority for manual text
                ]);
            }
            
            // Final Sort by Priority (higher first) then Date
            return $data->sortByDesc('priority')->values();
        });
    }
}
