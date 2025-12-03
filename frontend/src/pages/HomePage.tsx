import { useEffect, useState } from 'react';
import {
  getFeaturedArticles,
  getBreakingNews,
  getTrendingArticles,
  getMostReadArticles,
  getArticlesByCategory,
  getCategories,
  convertToNewsDataArticle,
  convertBackendArticleToFrontend
} from '../lib/dataService';
import { getImageUrl } from '../lib/cloudinary';
import { type Article } from '../lib/newsData';
import { type SidebarAd } from '../lib/sidebarData';
import ArticleCard from '../components/ArticleCard';
import Sidebar from '../components/Sidebar';
import BreakingNews from '../components/BreakingNews';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdDisplay from '../components/AdDisplay';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [subFeatured, setSubFeatured] = useState<Article[]>([]);
  const [breakingNews, setBreakingNews] = useState<Article[]>([]);
  const [categoryArticles, setCategoryArticles] = useState<{ [key: string]: Article[] }>({});
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const [mostReadArticles, setMostReadArticles] = useState<Article[]>([]);
  const [sidebarAds, setSidebarAds] = useState<SidebarAd[]>([]);
  const [hero, setHero] = useState<{ title: string; image: string; description?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      // Get featured articles
      const featured = getFeaturedArticles().map(convertToNewsDataArticle);
      if (featured.length > 0) {
        setFeaturedArticle(featured[0]);
        if (featured.length > 1) {
          setSubFeatured(featured.slice(1, 4));
        }
      }

      // Get breaking news
      const breaking = getBreakingNews().map(convertToNewsDataArticle);
      setBreakingNews(breaking);

      // Get category articles
      const categoryData: { [key: string]: Article[] } = {};

      const fetchWithRetry = async (url: string, retryCount = 0): Promise<Response> => {
        const response = await fetch(url);
        if (response.status === 429 && retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000;
          console.warn(`Rate limited for ${url}, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(url, retryCount + 1);
        }
        return response;
      };

      try {
        const response = await fetchWithRetry('http://localhost:5001/api/categories');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const allCategories = result.data.categories;
            for (const category of allCategories) {
              // Try to get articles from backend category endpoint
              try {
                const categoryResponse = await fetchWithRetry(`http://localhost:5001/api/categories/slug/${category.slug}?limit=4`);
                if (categoryResponse.ok) {
                  const categoryResult = await categoryResponse.json();
                  if (categoryResult.success && categoryResult.data.category.articles.length > 0) {
                    categoryData[category.name] = categoryResult.data.category.articles.map(convertBackendArticleToFrontend);
                    continue;
                  }
                }
              } catch (categoryError) {
                console.warn(`Failed to fetch articles for category ${category.name}:`, categoryError);
              }

              // Fallback to local articles for this category
              const localArticles = getArticlesByCategory(category.id).map(convertToNewsDataArticle);
              if (localArticles.length > 0) {
                categoryData[category.name] = localArticles;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching categories from backend:', error);
        // Fallback to local data
        const allCategories = getCategories();
        for (const category of allCategories) {
          const articles = getArticlesByCategory(category.id).map(convertToNewsDataArticle);
          if (articles.length > 0) {
            categoryData[category.name] = articles;
          }
        }
      }
      setCategoryArticles(categoryData);

      // Get trending and most read articles
      let trending: Article[] = [];
      let mostRead: Article[] = [];

      try {
        // Try to get trending from backend
        const trendingResponse = await fetch('http://localhost:5001/api/articles/trending/list');
        if (trendingResponse.ok) {
          const trendingResult = await trendingResponse.json();
          if (trendingResult.success) {
            trending = trendingResult.data.articles.map(convertBackendArticleToFrontend);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch trending from backend:', error);
      }

      // Fallback to local data for trending and most read
      if (trending.length === 0) {
        trending = getTrendingArticles().map(convertToNewsDataArticle);
      }
      mostRead = getMostReadArticles().map(convertToNewsDataArticle);

      setTrendingArticles(trending);
      setMostReadArticles(mostRead);

      // Get sidebar content
      // For Home page, we use explicit AdDisplay components in the sidebar
      // so we don't need to pass ads to the Sidebar component to avoid duplicates
      setSidebarAds([]);

      // Get hero section
      try {
        const heroResponse = await fetch('http://localhost:5001/api/hero');
        if (heroResponse.ok) {
          const heroResult = await heroResponse.json();
          if (heroResult.success && heroResult.data.hero) {
            setHero({
              title: heroResult.data.hero.title,
              image: heroResult.data.hero.imageUrl,
              description: heroResult.data.hero.description
            });
          }
        }
      } catch (error) {
        console.warn('Failed to fetch hero:', error);
      }

    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };



  // Helper function to render articles with ads for mobile view
  const renderArticlesWithMobileAds = (articles: Article[], adPositions: string[]) => {
    const elements: JSX.Element[] = [];
    let adIndex = 0;

    articles.forEach((article, index) => {
      elements.push(
        <ArticleCard
          key={article.id}
          article={article}
          size="small"
          onNavigate={(slug) => onNavigate(`article/${slug}`)}
        />
      );

      // Insert ad after every 2 articles in mobile view
      if ((index + 1) % 2 === 0 && adIndex < adPositions.length) {
        elements.push(
          <div key={`mobile-ad-${index}`} className="md:hidden">
            <AdDisplay
              position={adPositions[adIndex % adPositions.length]}
              page="home"
              size="300x250"
              className="bg-white p-4 rounded-lg shadow mb-6"
            />
          </div>
        );
        adIndex++;
      }
    });

    return elements;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D90429]"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <Header onNavigate={onNavigate} currentPage="home" />



      {/* Hero Section */}
      {hero && hero.image && (
        <section className="relative h-96 md:h-[500px] overflow-hidden">
          <img
            src={getImageUrl(hero.image)}
            alt={hero.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'; // Hide image if it fails to load
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white px-4 max-w-4xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">{hero.title}</h1>
              {hero.description && (
                <p className="text-lg md:text-xl opacity-90">{hero.description}</p>
              )}
            </div>
          </div>
        </section>
      )}

      <BreakingNews items={breakingNews.map(a => ({ id: a.id, title: a.title }))} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content - Takes 2/3 width on larger screens */}
          <div className="w-full lg:w-2/3 space-y-8">
            {featuredArticle && (
              <section>
                <ArticleCard
                  article={featuredArticle}
                  size="large"
                  onNavigate={(slug) => onNavigate(`article/${slug}`)}
                />
              </section>
            )}

            {subFeatured.length > 0 && (
              <section>
                {/* Mobile view: articles with ads */}
                <div className="md:hidden space-y-6">
                  {renderArticlesWithMobileAds(subFeatured, ['sidebar-top', 'sidebar-middle', 'sidebar-bottom'])}
                </div>
                {/* Desktop view: grid layout */}
                <div className="hidden md:grid md:grid-cols-3 gap-6">
                  {subFeatured.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      size="medium"
                      onNavigate={(slug) => onNavigate(`article/${slug}`)}
                    />
                  ))}
                </div>
              </section>
            )}

            <AdDisplay position="header" page="home" size="728x90" />

            {Object.entries(categoryArticles).map(([categoryName, articles]) => {
              if (articles.length === 0) return null;

              return (
                <section key={categoryName} className="border-t-4 border-[#0A1F44] pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-[#0A1F44]">{categoryName}</h2>
                    <button
                      onClick={() => onNavigate(categoryName.toLowerCase().replace(' ', '-'))}
                      className="text-sm text-[#0A1F44] hover:underline font-semibold"
                    >
                      View All →
                    </button>
                  </div>
                  {/* Mobile view: articles with ads */}
                  <div className="md:hidden space-y-6">
                    {renderArticlesWithMobileAds(articles.slice(0, 4), ['sidebar-top', 'sidebar-middle', 'sidebar-bottom'])}
                  </div>
                  {/* Desktop view: grid layout */}
                  <div className="hidden md:grid md:grid-cols-3 gap-6">
                    {articles.slice(0, 6).map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        size="small"
                        onNavigate={(slug) => onNavigate(`article/${slug}`)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Sidebar - Takes 1/3 width on larger screens */}
          <div className="w-full lg:w-1/3 space-y-6">
            {/* Ad Space */}
            <AdDisplay position="sidebar-top" page="home" size="300x250" className="bg-white p-4 rounded-lg shadow" />

            {/* Advertisement Section */}
            <AdDisplay position="sidebar-middle" page="home" size="300x250" className="bg-white p-4 rounded-lg shadow" />

            {/* More Ad Space */}
            <AdDisplay position="sidebar-bottom" page="home" size="300x600" className="bg-white p-4 rounded-lg shadow" />
            <Sidebar
              trendingArticles={trendingArticles}
              mostReadArticles={mostReadArticles}
              onNavigate={onNavigate}
              sidebarAds={sidebarAds}
            />
          </div>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
