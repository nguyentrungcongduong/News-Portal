<?php

namespace App\Http\Controllers\Api;

use App\Models\ContentLock;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ContentLockController extends Controller
{
    /**
     * Acquire lock khi vào edit page
     */
    public function acquire(Request $request)
    {
        $validated = $request->validate([
            'lockable_type' => 'required|string',
            'lockable_id' => 'required|integer',
        ]);

        $result = ContentLock::acquire(
            $validated['lockable_type'],
            $validated['lockable_id'],
            $request->user()->id
        );

        return response()->json($result, $result['acquired'] ? 200 : 409);
    }

    /**
     * Release lock khi rời khỏi edit
     */
    public function release(Request $request)
    {
        $validated = $request->validate([
            'lockable_type' => 'required|string',
            'lockable_id' => 'required|integer',
        ]);

        $result = ContentLock::release(
            $validated['lockable_type'],
            $validated['lockable_id'],
            $request->user()->id
        );

        return response()->json($result);
    }

    /**
     * Check lock status (polling / init check)
     */
    public function check(Request $request)
    {
        $validated = $request->validate([
            'lockable_type' => 'required|string',
            'lockable_id' => 'required|integer',
        ]);

        $result = ContentLock::checkStatus(
            $validated['lockable_type'],
            $validated['lockable_id']
        );

        return response()->json($result);
    }

    /**
     * Renew lock (keep-alive)
     */
    public function renew(Request $request)
    {
        $validated = $request->validate([
            'lockable_type' => 'required|string',
            'lockable_id' => 'required|integer',
        ]);

        $result = ContentLock::acquire(
            $validated['lockable_type'],
            $validated['lockable_id'],
            $request->user()->id
        );

        return response()->json($result);
    }

    /**
     * Force unlock (Admin only)
     */
    public function forceUnlock(Request $request)
    {
        $this->authorize('admin');

        $validated = $request->validate([
            'lockable_type' => 'required|string',
            'lockable_id' => 'required|integer',
        ]);

        $result = ContentLock::forceUnlock(
            $validated['lockable_type'],
            $validated['lockable_id'],
            $request->user()->id
        );

        return response()->json($result);
    }
}
