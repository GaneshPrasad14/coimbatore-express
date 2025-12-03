import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo */}
          <div className="flex items-center">
            <h3 className="text-xl">
              <span className="font-['Berkshire_Swash']">
                <span className="text-white">coimbatore</span>
                <span className="text-yellow-400"> express</span>
              </span>
            </h3>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-400 text-center md:text-left">
            © {currentYear} Coimbatore Express. All Rights Reserved.
          </p>

          {/* Social Icons */}
          <div className="flex space-x-3">
            <a href="https://www.facebook.com/coimbatoreexpress" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-400 transition">
              <Facebook size={18} />
            </a>
            <a href="https://www.instagram.com/coimbatoreexpress/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-400 transition">
              <Instagram size={18} />
            </a>
            <a href="https://twitter.com/coimbatoreexpress" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-400 transition">
              <Twitter size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
