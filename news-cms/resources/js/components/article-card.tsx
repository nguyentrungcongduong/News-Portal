import { Link } from '@inertiajs/react';

interface ArticleCardProps {
  title: string;
  excerpt?: string;
  imageUrl: string;
  url: string;
  publishedAt: string;
  variant?: 'featured' | 'list' | 'thumbnail';
  className?: string;
}

export default function ArticleCard({ 
  title, 
  excerpt, 
  imageUrl, 
  url, 
  publishedAt,
  variant = 'featured',
  className = ''
}: ArticleCardProps) {
  // Format date to Vietnamese locale
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Common image container with fixed aspect ratio
  const ImageContainer = ({ className = '' }) => (
    <div className={`relative overflow-hidden rounded ${className}`}>
      <div className="aspect-[16/9] w-full">
        <img
          src={imageUrl || '/placeholder-news.jpg'}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-news.jpg';
          }}
        />
      </div>
    </div>
  );

  // Featured article layout
  if (variant === 'featured') {
    return (
      <Link href={url} className={`block group ${className}`}>
        <div className="space-y-3">
          <ImageContainer />
          <div className="space-y-2">
            <h3 className="text-2xl font-bold leading-snug text-gray-900 group-hover:text-red-600 transition-colors line-clamp-3">
              {title}
            </h3>
            {excerpt && (
              <p className="text-gray-600 text-base leading-relaxed line-clamp-3">
                {excerpt}
              </p>
            )}
            <div className="text-sm text-gray-500">
              {formatDate(publishedAt)}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // List item layout (for sidebar)
  if (variant === 'list') {
    return (
      <Link href={url} className={`block group ${className}`}>
        <div className="flex gap-4">
          <div className="w-1/3 flex-shrink-0">
            <ImageContainer className="h-24" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold leading-snug text-gray-900 group-hover:text-red-600 transition-colors line-clamp-3">
              {title}
            </h3>
            <div className="text-xs text-gray-500 mt-1">
              {formatDate(publishedAt)}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Thumbnail layout (for related articles)
  return (
    <Link href={url} className={`block group ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-20 flex-shrink-0">
          <ImageContainer className="h-14" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium leading-snug text-gray-900 group-hover:text-red-600 transition-colors line-clamp-3">
            {title}
          </h3>
        </div>
      </div>
    </Link>
  );
}