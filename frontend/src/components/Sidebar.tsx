import { TrendingUp, Eye } from 'lucide-react';
import type { Article } from '../lib/newsData';
import { getImageUrl } from '../lib/cloudinary';

interface SidebarAd {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  size: string;
  isActive: boolean;
}

interface SidebarProps {
  trendingArticles: Article[];
  mostReadArticles: Article[];
  onNavigate: (slug: string) => void;
  showAds?: boolean;
  sidebarAds?: SidebarAd[];
}

export default function Sidebar({
  trendingArticles,
  mostReadArticles,
  onNavigate,
  showAds = true,
  sidebarAds = []
}: SidebarProps) {

  return (
    <aside className="space-y-6">

      {/* Trending Articles */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="text-[#0A1F44]" size={20} />
          <h3 className="font-bold text-[#0A1F44]">Trending Now</h3>
        </div>
        <div className="space-y-3">
          {trendingArticles.slice(0, 5).map((article, index) => (
            <div
              key={article.id}
              onClick={() => onNavigate(`article/${article.slug}`)}
              className="flex items-start space-x-3 cursor-pointer group"
            >
              <span className="text-2xl font-bold text-[#0A1F44] flex-shrink-0">
                {index + 1}
              </span>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-[#0A1F44] line-clamp-2 group-hover:underline">
                  {article.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {article.categories?.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Articles */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Eye className="text-[#0A1F44]" size={20} />
          <h3 className="font-bold text-[#0A1F44]">Recent Articles</h3>
        </div>
        <div className="space-y-3">
          {mostReadArticles.slice(0, 5).map((article) => (
            <div
              key={article.id}
              onClick={() => onNavigate(`article/${article.slug}`)}
              className="cursor-pointer group"
            >
              <h4 className="text-sm font-semibold text-[#0A1F44] line-clamp-2 group-hover:underline">
                {article.title}
              </h4>
              <div className="flex items-center mt-1 text-xs text-gray-500">
                <span>{article.categories?.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>



      {/* Sidebar Ads */}
      {showAds && sidebarAds.filter(ad => ad.isActive).map((ad) => (
        <div key={ad.id} className="bg-gray-100 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-500 mb-2">Advertisement</p>
          <a
            href={ad.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src={getImageUrl(ad.imageUrl)}
              alt={ad.title}
              className="w-full h-48 object-cover rounded hover:opacity-90 transition-opacity"
            />
          </a>
        </div>
      ))}

      {/* Default Ad Space if no active ads */}
      {showAds && sidebarAds.filter(ad => ad.isActive).length === 0 && (
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-500 mb-2">Advertisement</p>
          <div className="bg-white h-48 rounded flex items-center justify-center text-gray-400">
            300x250
          </div>
        </div>
      )}
    </aside>
  );
}
