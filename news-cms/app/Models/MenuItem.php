<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Page;
use App\Models\Category;
use App\Models\Post;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'menu_id',
        'parent_id',
        'title',
        'url',
        'target',
        'icon',
        'type', // custom, page, category, post
        'linkable_type',
        'linkable_id',
        'order',
        'status', // is_visible
    ];

    protected $casts = [
        'status' => 'boolean',
        'order' => 'integer',
    ];

    public function menu()
    {
        return $this->belongsTo(Menu::class);
    }

    public function parent()
    {
        return $this->belongsTo(MenuItem::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(MenuItem::class, 'parent_id')->orderBy('order');
    }

    /**
     * Get the owning linkable model (Page, Post, Category).
     */
    public function linkable()
    {
        return $this->morphTo();
    }

    /**
     * Helper to get full URL
     */
    public function getLinkAttribute()
    {
        if ($this->type === 'custom') {
            return $this->url;
        }

        if ($this->linkable) {
            // Polymorphic logic based on model
            if ($this->linkable instanceof Page) {
                return '/page/' . $this->linkable->slug;
            }
            if ($this->linkable instanceof Category) {
                return '/category/' . $this->linkable->slug;
            }
            if ($this->linkable instanceof Post) {
                return '/post/' . $this->linkable->slug;
            }
        }

        return '#';
    }
}
