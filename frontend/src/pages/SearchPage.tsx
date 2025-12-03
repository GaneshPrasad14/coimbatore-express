import { useEffect, useState } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { searchArticles, convertToNewsDataArticle } from '../lib/dataService';
import { type Article } from '../lib/newsData';
import ArticleCard from '../components/ArticleCard';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface SearchPageProps {
  query: string;
  onNavigate: (page: string) => void;
}

export default function SearchPage({ query, onNavigate }: SearchPageProps) {
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    if (query) {
      performSearch(query);
    } else {
      setLoading(false);
    }
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    setLoading(true);
    try {
      const searchResults = searchArticles(searchTerm);
      const convertedResults = searchResults.map(convertToNewsDataArticle);
      setResults(convertedResults.slice(0, 20));
    } catch (error) {
      console.error('Error searching articles:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="bg-gray-50">
      <Header onNavigate={onNavigate} currentPage="search" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-[#0A1F44] hover:text-gray-600 mb-4 transition"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
          <h1 className="text-4xl font-bold text-[#0A1F44] mb-2">Search</h1>
          <div className="h-1 w-24 bg-[#0A1F44] mb-6"></div>

          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for articles..."
                className="w-full px-6 py-4 pr-12 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-[#D90429] focus:border-transparent outline-none transition text-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bg-[#0A1F44] text-white p-3 rounded-full hover:bg-gray-800 transition"
              >
                <Search size={20} />
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D90429]"></div>
          </div>
        ) : query ? (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                {results.length === 0 ? 'No results' : `${results.length} result${results.length !== 1 ? 's' : ''}`} found for <span className="font-semibold text-[#0A1F44]">"{query}"</span>
              </p>
            </div>

            {results.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-[#0A1F44] mb-2">No articles found</h2>
                <p className="text-gray-600 mb-6">
                  Try different keywords or browse our categories
                </p>
                <button
                  onClick={() => onNavigate('home')}
                  className="bg-[#0A1F44] text-white px-6 py-3 rounded-full hover:bg-gray-800 transition"
                >
                  Back to Home
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    size="small"
                    onNavigate={(slug) => onNavigate(`article/${slug}`)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-[#0A1F44] mb-2">Start searching</h2>
            <p className="text-gray-600">Enter a keyword to find articles</p>
          </div>
        )}
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
