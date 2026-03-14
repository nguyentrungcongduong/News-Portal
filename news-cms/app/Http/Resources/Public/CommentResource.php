<?php

namespace App\Http\Resources\Public;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'author_name'  => $this->user ? $this->user->name : 'Unknown User',
            'author_avatar'=> $this->user ? $this->user->avatar : null, // Optional if we had avatar
            'content'      => $this->content,
            'status'       => $this->status,
            'parent_id'    => $this->parent_id,
            'created_at'   => $this->created_at->diffForHumans(),
            'children'     => CommentResource::collection($this->whenLoaded('children')),
        ];
    }
}
