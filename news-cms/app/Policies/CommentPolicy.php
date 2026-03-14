<?php

namespace App\Policies;

use App\Models\Comment;
use App\Models\User;

class CommentPolicy
{
    /**
     * Determine whether the user can delete the comment.
     */
    public function delete(User $user, Comment $comment): bool
    {
        // Admins can delete any comment
        if ($user->role === 'admin' || $user->can('delete_comment_all')) {
            return true;
        }

        // Users can delete their own comments
        return $user->id === $comment->user_id;
    }

    /**
     * Determine whether the user can update the comment.
     */
    public function update(User $user, Comment $comment): bool
    {
        return $user->id === $comment->user_id;
    }

    /**
     * Determine whether the user can moderate comments.
     */
    public function moderate(User $user): bool
    {
        return in_array($user->role, ['admin', 'editor']);
    }
}
