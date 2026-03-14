<?php

namespace Database\Seeders;

use App\Models\EditorialNote;
use App\Models\Post;
use Illuminate\Database\Seeder;

class EditorialNoteSeeder extends Seeder
{
    /**
     * Run the database seeds for testing editorial notes
     */
    public function run(): void
    {
        $posts = Post::take(2)->get();

        if ($posts->isEmpty()) {
            $this->command->warn('No posts found. Create posts first.');
            return;
        }

        $sampleNotes = [
            'Cần bổ sung nguồn chính thống',
            'Tiêu đề hơi giật, cân nhắc lại',
            'Ảnh này có vấn đề bản quyền',
            'Sửa lỗi chính tả dòng 2',
            'Kỳ vọng feedback từ legal team',
        ];

        $visibilities = ['editor', 'admin', 'editor', 'admin', 'editor'];

        foreach ($posts as $index => $post) {
            for ($i = 0; $i < 3; $i++) {
                EditorialNote::create([
                    'post_id' => $post->id,
                    'user_id' => 1, // Admin user
                    'note' => $sampleNotes[$i],
                    'visibility' => $visibilities[$i],
                ]);
            }
        }

        $this->command->info('✓ Sample editorial notes created');
    }
}
