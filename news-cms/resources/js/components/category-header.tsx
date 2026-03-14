import { Link } from '@inertiajs/react';

interface CategoryHeaderProps {
  title: string;
  viewAllUrl?: string;
  className?: string;
}

export default function CategoryHeader({ 
  title, 
  viewAllUrl, 
  className = '' 
}: CategoryHeaderProps) {
  return (
    <div className={`relative mb-8 ${className}`}>
      {/* Section title with horizontal line */}
      <div className="flex items-center">
        <h2 className="text-2xl font-bold text-gray-900 relative pr-4 bg-white z-10">
          {title}
        </h2>
        
        {/* Horizontal line that extends to the right */}
        <div className="flex-1 h-px bg-gray-200 ml-4"></div>
        
        {/* View all link */}
        {viewAllUrl && (
          <div className="ml-4 bg-white z-10">
            <Link 
              href={viewAllUrl}
              className="flex items-center text-sm font-medium text-red-600 hover:text-red-700 transition-colors whitespace-nowrap"
            >
              Xem thêm
              <svg 
                className="w-4 h-4 ml-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </Link>
          </div>
        )}
      </div>
      
      {/* Optional: Add a subtle colored underline */}
      <div className="w-16 h-1 bg-red-600 mt-2"></div>
    </div>
  );
}