import { Search, Menu, X, Sun, Cloud, CloudRain, CloudSnow, Wind, Thermometer } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCategories } from '../lib/dataService';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Header({ onNavigate, currentPage }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 28,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    icon: 'partly-cloudy'
  });

  useEffect(() => {
    loadCategories();
    loadWeather();
  }, []);

  const loadCategories = async (retryCount = 0) => {
    try {
      const response = await fetch('http://localhost:5001/api/categories');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCategories(result.data.categories);
        } else {
          console.error('Failed to load categories:', result.message);
        }
      } else if (response.status === 429 && retryCount < 3) {
        // Rate limited, wait and retry with exponential backoff
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.warn(`Rate limited, retrying in ${delay}ms...`);
        setTimeout(() => loadCategories(retryCount + 1), delay);
      } else {
        console.error('Failed to fetch categories:', response.status);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback to local data if backend is not available
      try {
        const data = getCategories();
        setCategories(data);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }
  };

  const loadWeather = async () => {
    try {
      // Using Open-Meteo API for Coimbatore weather (free, no API key required)
      // Coimbatore coordinates: 11.0168° N, 76.9558° E
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=11.0168&longitude=76.9558&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Asia%2FKolkata'
      );

      if (response.ok) {
        const data = await response.json();
        const weatherData: WeatherData = {
          temperature: Math.round(data.current.temperature_2m),
          condition: getWeatherConditionFromCode(data.current.weather_code),
          humidity: data.current.relative_humidity_2m,
          windSpeed: Math.round(data.current.wind_speed_10m),
          icon: getWeatherIconFromCode(data.current.weather_code)
        };
        setWeather(weatherData);
      } else {
        console.warn('Weather API failed, using fallback data');
        // Try fallback API
        await loadWeatherFallback();
      }
    } catch (error) {
      console.error('Error loading weather:', error);
      // Try fallback API
      await loadWeatherFallback();
    }
  };

  const loadWeatherFallback = async () => {
    try {
      // Fallback to a simple weather service
      const response = await fetch('https://wttr.in/Coimbatore?format=j1');

      if (response.ok) {
        const data = await response.json();
        const current = data.current_condition[0];
        const weatherData: WeatherData = {
          temperature: Math.round(parseFloat(current.temp_C)),
          condition: current.weatherDesc[0].value,
          humidity: parseInt(current.humidity),
          windSpeed: Math.round(parseFloat(current.windspeedKmph)),
          icon: getWeatherIconFromCondition(current.weatherDesc[0].value.toLowerCase())
        };
        setWeather(weatherData);
      }
    } catch (error) {
      console.error('Fallback weather API also failed:', error);
      // Keep default weather data as final fallback
    }
  };

  const getWeatherConditionFromCode = (code: number): string => {
    // WMO Weather interpretation codes
    if (code === 0) return 'Clear sky';
    if (code >= 1 && code <= 3) return 'Partly cloudy';
    if (code >= 45 && code <= 48) return 'Fog';
    if (code >= 51 && code <= 55) return 'Drizzle';
    if (code >= 56 && code <= 57) return 'Freezing Drizzle';
    if (code >= 61 && code <= 65) return 'Rain';
    if (code >= 66 && code <= 67) return 'Freezing Rain';
    if (code >= 71 && code <= 75) return 'Snow fall';
    if (code === 77) return 'Snow grains';
    if (code >= 80 && code <= 82) return 'Rain showers';
    if (code >= 85 && code <= 86) return 'Snow showers';
    if (code >= 95 && code <= 99) return 'Thunderstorm';
    return 'Partly cloudy';
  };

  const getWeatherIconFromCode = (code: number): string => {
    // WMO Weather interpretation codes
    if (code === 0) return 'sunny';
    if (code >= 1 && code <= 3) return 'partly-cloudy';
    if (code >= 45 && code <= 48) return 'cloudy';
    if (code >= 51 && code <= 67) return 'rainy';
    if (code >= 71 && code <= 86) return 'snowy';
    if (code >= 95 && code <= 99) return 'rainy';
    return 'partly-cloudy';
  };

  const getWeatherIconFromCondition = (condition: string): string => {
    if (condition.includes('sunny') || condition.includes('clear')) return 'sunny';
    if (condition.includes('cloud')) return 'partly-cloudy';
    if (condition.includes('rain') || condition.includes('drizzle')) return 'rainy';
    if (condition.includes('snow')) return 'snowy';
    if (condition.includes('fog') || condition.includes('mist')) return 'cloudy';
    return 'partly-cloudy';
  };

  const getWeatherIconFromAPI = (condition: string): string => {
    switch (condition) {
      case 'clear':
        return 'sunny';
      case 'clouds':
        return 'partly-cloudy';
      case 'rain':
      case 'drizzle':
        return 'rainy';
      case 'snow':
        return 'snowy';
      case 'mist':
      case 'fog':
      case 'haze':
        return 'cloudy';
      default:
        return 'partly-cloudy';
    }
  };

  const navItems = ['Home', ...categories.map(cat => cat.name), 'E-Paper'];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getWeatherIcon = () => {
    const iconProps = { size: 20, className: "text-yellow-400" };
    switch (weather.icon) {
      case 'sunny':
        return <Sun {...iconProps} />;
      case 'partly-cloudy':
        return (
          <div className="flex items-center space-x-1">
            <Sun {...iconProps} />
            <Cloud {...iconProps} />
          </div>
        );
      case 'cloudy':
        return <Cloud {...iconProps} />;
      case 'rainy':
        return <CloudRain {...iconProps} />;
      case 'snowy':
        return <CloudSnow {...iconProps} />;
      default:
        return <Sun {...iconProps} />;
    }
  };

  return (
    <header className="bg-black text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <div>
              <h1 className="text-3xl md:text-4xl tracking-tight">
                <span className="font-['Berkshire_Swash']">
                  <span className="text-white">coimbatore</span>
                  <span className="text-yellow-400"> express</span>
                </span>
              </h1>
              <p className="text-sm md:text-xs text-gray-300">The English Voice of Coimbatore</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-6">
            {/* Weather Section */}
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
              {getWeatherIcon()}
              <div className="text-sm">
                <div className="font-semibold text-yellow-400">{weather.temperature}°C</div>
                <div className="text-xs text-gray-300">Coimbatore</div>
              </div>
              <div className="text-xs text-gray-400 border-l border-white/20 pl-3">
                <div className="flex items-center space-x-1">
                  <Thermometer size={12} />
                  <span>{weather.humidity}%</span>
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  <Wind size={12} />
                  <span>{weather.windSpeed} km/h</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-full px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#D90429] w-64"
              />
              <Search className="absolute left-3 top-2.5 text-gray-300" size={16} />
            </form>
          </div>

          <button
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Weather */}
        <div className="lg:hidden flex items-center justify-between py-2 border-t border-white/10">
          <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
            {getWeatherIcon()}
            <div className="text-sm">
              <div className="font-semibold text-yellow-400">{weather.temperature}°C</div>
              <div className="text-xs text-gray-300">Coimbatore</div>
            </div>
          </div>

          <form onSubmit={handleSearch} className="relative flex-1 max-w-xs mx-4">
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-full px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#D90429] w-full"
            />
            <Search className="absolute left-3 top-2.5 text-gray-300" size={16} />
          </form>
        </div>

        <nav className={`${isMenuOpen ? 'block' : 'hidden'} lg:block border-t border-white/10 py-2`}>
          <ul className="flex flex-col lg:flex-row lg:space-x-6 space-y-2 lg:space-y-0">
            {navItems.map((item) => {
              // Find category for navigation
              const category = categories.find(cat => cat.name === item);
              const navSlug = item === 'Home' ? 'home' : item === 'E-Paper' ? 'epaper' : (category?.slug || item.toLowerCase().replace(' ', '-'));

              return (
                <li key={item}>
                  <button
                    onClick={() => {
                      onNavigate(navSlug);
                      setIsMenuOpen(false);
                    }}
                    className={`block py-2 px-3 rounded hover:bg-white/10 transition ${currentPage === navSlug
                        ? 'text-yellow-400 font-semibold'
                        : ''
                      }`}
                  >
                    {item}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
