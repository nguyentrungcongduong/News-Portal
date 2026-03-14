<?php

namespace App\Http\Resources\Public;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $primaryCategory = $this->categories->first();

        return [
            'id'           => $this->id,
            'title'        => $this->title,
            'slug'         => $this->slug,
            'summary'      => $this->summary,
            'content'      => $this->content,
            'thumbnail'    => $this->thumbnail,
            'published_at' => $this->published_at,
            'likes_count'  => $this->likes()->count(),
            'liked'        => auth()->check() ? $this->likedBy(auth()->id()) : false,
            'category'     => [
                'name' => $primaryCategory->name ?? 'Tin tức',
                'slug' => $primaryCategory->slug ?? 'tin-tuc',
            ],
            'author' => [
                'name' => $this->author->name ?? 'Ban biên tập',
            ],
        ];
    }
}
