import { useEffect, useState } from 'react';
import { Calendar, User, Facebook, Twitter, Linkedin } from 'lucide-react';
import { getArticleBySlug, getRelatedArticles, getTrendingArticles, getMostReadArticles, convertToNewsDataArticle } from '../lib/dataService';
import { type Article } from '../lib/newsData';
import { getSidebarAds, type SidebarAd } from '../lib/sidebarData';
import { getImageUrl } from '../lib/cloudinary';
import ArticleCard from '../components/ArticleCard';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

interface ArticlePageProps {
  slug: string;
  onNavigate: (page: string) => void;
}

export default function ArticlePage({ slug, onNavigate }: ArticlePageProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [articleImages, setArticleImages] = useState<string[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const [mostReadArticles, setMostReadArticles] = useState<Article[]>([]);
  const [sidebarAds, setSidebarAds] = useState<SidebarAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [slug]);

  const loadArticle = async () => {
    try {
      let articleData: any = null;

      // Try to fetch from backend API first
      try {
        const response = await fetch(`http://localhost:5001/api/articles/${slug}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            articleData = result.data.article;
            // Convert backend article to frontend format
            const convertedArticle: Article = {
              id: articleData.id,
              title: articleData.title,
              slug: articleData.slug,
              excerpt: articleData.excerpt,
              content: articleData.content,
              featured_image_url: articleData.images && articleData.images.length > 0 ? articleData.images[0] : '',
              category_id: articleData.categoryId,
              author_id: articleData.authorId,
              is_featured: articleData.isFeatured,
              is_breaking: articleData.isBreaking,
              views: articleData.views,
              published_at: articleData.publishedAt,
              categories: articleData.category ? {
                id: articleData.category.id,
                name: articleData.category.name,
                slug: articleData.category.slug,
                description: articleData.category.description || ''
              } : undefined,
              authors: articleData.author ? {
                id: articleData.author.id,
                name: articleData.author.name,
                bio: articleData.author.bio,
                avatar_url: articleData.author.avatar,
                email: articleData.author.email || ''
              } : undefined
            };
            setArticle(convertedArticle);
            setArticleImages(articleData.images || []);

            // Get related articles from the same category
            const relatedResponse = await fetch(`http://localhost:5001/api/articles?category=${articleData.categoryId}&limit=3`);
            if (relatedResponse.ok) {
              const relatedResult = await relatedResponse.json();
              if (relatedResult.success) {
                const related = relatedResult.data.articles
                  .filter((a: any) => a.id !== articleData.id)
                  .slice(0, 3)
                  .map((a: any) => ({
                    id: a.id,
                    title: a.title,
                    slug: a.slug,
                    excerpt: a.excerpt,
                    content: a.content,
                    featured_image_url: a.images && a.images.length > 0 ? a.images[0] : '',
                    category_id: a.categoryId,
                    author_id: a.authorId,
                    is_featured: a.isFeatured,
                    is_breaking: a.isBreaking,
                    views: a.views,
                    published_at: a.publishedAt,
                    categories: a.category ? {
                      id: a.category.id,
                      name: a.category.name,
                      slug: a.category.slug,
                      description: a.category.description || ''
                    } : undefined,
                    authors: a.author ? {
                      id: a.author.id,
                      name: a.author.name,
                      bio: a.author.bio,
                      avatar_url: a.author.avatar,
                      email: a.author.email || ''
                    } : undefined
                  }));
                setRelatedArticles(related);
              }
            }
          }
        }
      } catch (backendError) {
        console.warn('Backend fetch failed, using local data:', backendError);
      }

      // Fallback to local data if backend didn't provide article
      if (!articleData) {
        const data = getArticleBySlug(slug);

        if (data) {
          // Convert to newsData format for compatibility
          const convertedArticle = convertToNewsDataArticle(data);
          setArticle(convertedArticle);

          // Get related articles from the same category
          const related = getRelatedArticles(data.id, data.category_id, 3);
          setRelatedArticles(related.map(convertToNewsDataArticle));
        }
      }

      // Load sidebar content - try backend first, then fallback
      try {
        // Try backend for trending articles
        const trendingResponse = await fetch('http://localhost:5001/api/articles/trending/list');
        if (trendingResponse.ok) {
          const trendingResult = await trendingResponse.json();
          if (trendingResult.success) {
            const trending = trendingResult.data.articles.map((a: any) => ({
              id: a.id,
              title: a.title,
              slug: a.slug,
              excerpt: a.excerpt,
              content: a.content,
              featured_image_url: a.images && a.images.length > 0 ? a.images[0] : '',
              category_id: a.categoryId,
              author_id: a.authorId,
              is_featured: a.isFeatured,
              is_breaking: a.isBreaking,
              views: a.views,
              published_at: a.publishedAt,
              categories: a.category ? {
                id: a.category.id,
                name: a.category.name,
                slug: a.category.slug,
                description: a.category.description || ''
              } : undefined,
              authors: a.author ? {
                id: a.author.id,
                name: a.author.name,
                bio: a.author.bio,
                avatar_url: a.author.avatar,
                email: a.author.email || ''
              } : undefined
            }));
            setTrendingArticles(trending);
          }
        } else {
          throw new Error('Backend trending failed');
        }
      } catch (error) {
        console.warn('Backend trending failed, using local data');
        const trending = getTrendingArticles();
        setTrendingArticles(trending.map(convertToNewsDataArticle));
      }

      // Load most read articles
      try {
        const mostReadResponse = await fetch('http://localhost:5001/api/articles/trending/list?sort=publishedAt');
        if (mostReadResponse.ok) {
          const mostReadResult = await mostReadResponse.json();
          if (mostReadResult.success) {
            const mostRead = mostReadResult.data.articles.slice(0, 5).map((a: any) => ({
              id: a.id,
              title: a.title,
              slug: a.slug,
              excerpt: a.excerpt,
              content: a.content,
              featured_image_url: a.images && a.images.length > 0 ? a.images[0] : '',
              category_id: a.categoryId,
              author_id: a.authorId,
              is_featured: a.isFeatured,
              is_breaking: a.isBreaking,
              views: a.views,
              published_at: a.publishedAt,
              categories: a.category ? {
                id: a.category.id,
                name: a.category.name,
                slug: a.category.slug,
                description: a.category.description || ''
              } : undefined,
              authors: a.author ? {
                id: a.author.id,
                name: a.author.name,
                bio: a.author.bio,
                avatar_url: a.author.avatar,
                email: a.author.email || ''
              } : undefined
            }));
            setMostReadArticles(mostRead);
          }
        } else {
          throw new Error('Backend most read failed');
        }
      } catch (error) {
        console.warn('Backend most read failed, using local data');
        const mostRead = getMostReadArticles();
        setMostReadArticles(mostRead.map(convertToNewsDataArticle));
      }

      const ads = getSidebarAds('article');
      setSidebarAds(ads);
    } catch (error) {
      console.error('Error loading article:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const shareArticle = (platform: string) => {
    const url = window.location.href;
    const text = article?.title || '';

    const urls: { [key: string]: string } = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D90429]"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="bg-gray-50">
        <Header onNavigate={onNavigate} currentPage="article" />
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-[#0A1F44] mb-4">Article Not Found</h1>
          <button
            onClick={() => onNavigate('home')}
            className="text-[#0A1F44] hover:underline font-semibold"
          >
            Return to Home
          </button>
        </div>
        <footer className="bg-gray-800 text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4">Coimbatore Express</h3>
              <p className="text-gray-400 mb-4">The English Voice of Coimbatore</p>
              <div className="text-xs text-gray-500">
                <p>© 2025 Coimbatore Express. All rights reserved.</p>
                <p className="mt-2">Contact: info@coimbatoreexpress.com | +91 98765 43210</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <Header onNavigate={onNavigate} currentPage="article" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content - Takes 2/3 width on larger screens */}
          <div className="w-full lg:w-2/3">
            <article>
              {article.categories && (
                <button
                  onClick={() => onNavigate(article.categories!.slug)}
                  className="text-sm font-semibold text-[#0A1F44] uppercase tracking-wide hover:underline"
                >
                  {article.categories.name}
                </button>
              )}

              <h1 className="text-4xl md:text-5xl font-bold text-[#0A1F44] mt-4 mb-6 leading-tight">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
                {article.authors && (
                  <div className="flex items-center space-x-2">
                    {article.authors.avatar_url && (
                      <img
                        src={article.authors.avatar_url}
                        alt={article.authors.name}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <div className="flex items-center space-x-1">
                        <User size={14} />
                        <span className="font-semibold">{article.authors.name}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs">
                        <Calendar size={12} />
                        <span>{formatDate(article.published_at)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* First image - big below the topic */}
              {articleImages.length > 0 && getImageUrl(articleImages[0]) && (
                <div className="mb-8">
                  <img
                    src={getImageUrl(articleImages[0])}
                    alt={`${article.title} - Image 1`}
                    className="w-full h-auto rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="prose prose-lg max-w-none mb-8 font-serif">
                {/* Second image - floated right in the content */}
                {articleImages.length > 1 && getImageUrl(articleImages[1]) && (
                  <div className="float-right ml-6 mb-4 w-1/2 md:w-1/3">
                    <img
                      src={getImageUrl(articleImages[1])}
                      alt={`${article.title} - Image 2`}
                      className="w-full h-auto rounded-lg shadow-md border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.style.display = 'none';
                      }}
                    />
                    {/* Optional caption if we had one */}
                  </div>
                )}

                <p className="text-xl text-gray-800 font-medium leading-relaxed mb-6 first-letter:text-5xl first-letter:font-bold first-letter:text-[#0A1F44] first-letter:mr-3 first-letter:float-left">
                  {article.excerpt}
                </p>

                <div className="text-gray-900 leading-relaxed text-justify space-y-4">
                  {article.content.split('\n\n').map((paragraph, index) => {
                    // Start from third image (index 2) since index 0 is hero and index 1 is floated right
                    const imageIndex = index + 2;

                    return (
                      <div key={index}>
                        <p className="mb-4">
                          {paragraph}
                        </p>
                        {/* Intersperse remaining images between paragraphs if any */}
                        {articleImages.length > 2 && imageIndex < articleImages.length && getImageUrl(articleImages[imageIndex]) && (
                          <div className="my-8">
                            <img
                              src={getImageUrl(articleImages[imageIndex])}
                              alt={`${article.title} - Image ${imageIndex + 1}`}
                              className="w-full h-auto rounded-lg shadow-sm"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Clear floats */}
                <div className="clear-both"></div>
              </div>
            </article>

            {relatedArticles.length > 0 && (
              <section className="mt-12">
                <div className="border-t-2 border-[#0A1F44] pt-6">
                  <h2 className="text-2xl font-bold text-[#0A1F44] mb-6">You May Also Like</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedArticles.slice(0, 3).map((relatedArticle) => (
                      <ArticleCard
                        key={relatedArticle.id}
                        article={relatedArticle}
                        size="small"
                        onNavigate={(slug) => onNavigate(`article/${slug}`)}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar - Takes 1/3 width on larger screens */}
          <div className="w-full lg:w-1/3">
            {/* About Author */}
            {article.authors && article.authors.bio && (
              <div className="bg-white p-4 rounded-lg shadow mb-6">
                <h3 className="font-bold text-lg mb-3 text-[#0A1F44]">About the Author</h3>
                <div className="flex items-start space-x-4">
                  {article.authors.avatar_url && (
                    <img
                      src={article.authors.avatar_url}
                      alt={article.authors.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-[#0A1F44]">{article.authors.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{article.authors.bio}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Social Sharing */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <h3 className="font-bold text-lg mb-3 text-[#0A1F44]">Share This Article</h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => shareArticle('facebook')}
                  className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition"
                >
                  <Facebook size={20} />
                </button>
                <button
                  onClick={() => shareArticle('twitter')}
                  className="w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center hover:bg-blue-500 transition"
                >
                  <Twitter size={20} />
                </button>
                <button
                  onClick={() => shareArticle('linkedin')}
                  className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition"
                >
                  <Linkedin size={20} />
                </button>
                <button
                  onClick={() => shareArticle('whatsapp')}
                  className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Enhanced Sidebar with videos and ads */}
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