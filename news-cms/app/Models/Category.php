<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Traits\BelongsToTenant;

class Category extends Model
{
    use BelongsToTenant;
    protected $fillable = ['parent_id', 'name', 'description', 'slug', 'layout', 'status', 'order', 'show_home'];

    protected $casts = [
        'order' => 'integer',
        'show_home' => 'boolean',
    ];

    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function posts()
    {
        return $this->belongsToMany(Post::class, 'post_categories');
    }
}
