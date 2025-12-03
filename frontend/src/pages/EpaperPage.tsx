import { useEffect, useState } from 'react';
import { Download, Calendar, FileText, ArrowLeft, Eye, X, Share2 } from 'lucide-react';
import { getEpaperIssuesAPI, downloadEpaperAPI, type EpaperIssue } from '../lib/dataService';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface EpaperPageProps {
  onNavigate: (page: string) => void;
}

export default function EpaperPage({ onNavigate }: EpaperPageProps) {
  const [epapers, setEpapers] = useState<EpaperIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState<EpaperIssue | null>(null);

  useEffect(() => {
    loadEpapers();
  }, []);

  const loadEpapers = async () => {
    try {
      const epaperData = await getEpaperIssuesAPI();
      setEpapers(epaperData);
    } catch (error) {
      console.error('Error loading e-papers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (epaper: EpaperIssue) => {
    const dateStr = new Date(epaper.issueDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const shareData = {
      title: epaper.title || 'Coimbatore Express E-Paper',
      text: `Read the Coimbatore Express E-Paper edition from ${dateStr}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        // You might want to use a toast here instead of alert in a real app
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
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
      <Header onNavigate={onNavigate} currentPage="epaper" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-[#0A1F44] hover:text-gray-600 mb-4 transition"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
          <h1 className="text-4xl font-bold text-[#0A1F44] mb-2">E-Paper Archive</h1>
          <div className="h-1 w-24 bg-[#0A1F44] mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Download our digital newspaper editions.
          </p>
        </div>

        {epapers.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-600 mb-2">No E-Papers Available</h2>
            <p className="text-gray-500">Digital editions will be available here soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {epapers.map((epaper) => (
              <div
                key={epaper.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText size={24} className="text-[#0A1F44]" />
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {epaper.title || 'Coimbatore Express'}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                        <Calendar size={14} />
                        <span>
                          {new Date(epaper.issueDate).toLocaleDateString('en-IN', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {epaper.pageCount} Pages
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      PDF Format
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedPdf(epaper)}
                      className="flex-1 bg-[#0A1F44] text-white py-3 px-4 rounded hover:bg-[#1a3a6e] transition flex items-center justify-center gap-2"
                    >
                      <Eye size={16} />
                      Read
                    </button>
                    <a
                      href={downloadEpaperAPI(epaper.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={`coimbatore-express-${epaper.issueDate.split('T')[0]}.pdf`}
                      className="flex-1 bg-gray-600 text-white py-3 px-4 rounded hover:bg-gray-700 transition flex items-center justify-center gap-2"
                    >
                      <Download size={16} />
                      Download
                    </a>
                    <button
                      onClick={() => handleShare(epaper)}
                      className="bg-green-600 text-white py-3 px-4 rounded hover:bg-green-700 transition flex items-center justify-center"
                      title="Share"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedPdf.title || 'Coimbatore Express'} - {new Date(selectedPdf.issueDate).toLocaleDateString('en-IN', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h2>
              <button
                onClick={() => setSelectedPdf(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={downloadEpaperAPI(selectedPdf.id)}
                className="w-full h-full border rounded"
                title={`E-Paper ${selectedPdf.issueDate}`}
              />
            </div>
            <div className="flex gap-2 p-4 border-t">
              <a
                href={downloadEpaperAPI(selectedPdf.id)}
                target="_blank"
                rel="noopener noreferrer"
                download={`coimbatore-express-${selectedPdf.issueDate.split('T')[0]}.pdf`}
                className="flex-1 bg-[#0A1F44] text-white py-2 px-4 rounded hover:bg-[#1a3a6e] transition flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Download PDF
              </a>
              <button
                onClick={() => setSelectedPdf(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
