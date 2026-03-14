<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostVersion;
use App\Services\PostVersionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PostVersionController extends Controller
{
    protected $versionService;

    public function __construct(PostVersionService $versionService)
    {
        $this->versionService = $versionService;
    }

    /**
     * List versions of a post
     */
    public function index(Post $post): JsonResponse
    {
        $versions = $post->versions()
            ->with('creator:id,name')
            ->latest()
            ->get();

        return response()->json([
            'data' => $versions
        ]);
    }

    /**
     * Restore post to a specific version
     */
    public function restore(Post $post, PostVersion $version): JsonResponse
    {
        abort_if($version->post_id !== $post->id, 403, 'Phiên bản không thuộc bài viết này.');

        DB::transaction(function () use ($post, $version) {
            // 1. Lưu bản snapshot của trạng thái HIỆN TẠI trước khi restore
            $this->versionService->createFromPost($post, auth()->user() ?? $post->author);

            // 2. Cập nhật bài viết từ bản version được chọn
            $post->update([
                'title'     => $version->title,
                'summary'   => $version->summary,
                'content'   => $version->content,
                'thumbnail' => $version->thumbnail,
                // Giữ nguyên status hiện tại hoặc theo version tùy nghiệp vụ, 
                // ở đây Tech Lead khuyên giữ snapshot status để debug
            ]);
        });

        return response()->json([
            'message' => 'Khôi phục phiên bản thành công',
            'data' => $post->load(['author', 'categories'])
        ]);
    }
}
