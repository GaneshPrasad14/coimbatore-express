import { Calendar, User } from 'lucide-react';
import type { Article } from '../lib/newsData';
import { getImageUrl } from '../lib/cloudinary';

interface ArticleCardProps {
  article: Article;
  size?: 'small' | 'medium' | 'large';
  onNavigate: (slug: string) => void;
}

export default function ArticleCard({ article, size = 'medium', onNavigate }: ArticleCardProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not published';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const cardClasses = {
    small: 'flex flex-col',
    medium: 'flex flex-col',
    large: 'grid grid-cols-1 md:grid-cols-2 gap-6'
  };

  const imageClasses = {
    small: 'aspect-[4/3] w-full',
    medium: 'aspect-[4/3] w-full',
    large: 'aspect-[4/3] w-full md:h-full'
  };

  const titleClasses = {
    small: 'text-base font-bold',
    medium: 'text-xl font-bold',
    large: 'text-3xl font-bold'
  };

  return (
    <article
      onClick={() => onNavigate(article.slug)}
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer group"
    >
      <div className={cardClasses[size]}>
        <div className={`${imageClasses[size]} overflow-hidden bg-gray-200`}>
          <img
            src={getImageUrl(article.featured_image_url || '')}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </div>
        <div className="p-3 flex-1">
          {article.categories && (
            <span className="text-xs font-bold text-[#0A1F44] uppercase tracking-wide">
              {article.categories.name}
            </span>
          )}
          <h3 className={`${titleClasses[size]} text-[#0A1F44] mt-2 mb-3 leading-tight`}>
            {article.title}
          </h3>
          {size !== 'small' && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
          )}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            {article.authors && (
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <User size={14} />
                <span>{article.authors.name}</span>
              </div>
            )}
            <div className="flex items-center space-x-1 text-sm font-medium text-[#0A1F44]">
              <Calendar size={14} />
              <span>{formatDate(article.published_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
