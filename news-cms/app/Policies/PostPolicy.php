<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    /**
     * Determine whether the user can update the post.
     */
    public function update(User $user, Post $post): bool
    {
        // Admins and Editors can update any post
        if (in_array($user->role, ['admin', 'editor'])) {
            return true;
        }

        // Authors can only update their own posts that are draft or rejected
        if ($user->role === 'author') {
            return (int)$user->id === (int)$post->author_id && in_array($post->status, ['draft', 'rejected']);
        }

        return false;
    }

    /**
     * Determine whether the user can delete the post.
     */
    public function delete(User $user, Post $post): bool
    {
        if ($user->role === 'admin' || $user->can('delete_post_all')) {
            return true;
        }

        return $user->id === $post->author_id && in_array($post->status, ['draft', 'rejected']);
    }

    public function submit(User $user, Post $post): bool
    {
        return $user->id === $post->author_id && in_array($post->status, ['draft', 'rejected']);
    }

    /**
     * Approve - Admin và Editor được approve
     * Editor là Content Gatekeeper
     */
    public function approve(User $user, Post $post): bool
    {
        // Admin và Editor được approve
        if ($user->role !== 'admin' && $user->role !== 'editor') {
            return false;
        }

        return $post->status === 'pending';
    }

    /**
     * Publish - CHỈ Admin được publish
     * Editor KHÔNG được publish (chỉ approve)
     */
    public function publish(User $user, Post $post): bool
    {
        // CHỈ Admin được publish
        if ($user->role !== 'admin') {
            return false;
        }

        return in_array($post->status, ['approved', 'pending', 'draft']);
    }

    /**
     * Archive - CHỈ Admin được archive
     * Editor KHÔNG được archive
     */
    public function archive(User $user, Post $post): bool
    {
        // CHỈ Admin được archive
        if ($user->role !== 'admin') {
            return false;
        }

        return $post->status === 'published';
    }
}
