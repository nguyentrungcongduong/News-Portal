<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class PostReviewComment extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'post_id',
        'user_id',
        'comment_id',
        'from',
        'to',
        'text',
        'status',
        'resolved_by',
        'resolved_at',
    ];

    protected $casts = [
        'from' => 'integer',
        'to' => 'integer',
        'resolved_at' => 'datetime',
    ];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function resolver()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
