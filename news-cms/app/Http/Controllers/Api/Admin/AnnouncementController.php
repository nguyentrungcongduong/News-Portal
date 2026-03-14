<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $announcements = Announcement::latest()->paginate($request->get('per_page', 10));

        return response()->json([
            'data' => $announcements->items(),
            'total' => $announcements->total(),
            'current_page' => $announcements->currentPage(),
            'last_page' => $announcements->lastPage(),
            'per_page' => $announcements->perPage(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title'    => 'required|string|max:255',
            'link'     => 'nullable|string',
            'type'     => 'required|in:breaking,system',
            'status'   => 'required|in:draft,active,expired',
            'start_at' => 'nullable|date',
            'end_at'   => 'nullable|date|after_or_equal:start_at',
        ]);

        $announcement = Announcement::create($data);

        // Notify Admins for Breaking News
        if ($announcement->type === 'breaking' && $announcement->status === 'active') {
            \App\Services\NotificationService::notifyAdmins('breaking_news', [
                'announcement_id' => $announcement->id,
                'title' => $announcement->title
            ]);
        }

        return response()->json([
            'message' => 'Tạo thông báo thành công',
            'data' => $announcement
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $announcement = Announcement::findOrFail($id);
        return response()->json($announcement);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id)
    {
        $announcement = Announcement::findOrFail($id);

        $data = $request->validate([
            'title'    => 'required|string|max:255',
            'link'     => 'nullable|string',
            'type'     => 'required|in:breaking,system',
            'status'   => 'required|in:draft,active,expired',
            'start_at' => 'nullable|date',
            'end_at'   => 'nullable|date|after_or_equal:start_at',
        ]);

        $announcement->update($data);

        return response()->json([
            'message' => 'Cập nhật thông báo thành công',
            'data' => $announcement
        ]);
    }

    /**
     * Update announcement status.
     */
    public function updateStatus(Request $request, int $id)
    {
        $request->validate(['status' => 'required|in:draft,active,expired']);

        $announcement = Announcement::findOrFail($id);
        $announcement->update(['status' => $request->status]);

        return response()->json(['message' => 'Đã cập nhật trạng thái thông báo']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id)
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->delete();

        return response()->json(['message' => 'Đã xóa thông báo']);
    }
}
