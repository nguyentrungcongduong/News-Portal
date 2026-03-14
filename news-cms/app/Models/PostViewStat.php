<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostViewStat extends Model
{
    protected $fillable = ['post_id', 'date', 'views'];

    protected $casts = [
        'date' => 'date',
    ];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}
