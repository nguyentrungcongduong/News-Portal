<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Get list for select box (simple list for now)
     */
    public function index(): JsonResponse
    {
        // Return full list with parent info, sorted by order then name
        $categories = Category::with('parent')
            ->orderBy('order', 'asc')
            ->orderBy('name', 'asc')
            ->get();
        return response()->json($categories);
    }

    /**
     * Create new category
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:categories,slug',
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'layout' => 'required|string|in:grid,list,masonry,timeline',
            'status' => 'required|in:active,hidden',
            'order' => 'nullable|integer',
            'show_home' => 'nullable|boolean'
        ]);

        $category = Category::create($validated);
        return response()->json(['message' => 'Tạo chuyên mục thành công', 'data' => $category]);
    }

    /**
     * Update category
     */
    public function update(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:categories,slug,' . $category->id,
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'layout' => 'required|string|in:grid,list,masonry,timeline',
            'status' => 'required|in:active,hidden',
            'order' => 'nullable|integer',
            'show_home' => 'nullable|boolean'
        ]);

        $category->update($validated);
        return response()->json(['message' => 'Cập nhật thành công', 'data' => $category]);
    }

    /**
     * Delete category
     */
    public function destroy(Category $category): JsonResponse
    {
        // Check if has posts
        if ($category->posts()->count() > 0) {
            return response()->json(['message' => 'Không thể xóa chuyên mục đang có bài viết'], 422);
        }

        $category->delete();
        return response()->json(['message' => 'Đã xóa chuyên mục']);
    }

    public function toggleStatus(Category $category): JsonResponse
    {
        $category->update([
            'status' => $category->status === 'active' ? 'hidden' : 'active'
        ]);
        return response()->json(['message' => 'Đã cập nhật trạng thái', 'data' => $category]);
    }

    public function toggleHome(Category $category): JsonResponse
    {
        $category->update([
            'show_home' => !$category->show_home
        ]);
        return response()->json(['message' => 'Đã cập nhật hiển thị trang chủ', 'data' => $category]);
    }
}
