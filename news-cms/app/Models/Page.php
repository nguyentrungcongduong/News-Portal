<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class Page extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'title',
        'slug',
        'locale',
        'status',
        'status',
        'menu_visible',
        'seo',
        'blocks',
        'version',
    ];

    protected $casts = [
        'seo' => 'array',
        'blocks' => 'array',
        'menu_visible' => 'boolean',
        'version' => 'integer',
    ];

    /**
     * Boot method - auto increment version on update
     */
    protected static function booted()
    {
        static::creating(function ($page) {
            if (is_null($page->version)) {
                $page->version = 1;
            }
        });

        static::updating(function ($page) {
            if ($page->isDirty('blocks') || $page->isDirty('seo')) {
                $page->version = ($page->version ?? 0) + 1;
            }
        });
    }

    /**
     * Relationship: Page has many versions
     */
    public function versions()
    {
        return $this->hasMany(PageVersion::class)->orderBy('version', 'desc');
    }

    /**
     * Get the latest version snapshot
     */
    public function latestVersion()
    {
        return $this->versions()->first();
    }

    /**
     * Scope: Published pages only
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope: By locale
     */
    public function scopeLocale($query, $locale)
    {
        return $query->where('locale', $locale);
    }
}
