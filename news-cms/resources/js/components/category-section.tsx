import CategoryHeader from './category-header';
import ArticleCard from './article-card';

interface Article {
  id: number;
  title: string;
  excerpt?: string;
  imageUrl: string;
  url: string;
  publishedAt: string;
  category?: {
    name: string;
    url: string;
  };
}

interface CategorySectionProps {
  title: string;
  viewAllUrl?: string;
  mainArticle: Article;
  sideArticles: Article[];
  className?: string;
}

export default function CategorySection({ 
  title, 
  viewAllUrl, 
  mainArticle, 
  sideArticles,
  className = ''
}: CategorySectionProps) {
  return (
    <section className={`mb-12 ${className}`}>
      <CategoryHeader title={title} viewAllUrl={viewAllUrl} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main featured article (left column - 66.66%) */}
        <div className="lg:col-span-2">
          <ArticleCard
            title={mainArticle.title}
            excerpt={mainArticle.excerpt}
            imageUrl={mainArticle.imageUrl}
            url={mainArticle.url}
            publishedAt={mainArticle.publishedAt}
            variant="featured"
          />
          
          {/* Optional: Add a grid of 2 articles below the featured one */}
          {sideArticles.length > 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {sideArticles.slice(0, 2).map((article) => (
                <ArticleCard
                  key={article.id}
                  title={article.title}
                  imageUrl={article.imageUrl}
                  url={article.url}
                  publishedAt={article.publishedAt}
                  variant="list"
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Sidebar with list of articles (right column - 33.33%) */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Tin mới nhất</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {sideArticles.slice(0, 5).map((article, index) => (
                <div key={article.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <ArticleCard
                    title={article.title}
                    imageUrl={article.imageUrl}
                    url={article.url}
                    publishedAt={article.publishedAt}
                    variant="list"
                  />
                </div>
              ))}
            </div>
            {viewAllUrl && (
              <div className="px-4 py-3 border-t border-gray-100 text-center">
                <a 
                  href={viewAllUrl}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Xem thêm tin tức
                </a>
              </div>
            )}
          </div>
          
          {/* Optional: Add a trending or popular section */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Đọc nhiều nhất</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {sideArticles.slice(0, 5).map((article, index) => (
                <div key={`trending-${article.id}`} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start">
                    <span className="text-2xl font-bold text-gray-300 w-8 flex-shrink-0">{index + 1}</span>
                    <div className="ml-2 flex-1">
                      <a 
                        href={article.url}
                        className="block text-sm font-medium text-gray-900 hover:text-red-600 transition-colors line-clamp-2"
                      >
                        {article.title}
                      </a>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(article.publishedAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}