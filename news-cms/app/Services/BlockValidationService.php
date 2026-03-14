<?php

namespace App\Services;

use App\Models\Page;

class BlockValidationService
{
    /**
     * All allowed block types
     */
    protected array $allowedTypes = [
        'hero',
        'text',
        'image',
        'video',
        'cta',
        'spacer',
        'banner',
        'gallery',
        'post_list',
    ];

    /**
     * Validate all blocks in a page
     */
    public function validateBlocks(array $blocks): array
    {
        $errors = [];

        foreach ($blocks as $index => $block) {
            if (!isset($block['type'])) {
                $errors[] = "Block {$index}: Missing 'type' field";
                continue;
            }

            if (!in_array($block['type'], $this->allowedTypes)) {
                $errors[] = "Block {$index}: Unknown block type '{$block['type']}'";
                continue;
            }

            if (!isset($block['data'])) {
                $errors[] = "Block {$index}: Missing 'data' field";
                continue;
            }

            // Validate specific block types
            $blockErrors = $this->validateBlockType($block, $index);
            if (!empty($blockErrors)) {
                $errors = array_merge($errors, $blockErrors);
            }
        }

        return $errors;
    }

    /**
     * Validate specific block type rules
     */
    protected function validateBlockType(array $block, int $index): array
    {
        $errors = [];
        $type = $block['type'];
        $data = $block['data'];

        switch ($type) {
            case 'hero':
                if (empty($data['title'])) {
                    $errors[] = "Block {$index} (hero): 'title' is required";
                }
                if (empty($data['background_image'])) {
                    $errors[] = "Block {$index} (hero): 'background_image' is required";
                }
                break;

            case 'banner':
                if (empty($data['title'])) {
                    $errors[] = "Block {$index} (banner): 'title' is required";
                }
                break;

            case 'text':
                if (empty($data['content'])) {
                    $errors[] = "Block {$index} (text): 'content' is required";
                }
                // Sanitize HTML
                $data['content'] = $this->sanitizeHtml($data['content']);
                break;

            case 'image':
                if (empty($data['src'])) {
                    $errors[] = "Block {$index} (image): 'src' is required";
                }
                if (empty($data['alt'])) {
                    $errors[] = "Block {$index} (image): 'alt' is required for SEO";
                }
                break;

            case 'gallery':
                if (empty($data['images']) || !is_array($data['images'])) {
                    $errors[] = "Block {$index} (gallery): 'images' array is required";
                } else {
                    foreach ($data['images'] as $imgIdx => $img) {
                        if (empty($img['src'])) {
                            $errors[] = "Block {$index} (gallery): Image {$imgIdx} missing 'src'";
                        }
                    }
                }
                break;

            case 'video':
                if (empty($data['provider'])) {
                    $errors[] = "Block {$index} (video): 'provider' is required";
                }
                if (!empty($data['provider']) && !in_array($data['provider'], ['youtube', 'vimeo'])) {
                    $errors[] = "Block {$index} (video): Invalid provider (only youtube, vimeo allowed)";
                }
                if (empty($data['video_id'])) {
                    $errors[] = "Block {$index} (video): 'video_id' is required";
                }
                break;

            case 'cta':
                if (empty($data['text'])) {
                    $errors[] = "Block {$index} (cta): 'text' is required";
                }
                if (empty($data['url'])) {
                    $errors[] = "Block {$index} (cta): 'url' is required";
                }
                break;

            case 'post_list':
                // post_list can have optional filters, no required fields
                if (isset($data['limit']) && (!is_numeric($data['limit']) || $data['limit'] < 1 || $data['limit'] > 50)) {
                    $errors[] = "Block {$index} (post_list): 'limit' must be between 1 and 50";
                }
                break;

            case 'spacer':
                if (!isset($data['height']) || !is_numeric($data['height'])) {
                    $errors[] = "Block {$index} (spacer): 'height' must be a number";
                }
                break;
        }

        return $errors;
    }

    /**
     * Sanitize HTML content (basic)
     */
    protected function sanitizeHtml(string $html): string
    {
        // Allow only safe tags
        $allowedTags = '<p><br><strong><em><u><a><ul><ol><li><h1><h2><h3><h4><h5><h6><blockquote>';
        return strip_tags($html, $allowedTags);
    }

    /**
     * Get list of allowed block types with metadata
     */
    public function getAllowedBlockTypes(): array
    {
        return [
            ['type' => 'hero', 'label' => 'Hero Banner', 'icon' => 'crown', 'description' => 'Banner đầu trang với tiêu đề lớn và ảnh nền'],
            ['type' => 'banner', 'label' => 'Banner', 'icon' => 'notification', 'description' => 'Banner quảng cáo / thông báo với nút CTA'],
            ['type' => 'text', 'label' => 'Văn bản', 'icon' => 'font-size', 'description' => 'Đoạn văn bản rich-text HTML'],
            ['type' => 'image', 'label' => 'Hình ảnh', 'icon' => 'picture', 'description' => 'Hình ảnh với alt text và caption'],
            ['type' => 'gallery', 'label' => 'Bộ sưu tập', 'icon' => 'appstore', 'description' => 'Grid hoặc masonry gallery nhiều ảnh'],
            ['type' => 'video', 'label' => 'Video', 'icon' => 'play-circle', 'description' => 'Video nhúng từ YouTube/Vimeo'],
            ['type' => 'post_list', 'label' => 'Danh sách bài viết', 'icon' => 'unordered-list', 'description' => 'Hiển thị bài viết theo danh mục/mới nhất'],
            ['type' => 'cta', 'label' => 'Nút CTA', 'icon' => 'link', 'description' => 'Nút kêu gọi hành động'],
            ['type' => 'spacer', 'label' => 'Khoảng cách', 'icon' => 'column-height', 'description' => 'Khoảng trống giữa các block'],
        ];
    }
}
