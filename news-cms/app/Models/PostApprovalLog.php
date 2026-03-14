<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostApprovalLog extends Model
{
    protected $fillable = ['post_id', 'user_id', 'action', 'note'];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
