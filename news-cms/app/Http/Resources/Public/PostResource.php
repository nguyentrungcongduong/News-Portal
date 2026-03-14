<?php

namespace App\Http\Resources\Public;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'summary' => $this->summary,
            'content' => $this->when($request->routeIs('*.show'), $this->content),
            'thumbnail' => $this->thumbnail,
            'published_at' => $this->published_at,
            'views' => $this->views,
            'author' => [
                'name' => $this->author->name ?? 'Anonymous',
            ],
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
        ];
    }
}
