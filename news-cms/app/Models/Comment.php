<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Traits\BelongsToTenant;

class Comment extends Model
{
    use HasFactory, SoftDeletes, BelongsToTenant;

    protected $fillable = [
        'post_id',
        'user_id',
        'parent_id',
        'content',
        'status',
        'spam_reason',
        'report_count',
        'ip_address',
    ];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function parent()
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Comment::class, 'parent_id')
            ->orderBy('created_at', 'asc')
            ->with(['user', 'children' => function($q) {
                $q->whereIn('status', ['approved', 'reported']);
            }]);
    }

    /**
     * Scope for approved or reported comments.
     */
    public function scopeApproved($query)
    {
        return $query->whereIn('status', ['approved', 'reported']);
    }

    public function reports()
    {
        return $this->hasMany(CommentReport::class);
    }
}
