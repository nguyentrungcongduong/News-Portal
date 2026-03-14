<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Tag extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'name',
        'slug',
        'description',
        'color',
        'icon',
        'meta',
        'is_featured',
        'post_count',
    ];

    protected $casts = [
        'meta' => 'array',
        'is_featured' => 'boolean',
        'post_count' => 'integer',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($tag) {
            if (empty($tag->slug)) {
                $tag->slug = Str::slug($tag->name);
            }
        });

        static::saving(function ($tag) {
            // Ensure slug is URL-safe
            $tag->slug = Str::slug($tag->slug);
        });
    }

    /**
     * Get the posts that belong to the tag.
     */
    public function posts()
    {
        return $this->belongsToMany(Post::class, 'post_tag')
                    ->withTimestamps();
    }

    /**
     * Scope a query to only include featured tags.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope a query to order by popularity (post_count).
     */
    public function scopePopular($query)
    {
        return $query->orderByDesc('post_count');
    }

    /**
     * Update the post count for this tag.
     */
    public function updatePostCount()
    {
        $this->update([
            'post_count' => $this->posts()->where('status', 'published')->count()
        ]);
    }

    /**
     * Get the tag's SEO title.
     */
    public function getSeoTitleAttribute()
    {
        return $this->meta['title'] ?? $this->name;
    }

    /**
     * Get the tag's SEO description.
     */
    public function getSeoDescriptionAttribute()
    {
        return $this->meta['description'] ?? $this->description;
    }
}
