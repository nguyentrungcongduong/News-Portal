<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostSlug extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'post_id',
        'old_slug',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Bài viết
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Tìm post bằng old slug
     */
    public static function findPostBySlug($slug)
    {
        $postSlug = self::where('old_slug', $slug)->first();
        return $postSlug?->post;
    }
}
