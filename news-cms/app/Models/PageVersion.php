<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageVersion extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'page_id',
        'version',
        'snapshot',
        'user_id',
    ];

    protected $casts = [
        'snapshot' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Relationship: Version belongs to a page
     */
    public function page()
    {
        return $this->belongsTo(Page::class);
    }

    /**
     * Relationship: Version created by user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
