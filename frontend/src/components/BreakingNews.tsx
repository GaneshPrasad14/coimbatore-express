import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

interface BreakingNewsItem {
  id: string;
  title: string;
}

interface BreakingNewsProps {
  items: BreakingNewsItem[];
}

export default function BreakingNews({ items }: BreakingNewsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="bg-yellow-500 text-black py-2 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex items-center">
        <div className="flex items-center space-x-2 mr-4 flex-shrink-0">
          <Zap size={16} fill="black" />
          <span className="font-bold text-sm uppercase">Top News</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div
            className="whitespace-nowrap transition-transform duration-500"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {items.map((item) => (
              <span key={item.id} className="inline-block w-full text-sm">
                {item.title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
