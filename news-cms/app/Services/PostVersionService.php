<?php

namespace App\Services;

use App\Models\Post;
use App\Models\PostVersion;
use Illuminate\Support\Facades\Auth;

class PostVersionService
{
    /**
     * Create a version from a post
     */
    public function createFromPost(Post $post, \App\Models\User $user)
    {
        return PostVersion::create([
            'post_id'    => $post->id,
            'title'      => $post->title,
            'summary'    => $post->summary,
            'content'    => $post->content,
            'thumbnail'  => $post->thumbnail,
            'status'     => $post->status,
            'created_by' => $user->id,
        ]);
    }

    /**
     * Get history of a post
     */
    public function getHistory(int $postId)
    {
        return PostVersion::where('post_id', $postId)
            ->with('creator')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get a specific version
     */
    public function getVersion(int $postId, int $versionId)
    {
        return PostVersion::where('post_id', $postId)->findOrFail($versionId);
    }
}
