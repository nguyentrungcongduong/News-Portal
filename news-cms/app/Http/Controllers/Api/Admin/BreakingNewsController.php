<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BreakingNews;
use App\Models\Post;
use Illuminate\Http\Request;

class BreakingNewsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $items = BreakingNews::with('post:id,title,status,slug')
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($items);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'post_id' => 'required|exists:posts,id',
            'priority' => 'required|integer|min:1|max:10',
            'start_at' => 'nullable|date',
            'end_at' => 'nullable|date|after_or_equal:start_at',
            'is_active' => 'boolean',
            'send_notification' => 'boolean' // New field
        ]);

        // Security: Ensure post is published
        $post = Post::findOrFail($validated['post_id']);
        if ($post->status !== 'published') {
            return response()->json(['message' => 'Bài viết chưa được xuất bản.'], 422);
        }

        // Limit active breaking news to 5 (SAFEY-GUARD)
        if (($validated['is_active'] ?? true)) {
            $activeCount = BreakingNews::active()->count();
            if ($activeCount >= 5) {
                return response()->json(['message' => 'Đã đạt giới hạn 5 tin nóng đang hiển thị. Vui lòng tắt bớt tin cũ.'], 422);
            }
        }
        
        // Remove auxiliary field before creating model
        $sendNotification = $validated['send_notification'] ?? false;
        unset($validated['send_notification']);

        $breakingNews = BreakingNews::create($validated);

        // TRIGGER EVENT
        if ($breakingNews->is_active && $sendNotification) {
             \App\Events\BreakingNewsActivated::dispatch($breakingNews);
        }

        return response()->json(['message' => 'Đã thêm tin nóng', 'data' => $breakingNews], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return BreakingNews::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $breakingNews = BreakingNews::findOrFail($id);

        $validated = $request->validate([
            'priority' => 'integer|min:1|max:10',
            'start_at' => 'nullable|date',
            'end_at' => 'nullable|date|after_or_equal:start_at',
            'is_active' => 'boolean',
            'send_notification' => 'boolean'
        ]);

        $sendNotification = $validated['send_notification'] ?? false;
        unset($validated['send_notification']);

        $breakingNews->update($validated);
        
        // If updated to active and requested notification
        if ($breakingNews->is_active && $sendNotification) {
             \App\Events\BreakingNewsActivated::dispatch($breakingNews);
        }

        return response()->json(['message' => 'Cập nhật thành công', 'data' => $breakingNews]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $breakingNews = BreakingNews::findOrFail($id);
        $breakingNews->delete();

        return response()->json(['message' => 'Đã xóa tin nóng']);
    }

    /**
     * Toggle active status.
     */
    public function toggle(Request $request, string $id)
    {
        $breakingNews = BreakingNews::findOrFail($id);
        
        // If turning on, check limit
        if (!$breakingNews->is_active) {
            $activeCount = BreakingNews::active()->count();
            if ($activeCount >= 5) {
                return response()->json(['message' => 'Đã đạt giới hạn 5 tin nóng. Không thể bật thêm.'], 422);
            }
        }

        $breakingNews->is_active = !$breakingNews->is_active;
        $breakingNews->save();
        
        // Allow passing ?send_notification=1 to toggle route
        if ($breakingNews->is_active && $request->boolean('send_notification')) {
            \App\Events\BreakingNewsActivated::dispatch($breakingNews);
        }

        return response()->json(['message' => 'Đã thay đổi trạng thái', 'data' => $breakingNews]);
    }
}
