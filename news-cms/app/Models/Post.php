<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Traits\BelongsToTenant;

class Post extends Model
{
    use \Illuminate\Database\Eloquent\SoftDeletes, BelongsToTenant;

    protected $fillable = [
        'author_id',
        'title',
        'slug',
        'summary',
        'content',
        'content_html',
        'content_json',
        'toc',
        'thumbnail',
        'status',
        'views',
        'approved_by',
        'approved_at',
        'published_at',
        'is_breaking',
        'breaking_until',
        'include_in_sitemap'
    ];

    protected $casts = [
        'views' => 'integer',
        'category_ids' => 'array',
        'toc' => 'array',
        'approved_at' => 'datetime',
        'published_at' => 'datetime',
        'is_breaking' => 'boolean',
        'breaking_until' => 'datetime',
        'include_in_sitemap' => 'boolean',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function approvalLogs()
    {
        return $this->hasMany(PostApprovalLog::class)->latest();
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'post_categories');
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'post_tag')->withTimestamps();
    }

    public function versions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(PostVersion::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function likes()
    {
        return $this->hasMany(PostLike::class);
    }

    public function likedBy($userId)
    {
        return $this->likes()->where('user_id', $userId)->exists();
    }

    public function reviewComments()
    {
        return $this->hasMany(PostReviewComment::class)->latest();
    }

    public function openReviewComments()
    {
        return $this->reviewComments()->where('status', 'open');
    }

    /**
     * Scope: Only published posts with published_at set
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published')
            ->whereNotNull('published_at');
    }

    /**
     * Scope: Active breaking news
     */
    public function scopeBreaking($query)
    {
        return $query->where('is_breaking', true)
            ->where('breaking_until', '>', now());
    }

    /**
     * Content Lock - Polymorphic relationship
     */
    public function contentLock()
    {
        return $this->morphOne(ContentLock::class, 'lockable');
    }

    /**
     * Editorial Notes
     */
    public function editorialNotes()
    {
        return $this->hasMany(EditorialNote::class);
    }

    /**
     * Old slugs for 301 redirects
     */
    public function oldSlugs()
    {
        return $this->hasMany(PostSlug::class);
    }
}
