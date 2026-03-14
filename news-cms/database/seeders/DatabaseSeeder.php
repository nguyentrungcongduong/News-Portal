<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 0. Ensure a default tenant exists
        $tenant = \App\Models\Tenant::firstOrCreate(
            ['domain' => parse_url(env('APP_URL', 'localhost'), PHP_URL_HOST) ?: 'localhost'],
            ['name' => 'Default News Portal']
        );

        // 1. Initialize Spatie Roles
        $adminRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin']);
        $editorRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'editor']);
        $authorRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'author']);

        // 2. Create Users with Roles and Tenant
        $admin = User::updateOrCreate(
            ['email' => 'admin@news.com'],
            [
                'name' => 'Admin News',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'tenant_id' => $tenant->id,
            ]
        );
        $admin->assignRole($adminRole);

        $editor = User::updateOrCreate(
            ['email' => 'editor@news.com'],
            [
                'name' => 'Editor News',
                'password' => bcrypt('password'),
                'role' => 'editor',
                'tenant_id' => $tenant->id,
            ]
        );
        $editor->assignRole($editorRole);

        $author = User::updateOrCreate(
            ['email' => 'author@news.com'],
            [
                'name' => 'Author News',
                'password' => bcrypt('password'),
                'role' => 'author',
                'tenant_id' => $tenant->id,
            ]
        );
        $author->assignRole($authorRole);

        // 3. Create Categories
        $categories = [
            ['name' => 'Thời sự', 'slug' => 'thoi-su'],
            ['name' => 'Kinh doanh', 'slug' => 'kinh-doanh'],
            ['name' => 'Thể thao', 'slug' => 'the-thao'],
            ['name' => 'Giải trí', 'slug' => 'giai-tri'],
            ['name' => 'Công nghệ', 'slug' => 'cong-nghe'],
        ];

        $categoryModels = [];
        foreach ($categories as $cat) {
            $categoryModels[] = \App\Models\Category::firstOrCreate(['slug' => $cat['slug']], ['name' => $cat['name']]);
        }

        // 4. Create Dummy Posts with various statuses (Only if none exist yet)
        if (\App\Models\Post::count() === 0) {
            $authors = [$admin, $editor, $author];
            $statuses = ['draft', 'pending', 'published', 'archived'];

            for ($i = 1; $i <= 30; $i++) {
                $currentAuthor = $authors[$i % count($authors)];
                $status = $statuses[$i % count($statuses)];
                $title = "Bài viết mẫu số $i - Tin tức hệ thống News Portal";
                
                $post = \App\Models\Post::create([
                    'author_id' => $currentAuthor->id,
                    'title' => $title,
                    'slug' => \Illuminate\Support\Str::slug($title) . '-' . $i,
                    'summary' => "Đây là đoạn tóm tắt (sapo) cho bài viết số $i. Hệ thống quản lý tin tức hiện đại.",
                    'content' => "<p>Nội dung chi tiết của bài viết số $i. Toàn bộ hệ thống đang được vận hành bởi News Portal CMS.</p>",
                    'thumbnail' => "https://picsum.photos/seed/" . $i . "/600/400",
                    'status' => $status,
                    'published_at' => $status === 'published' ? now() : null,
                    'views' => rand(50, 2000),
                ]);

                $randomCategories = collect($categoryModels)->random(rand(1, 2))->pluck('id');
                $post->categories()->attach($randomCategories);
            }
        }
        
        // 5. Run the new MockPostsSeeder (it has its own duplication checks)
        $this->call(MockPostsSeeder::class);
    }
}
