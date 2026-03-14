<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;

class AdController extends Controller
{
    /**
     * Get active ads for a specific position.
     */
    public function index(Request $request)
    {
        $position = $request->get('position');

        $query = Ad::where('status', 'active');

        if ($position) {
            $query->where('position', $position);
        }

        $ads = $query->get()
            ->filter(function ($ad) {
                return $ad->isActive();
            })
            ->values();

        return response()->json($ads);
    }

    /**
     * Track an ad click.
     */
    public function trackClick(int $id)
    {
        $ad = Ad::findOrFail($id);
        
        try {
            Redis::incr("ads:{$id}:clicks");
        } catch (\Throwable $e) {
            $ad->increment('clicks');
        }

        return response()->json(['message' => 'Click tracked']);
    }
}
