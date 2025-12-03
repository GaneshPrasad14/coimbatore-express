import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import ArticleForm from './ArticleForm';
import {
  getArticles,
  convertBackendArticleToDataService,
  type Article
} from '../lib/dataService';
import { getImageUrl } from '../lib/cloudinary';



const categories = ['Local', 'Education', 'Business', 'Sports', 'Real Estate', 'Lifestyle', 'Events', 'Political', 'Devotional'];
const authors = ['Coimbatore Express Staff', 'Sports Correspondent', 'Business Reporter'];
const statusOptions = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  { value: 'review', label: 'Under Review', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'published', label: 'Published', color: 'bg-green-100 text-green-800' },
  { value: 'archived', label: 'Archived', color: 'bg-red-100 text-red-800' }
];

function getStatusInfo(status: string) {
  return statusOptions.find(s => s.value === status) || statusOptions[0];
}

export default function ArticleManagement() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      // Fetch articles from backend API
      const response = await fetch('http://localhost:5001/api/articles');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Convert backend articles to frontend format
          const convertedArticles = result.data.articles.map(convertBackendArticleToDataService);
          setArticles(convertedArticles);
        } else {
          console.error('Failed to load articles:', result.message);
          // Fallback to local data
          const allArticles = getArticles();
          setArticles(allArticles);
        }
      } else {
        console.error('Failed to fetch articles:', response.status);
        // Fallback to local data
        const allArticles = getArticles();
        setArticles(allArticles);
      }
    } catch (error) {
      console.error('Error loading articles:', error);
      // Fallback to local data
      try {
        const allArticles = getArticles();
        setArticles(allArticles);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    const author = article.author; // Now directly available
    const category = article.category; // Now directly available
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (author?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || (category?.name === categoryFilter);

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleUpdateArticleStatus = async (id: string, newStatus: Article['status']) => {
    try {
      const response = await fetch(`http://localhost:5001/api/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ status: newStatus.toUpperCase() })
      });

      if (response.ok) {
        loadArticles(); // Reload articles after update
      } else {
        console.error('Failed to update article status');
      }
    } catch (error) {
      console.error('Error updating article status:', error);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        const response = await fetch(`http://localhost:5001/api/articles/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          }
        });

        if (response.ok) {
          loadArticles(); // Reload articles after deletion
        } else {
          console.error('Failed to delete article');
        }
      } catch (error) {
        console.error('Error deleting article:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not published';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateArticle = () => {
    setEditingArticle(null);
    setShowForm(true);
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleSaveArticle = async (articleData: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'views'>) => {
    try {
      // Transform frontend data to backend format
      const backendData = {
        title: articleData.title,
        excerpt: articleData.excerpt,
        content: articleData.content,
        categoryId: articleData.category_id,
        authorId: articleData.author_id,
        images: articleData.images,
        status: articleData.status.toUpperCase(),
        isFeatured: articleData.is_featured,
        isBreaking: articleData.is_breaking,
        seoTitle: articleData.seo_title,
        seoDescription: articleData.seo_description,
        publishedAt: articleData.published_at ? new Date(articleData.published_at + ':00').toISOString() : null,
        scheduledFor: null // Not implemented in frontend yet
      };

      if (editingArticle) {
        // Update existing article via backend API
        const response = await fetch(`http://localhost:5001/api/articles/${editingArticle.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify(backendData)
        });

        if (!response.ok) {
          throw new Error('Failed to update article');
        }
      } else {
        // Create new article via backend API
        const response = await fetch('http://localhost:5001/api/articles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify(backendData)
        });

        if (!response.ok) {
          throw new Error('Failed to create article');
        }
      }

      loadArticles(); // Reload articles after save
      setShowForm(false);
      setEditingArticle(null);
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Failed to save article. Please try again.');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingArticle(null);
  };

  const handlePreviewArticle = (article: Article) => {
    // Open preview in new window or modal
    console.log('Preview article:', article);
    // For now, just log it. In a real app, this would open a preview
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Article Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all your articles, drafts, and publications</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            {viewMode === 'list' ? 'Grid View' : 'List View'}
          </button>
          <button
            onClick={handleCreateArticle}
            className="bg-[#0A1F44] text-white px-4 py-2 rounded-lg hover:bg-[#1a3a6e] transition flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Create New Article</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Articles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{articles.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {articles.filter(a => a.status === 'published').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Under Review</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {articles.filter(a => a.status === 'review').length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Drafts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {articles.filter(a => a.status === 'draft').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setCategoryFilter('all');
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredArticles.map((article) => {
                const statusInfo = getStatusInfo(article.status);
                return (
                  <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={getImageUrl(article.images.length > 0 ? article.images[0] : '')}
                            alt={article.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                            <span className="max-w-xs truncate">{article.title}</span>
                            {article.is_featured && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                Featured
                              </span>
                            )}
                            {article.is_breaking && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Breaking
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                            {article.excerpt}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {article.author?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {article.category?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(article.published_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditArticle(article)}
                          className="text-[#0A1F44] hover:text-[#1a3a6e] p-1"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Preview"
                        >
                          <Eye size={16} />
                        </button>
                        {article.status === 'draft' || article.status === 'review' ? (
                          <button
                            onClick={() => handleUpdateArticleStatus(article.id, 'published')}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Publish"
                          >
                            <Send size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateArticleStatus(article.id, 'draft')}
                            className="text-gray-600 hover:text-gray-900 p-1"
                            title="Unpublish"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteArticle(article.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredArticles.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No articles found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Get started by creating your first article.'}
          </p>
          {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
            <div className="mt-6">
              <button
                onClick={handleCreateArticle}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#0A1F44] hover:bg-[#1a3a6e]"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Create New Article
              </button>
            </div>
          )}
        </div>
      )}

      {/* Article Form Modal */}
      {showForm && (
        <ArticleForm
          article={editingArticle}
          onSave={handleSaveArticle}
          onCancel={handleCancelForm}
          onPreview={handlePreviewArticle}
        />
      )}
    </div>
  );
}