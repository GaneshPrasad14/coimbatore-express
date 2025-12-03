import { useState, useEffect } from 'react';
import { Save, Image, Eye, EyeOff, Upload, X } from 'lucide-react';
import { getImageUrl } from '../lib/cloudinary';

interface Hero {
  id: string;
  title: string;
  imageUrl: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function HeroManagement() {
  const [hero, setHero] = useState<Hero | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    image: '', // Stores the URL
    description: '',
    isActive: false
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    loadHero();
  }, []);

  const loadHero = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/hero');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.hero) {
          setHero(result.data.hero);
          setFormData({
            title: result.data.hero.title,
            image: result.data.hero.imageUrl,
            description: result.data.hero.description || '',
            isActive: result.data.hero.isActive
          });
          setPreviewUrl(result.data.hero.imageUrl);
        }
      }
    } catch (error) {
      console.error('Error loading hero:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic validation
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('folder', 'hero');

      const response = await fetch('http://localhost:5001/api/media/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setFormData(prev => ({
          ...prev,
          image: data.data.media.url
        }));
        setPreviewUrl(data.data.media.url); // Update preview with server URL
        setSelectedFile(null);
        alert('Image uploaded successfully!');
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const method = hero ? 'PUT' : 'POST';
      const url = hero ? `http://localhost:5001/api/hero/${hero.id}` : 'http://localhost:5001/api/hero';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          title: formData.title,
          imageUrl: formData.image,
          description: formData.description,
          isActive: formData.isActive
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setHero(result.data.hero);
          alert(hero ? 'Hero updated successfully!' : 'Hero created successfully!');
        }
      } else {
        throw new Error('Failed to save hero');
      }
    } catch (error) {
      console.error('Error saving hero:', error);
      alert('Failed to save hero. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D90429]"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hero Section Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage the hero section displayed on the homepage
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {hero && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${hero.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
              {hero.isActive ? (
                <>
                  <Eye className="w-4 h-4 mr-1" />
                  Active
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4 mr-1" />
                  Inactive
                </>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter hero title"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hero Image *
            </label>
            <div className="space-y-4">
              {/* File Input */}
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload size={18} className="mr-2" />
                  Choose Image
                </label>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={handleUploadImage}
                    disabled={uploading}
                    className="px-4 py-2 bg-[#0A1F44] text-white rounded-lg hover:bg-[#1a3a6e] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={18} className="mr-2" />
                        Upload
                      </>
                    )}
                  </button>
                )}
                {(formData.image || previewUrl) && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Selected File Info */}
              {selectedFile && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}

              {/* Current Image URL (hidden input for form submission) */}
              <input
                type="hidden"
                value={formData.image}
                required
              />
            </div>
          </div>

          {/* Image Preview */}
          {(previewUrl || formData.image) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image Preview
              </label>
              <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <img
                  src={getImageUrl(previewUrl || formData.image)}
                  alt="Hero preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Invalid+Image';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Image className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter hero description"
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="h-4 w-4 text-[#0A1F44] focus:ring-[#0A1F44] border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-white">
              Display hero section on homepage
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#0A1F44] text-white px-6 py-2 rounded-lg hover:bg-[#1a3a6e] transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              <span>{saving ? 'Saving...' : hero ? 'Update Hero' : 'Create Hero'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Eye className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Hero Section Display
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                The hero section will only appear on the homepage when:
              </p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>A title is provided</li>
                <li>A valid image URL is set</li>
                <li>The "Display hero section" toggle is enabled</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}