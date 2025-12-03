import { useState } from 'react';
import {
  FileText,
  Users,
  FolderOpen,
  Image,
  Megaphone,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Sun,
  Moon,
  Star
} from 'lucide-react';
import ArticleManagement from '../components/ArticleManagement';
import CategoryManagement from '../components/CategoryManagement';
import AdsManagement from '../components/AdsManagement';
import EpaperManagement from '../components/EpaperManagement';
import HeroManagement from '../components/HeroManagement';

interface AdminDashboardProps {
  onLogout: () => void;
  user: { email: string; role: string };
}

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  user: { email: string; role: string };
  onLogout: () => void;
}

const navigationItems = [
  // { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'articles', label: 'Articles', icon: FileText },
  // { id: 'authors', label: 'Authors & Editors', icon: Users },
  // { id: 'categories', label: 'Categories', icon: FolderOpen },
  { id: 'hero', label: 'Hero Section', icon: Star },
  { id: 'epaper', label: 'E-Paper', icon: FileText },
  { id: 'ads', label: 'Advertisements', icon: Megaphone },
];

function AdminLayout({ children, currentPage, onPageChange, user, onLogout }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out`}>
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-[#0A1F44] dark:text-white">News Admin</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={24} />
            </button>
          </div>
          
          <nav className="mt-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                    isActive
                      ? 'bg-[#0A1F44] text-white border-r-4 border-[#D90429]'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-4"
                >
                  <Menu size={24} />
                </button>
                
                {/* Search Bar */}
                <div className="hidden md:block relative">
                  <input
                    type="text"
                    placeholder="Search articles, authors, categories..."
                    className="w-80 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" size={18} />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Notifications */}
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition relative">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default function AdminDashboard({ onLogout, user }: AdminDashboardProps) {
  const [currentPage, setCurrentPage] = useState('articles');

  const renderPage = () => {
    switch (currentPage) {
      // case 'dashboard':
      //   return (
      //     <div>
      //       <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>

      //       {/* Quick Stats Grid */}
      //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      //         <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      //           <div className="flex items-center justify-between">
      //             <div>
      //               <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Articles</p>
      //               <p className="text-3xl font-bold text-gray-900 dark:text-white">24</p>
      //             </div>
      //             <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
      //               <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      //             </div>
      //           </div>
      //           <div className="mt-4 flex items-center text-sm">
      //             <span className="text-green-600 font-medium">+12%</span>
      //             <span className="text-gray-500 dark:text-gray-400 ml-2">from last month</span>
      //           </div>
      //         </div>

      //         <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      //           <div className="flex items-center justify-between">
      //             <div>
      //               <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Authors</p>
      //               <p className="text-3xl font-bold text-gray-900 dark:text-white">8</p>
      //             </div>
      //             <div className="bg-green-100 dark:bg-green-900 rounded-full p-3">
      //               <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
      //             </div>
      //           </div>
      //           <div className="mt-4 flex items-center text-sm">
      //             <span className="text-green-600 font-medium">+2</span>
      //             <span className="text-gray-500 dark:text-gray-400 ml-2">new this month</span>
      //           </div>
      //         </div>

      //         <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      //           <div className="flex items-center justify-between">
      //             <div>
      //               <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Media Files</p>
      //               <p className="text-3xl font-bold text-gray-900 dark:text-white">156</p>
      //             </div>
      //             <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-3">
      //               <Image className="h-6 w-6 text-purple-600 dark:text-purple-400" />
      //             </div>
      //           </div>
      //           <div className="mt-4 flex items-center text-sm">
      //             <span className="text-green-600 font-medium">+18</span>
      //             <span className="text-gray-500 dark:text-gray-400 ml-2">new this week</span>
      //           </div>
      //         </div>
      //       </div>

      //     </div>
      //   );
      case 'articles':
        return <ArticleManagement />;
      // case 'authors':
      //   return (
      //     <div>
      //       <div className="flex justify-between items-center mb-6">
      //         <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Authors & Editors</h1>
      //         <button className="bg-[#0A1F44] text-white px-4 py-2 rounded-lg hover:bg-[#1a3a6e] transition">
      //           Add New Author
      //         </button>
      //       </div>
      //       <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      //         <p className="text-gray-600 dark:text-gray-400">Author management interface will be implemented here.</p>
      //       </div>
      //     </div>
      //   );
      // case 'categories':
      //   return <CategoryManagement />;
      case 'hero':
        return <HeroManagement />;
      case 'epaper':
        return <EpaperManagement />;
      case 'ads':
        return <AdsManagement />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <AdminLayout 
      currentPage={currentPage} 
      onPageChange={setCurrentPage} 
      user={user} 
      onLogout={onLogout}
    >
      {renderPage()}
    </AdminLayout>
  );
}