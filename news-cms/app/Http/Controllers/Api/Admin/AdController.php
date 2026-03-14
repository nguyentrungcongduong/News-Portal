<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use Illuminate\Http\Request;

class AdController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $ads = Ad::latest()->paginate(10);
        return response()->json($ads);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'             => 'required|string|max:255',
            'position'         => 'required|string',
            'type'             => 'required|in:image,html',
            'html_code'        => 'nullable|string',
            'image_url'        => 'nullable|string',
            'link'             => 'nullable|url',
            'quota_impressions'=> 'nullable|integer',
            'quota_clicks'     => 'nullable|integer',
            'status'           => 'required|in:draft,active,paused,stopped',
            'start_at'         => 'nullable|date',
            'end_at'           => 'nullable|date|after_or_equal:start_at',
        ]);

        $ad = Ad::create($data);

        return response()->json([
            'message' => 'Tạo quảng cáo thành công',
            'data' => $ad
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $ad = Ad::findOrFail($id);
        return response()->json($ad);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id)
    {
        $ad = Ad::findOrFail($id);

        $data = $request->validate([
            'name'             => 'required|string|max:255',
            'position'         => 'required|string',
            'type'             => 'required|in:image,html',
            'html_code'        => 'nullable|string',
            'image_url'        => 'nullable|string',
            'link'             => 'nullable|url',
            'quota_impressions'=> 'nullable|integer',
            'quota_clicks'     => 'nullable|integer',
            'status'           => 'required|in:draft,active,paused,stopped',
            'start_at'         => 'nullable|date',
            'end_at'           => 'nullable|date|after_or_equal:start_at',
        ]);

        $ad->update($data);

        return response()->json([
            'message' => 'Cập nhật quảng cáo thành công',
            'data' => $ad
        ]);
    }

    /**
     * Update ad status.
     */
    public function updateStatus(Request $request, int $id)
    {
        $request->validate(['status' => 'required|in:draft,active,paused,stopped']);
        
        $ad = Ad::findOrFail($id);
        $ad->update(['status' => $request->status]);

        return response()->json(['message' => 'Đã cập nhật trạng thái quảng cáo']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id)
    {
        $ad = Ad::findOrFail($id);
        $ad->delete();

        return response()->json(['message' => 'Đã xóa quảng cáo']);
    }
}
