<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EditorialNote extends Model
{
    protected $table = 'editorial_notes';

    protected $fillable = [
        'post_id',
        'user_id',
        'note',
        'visibility',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Bài viết
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Người viết note
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope: lấy notes dựa trên quyền của user
     */
    public function scopeForUser($query, $userId, $userRole)
    {
        if ($userRole === 'admin') {
            return $query; // Admin thấy tất cả
        }

        // Editor và Author chỉ thấy 'editor' visibility
        return $query->where('visibility', 'editor');
    }

    /**
     * Scope: lấy notes của bài viết cụ thể
     */
    public function scopeForPost($query, $postId)
    {
        return $query->where('post_id', $postId);
    }
}
