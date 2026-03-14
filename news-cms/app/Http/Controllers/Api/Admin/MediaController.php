<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

use App\Models\Media;

class MediaController extends Controller
{
    /**
     * Get List of Images
     */
    public function index(Request $request)
    {
        try {
            $query = Media::query()->orderBy('created_at', 'desc');

            if ($request->has('q')) {
                $query->where('name', 'like', '%' . $request->q . '%');
            }

            $media = $query->paginate(24); // Show 24 per page for a better grid

            return response()->json($media);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi tải danh sách: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Upload image to Cloudinary and save to DB
     */
    public function upload(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|image|max:5120', // Increased to 5MB
            ]);

            $file = $request->file('file');
            
            // Log for debugging
            $cloudinary = app(\Cloudinary\Cloudinary::class);

            // Using the uploadApi() method
            $uploaded = $cloudinary->uploadApi()->upload(
                $file->getRealPath(),
                [
                    'folder' => 'news_content',
                    'format' => 'webp',
                    'quality' => 'auto',
                ]
            );

            $url = $uploaded['secure_url'];

            // Save to DB
            $media = Media::create([
                'name' => $file->getClientOriginalName(),
                'file_path' => $url,
                'disk' => 'cloudinary',
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
            ]);

            return response()->json([
                'id' => $media->id,
                'url' => $url,
                'name' => $media->name
            ]);
        } catch (\Exception $e) {
            \Log::error('Upload Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Lỗi upload: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete Media
     */
    public function destroy($id)
    {
        try {
            $media = Media::findOrFail($id);
            // Optional: Also delete from Cloudinary if public_id was saved
            // For now, just delete from DB record
            $media->delete();

            return response()->json(['message' => 'Xóa media thành công']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi xóa media: ' . $e->getMessage()], 500);
        }
    }
}
