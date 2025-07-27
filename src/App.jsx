import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { Search, Moon, Sun, Star, Calendar, Globe, Filter, ChevronLeft, ChevronRight, X, Play, Clock, Users, Film, Tv, Monitor, ArrowLeft, ExternalLink, MapPin, Award, ArrowRight, ChevronDown, RotateCcw, Grid, Home } from 'lucide-react';

// TMDB API Configuration
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
const API_KEY = '5439c598007c64a9e335cc7be4078732'; // <-- Insert your TMDB API key here

// Background image from Unsplash - Modern cinema theme
const DARK_BG = 'https://images.unsplash.com/photo-1489599511077-a0a1b3f7f05a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';

// Content types
const CONTENT_TYPES = {
  MOVIE: 'movie',
  TV: 'tv'
};

// Language options for filtering
const LANGUAGES = [
  { code: '', name: 'All Languages' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' }
];

// Generate year options
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [{ value: '', label: 'All Years' }];
  for (let year = currentYear; year >= currentYear - 20; year--) {
    years.push({ value: year.toString(), label: year.toString() });
  }
  return years;
};

// Theme Context
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={{}}>
      <div className="dark">{children}</div>
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

// API utility functions
const apiRequest = async (endpoint, params = {}) => {
  if (!API_KEY) {
    throw new Error('TMDB API key is required. Please add your API key to the API_KEY variable.');
  }
  
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      url.searchParams.append(key, value);
    }
  });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  return response.json();
};

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Image size utility function
const getImageSizes = (posterPath) => {
  if (!posterPath) return null;
  
  return {
    mobile: `${TMDB_IMAGE_BASE_URL}/w342${posterPath}`,
    tablet: `${TMDB_IMAGE_BASE_URL}/w500${posterPath}`,
    desktop: `${TMDB_IMAGE_BASE_URL}/w780${posterPath}`,
    fallback: `${TMDB_IMAGE_BASE_URL}/w500${posterPath}`
  };
};

// Smart Pagination Component
const SmartPagination = ({ currentPage, totalPages, onPageChange }) => {
  // Calculate which pages to show (max 5 page numbers)
  const getVisiblePages = () => {
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    // Adjust start if we're near the end
    if (end - start + 1 < maxVisible && start > 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-center space-x-1 sm:space-x-2 px-2">
      {/* Previous Button */}
      {canGoPrevious && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-gray-800/60 hover:bg-purple-600 text-white rounded-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base"
        >
          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="font-medium hidden sm:inline">Previous</span>
          <span className="font-medium sm:hidden">Prev</span>
        </button>
      )}
      
      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {visiblePages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl font-bold transition-all duration-300 text-sm sm:text-base ${
              page === currentPage
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-110'
                : 'bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 hover:text-white hover:scale-105'
            }`}
          >
            {page}
          </button>
        ))}
      </div>
      
      {/* Next Button */}
      {canGoNext && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-gray-800/60 hover:bg-purple-600 text-white rounded-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base"
        >
          <span className="font-medium hidden sm:inline">Next</span>
          <span className="font-medium sm:hidden">Next</span>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      )}
    </div>
  );
};

// Filter Dropdown Component
const FilterDropdown = ({ label, value, onChange, options, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => (opt.value || opt.code) === value) || options[0];

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-xl text-white hover:bg-gray-800/80 transition-all duration-300 min-w-[140px] sm:min-w-[180px]"
      >
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          <div className="text-left">
            <div className="text-xs text-gray-400 uppercase tracking-wide">{label}</div>
            <div className="text-xs sm:text-sm font-medium truncate">
              {selectedOption.label || selectedOption.name}
            </div>
          </div>
        </div>
        <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-50 max-h-48 sm:max-h-64 overflow-y-auto">
          {options.map((option) => {
            const optionValue = option.value || option.code;
            const optionLabel = option.label || option.name;
            
            return (
              <button
                key={optionValue}
                onClick={() => {
                  onChange(optionValue);
                  setIsOpen(false);
                }}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-purple-600/20 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl ${
                  value === optionValue ? 'bg-purple-600/30 text-purple-400' : 'text-gray-300'
                }`}
              >
                <div className="text-xs sm:text-sm font-medium">{optionLabel}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Filter Badge Component
const FilterBadge = ({ label, value, onRemove }) => {
  if (!value) return null;

  return (
    <div className="inline-flex items-center space-x-1 sm:space-x-2 bg-purple-600/20 backdrop-blur-md border border-purple-500/30 rounded-full px-2 sm:px-3 py-1">
      <span className="text-xs sm:text-sm font-medium text-purple-400">{label}: {value}</span>
      <button
        onClick={onRemove}
        className="text-purple-400 hover:text-white transition-colors duration-200"
      >
        <X className="w-2 h-2 sm:w-3 sm:h-3" />
      </button>
    </div>
  );
};

// Genre Card Component
const GenreCard = ({ genre, contentType, onClick }) => {
  return (
    <div
      onClick={() => onClick(genre)}
      className="group cursor-pointer transform-gpu transition-all duration-300 hover:scale-105 hover:z-10"
    >
      <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-800/50 shadow-xl hover:shadow-purple-500/20 transition-all duration-300 p-4 sm:p-6 lg:p-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
          <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-blue-600/20"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center">
          <div className="mb-3 sm:mb-4">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center ${
              contentType === CONTENT_TYPES.MOVIE 
                ? 'bg-blue-500/20 border-2 border-blue-500/30' 
                : 'bg-purple-500/20 border-2 border-purple-500/30'
            } group-hover:scale-110 transition-transform duration-300`}>
              {contentType === CONTENT_TYPES.MOVIE ? 
                <Film className={`w-6 h-6 sm:w-8 sm:h-8 ${contentType === CONTENT_TYPES.MOVIE ? 'text-blue-400' : 'text-purple-400'}`} /> : 
                <Tv className={`w-6 h-6 sm:w-8 sm:h-8 ${contentType === CONTENT_TYPES.MOVIE ? 'text-blue-400' : 'text-purple-400'}`} />
              }
            </div>
          </div>
          
          <h3 className="font-bold text-white text-sm sm:text-lg mb-1 sm:mb-2 group-hover:text-purple-400 transition-colors duration-300">
            {genre.name}
          </h3>
          
          <p className="text-gray-400 text-xs sm:text-sm">
            Explore {genre.name.toLowerCase()} {contentType === CONTENT_TYPES.MOVIE ? 'movies' : 'shows'}
          </p>
        </div>
        
        {/* Hover Effect Border */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-purple-500/50 transition-all duration-300" />
      </div>
    </div>
  );
};

// Horizontal Content Card Component
const HorizontalContentCard = ({ content, contentType, onClick }) => {
  const imageSizes = getImageSizes(content.poster_path);
  const title = contentType === CONTENT_TYPES.MOVIE ? content.title : content.name;
  const releaseDate = contentType === CONTENT_TYPES.MOVIE ? content.release_date : content.first_air_date;

  return (
    <div 
      onClick={() => onClick(content)}
      className="group flex-shrink-0 cursor-pointer transform-gpu transition-all duration-300 hover:scale-105 hover:z-10 w-36 sm:w-48 md:w-56 lg:w-64"
    >
      {/* Main Card */}
      <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-xl sm:rounded-2xl overflow-hidden border border-gray-800/50 shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
        {/* Poster Image */}
        <div className="aspect-[2/3] overflow-hidden relative">
          {imageSizes ? (
            <picture>
              <source media="(max-width: 640px)" srcSet={imageSizes.mobile} />
              <source media="(max-width: 1024px)" srcSet={imageSizes.tablet} />
              <source media="(min-width: 1025px)" srcSet={imageSizes.desktop} />
              <img
                src={imageSizes.fallback}
                alt={title}
                className="w-full h-full object-cover transform-gpu transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                decoding="async"
              />
            </picture>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              {contentType === CONTENT_TYPES.MOVIE ? 
                <Film className="w-8 h-8 sm:w-12 sm:h-12 text-gray-600" /> :
                <Tv className="w-8 h-8 sm:w-12 sm:h-12 text-gray-600" />
              }
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Content Type Badge */}
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 transform translate-x-8 group-hover:translate-x-0 transition-transform duration-300">
            <div className={`p-1 sm:p-1.5 rounded-full backdrop-blur-md ${
              contentType === CONTENT_TYPES.MOVIE 
                ? 'bg-blue-500/80 text-white' 
                : 'bg-purple-500/80 text-white'
            }`}>
              {contentType === CONTENT_TYPES.MOVIE ? 
                <Film className="w-2 h-2 sm:w-3 sm:h-3" /> : 
                <Tv className="w-2 h-2 sm:w-3 sm:h-3" />
              }
            </div>
          </div>
          
          {/* Rating Overlay */}
          <div className="absolute bottom-1 left-1 right-1 sm:bottom-2 sm:left-2 sm:right-2 transform translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center bg-black/60 backdrop-blur-md px-1 py-0.5 sm:px-2 sm:py-1 rounded-full">
                <Star className="w-2 h-2 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400 mr-0.5 sm:mr-1" />
                <span className="font-bold text-xs">{content.vote_average?.toFixed(1) || 'N/A'}</span>
              </div>
              <div className="bg-black/60 backdrop-blur-md px-1 py-0.5 sm:px-2 sm:py-1 rounded-full">
                <span className="font-medium text-xs">
                  {releaseDate ? new Date(releaseDate).getFullYear() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Info */}
        <div className="p-2 sm:p-3">
          <h3 className="font-bold text-white mb-1 line-clamp-2 leading-tight text-xs sm:text-sm group-hover:text-purple-400 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
            {content.overview ? content.overview.substring(0, 60) + '...' : 'No overview available.'}
          </p>
        </div>
        
        {/* Hover Effect Border */}
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-transparent group-hover:border-purple-500/50 transition-all duration-300" />
      </div>
    </div>
  );
};

// See More Button Component
const SeeMoreButton = ({ onClick, genreName, contentType }) => {
  return (
    <div 
      onClick={onClick}
      className="group flex-shrink-0 cursor-pointer w-36 sm:w-48 md:w-56 lg:w-64 flex items-center justify-center"
    >
      <div className="relative bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-xl rounded-xl sm:rounded-2xl border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 h-full min-h-[240px] sm:min-h-[320px] flex flex-col items-center justify-center p-3 sm:p-6 group-hover:scale-105">
        <div className="relative mb-3 sm:mb-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
            <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 text-white group-hover:translate-x-1 transition-transform duration-300" />
          </div>
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        
        <h4 className="text-white font-bold text-sm sm:text-lg mb-1 sm:mb-2 text-center group-hover:text-purple-400 transition-colors duration-300">
          See More
        </h4>
        <p className="text-gray-400 text-xs sm:text-sm text-center leading-relaxed">
          Explore all {genreName.toLowerCase()} {contentType === CONTENT_TYPES.MOVIE ? 'movies' : 'shows'}
        </p>
        
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </div>
  );
};

// Explore More Genres Button Component
const ExploreMoreGenresButton = ({ onClick }) => {
  return (
    <div className="flex justify-center mb-6 sm:mb-8">
      <button
        onClick={onClick}
        className="flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg group"
      >
        <Grid className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-300" />
        <span className="font-bold text-sm sm:text-base">Explore More Genres</span>
        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300" />
      </button>
    </div>
  );
};

// See All Genres Section
const SeeAllGenresSection = ({ onSeeAllGenres }) => {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 mb-8 sm:mb-12">
      <div className="bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-purple-900/20 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-purple-500/20 shadow-2xl">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <Grid className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-xl sm:text-3xl font-bold text-white mb-2 sm:mb-4">
            Explore All Genres
          </h2>
          <p className="text-gray-300 text-sm sm:text-lg mb-4 sm:mb-8 max-w-2xl mx-auto">
            Discover movies and TV shows across all genres with advanced filtering options by year and language.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onSeeAllGenres}
              className="flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg group"
            >
              <Grid className="w-4 h-4 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-bold text-sm sm:text-lg">Browse All Genres</span>
              <ArrowRight className="w-3 h-3 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Genre Explorer Page Component
const GenreExplorerPage = ({ genres, contentType, onBack, onGenreClick }) => {
  const [filteredGenres, setFilteredGenres] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [genreContent, setGenreContent] = useState({});
  const [loading, setLoading] = useState(false);

  const yearOptions = generateYearOptions();

  useEffect(() => {
    setFilteredGenres(genres);
    fetchGenrePreviewContent();
  }, [genres]);

  const fetchGenrePreviewContent = async () => {
    setLoading(true);
    try {
      const contentPromises = genres.slice(0, 8).map(async (genre) => {
        const params = {
          with_genres: genre.id,
          sort_by: 'popularity.desc',
          page: 1
        };

        const data = await apiRequest(`/discover/${contentType}`, params);
        return {
          genreId: genre.id,
          count: data.total_results || 0
        };
      });

      const results = await Promise.all(contentPromises);
      const contentMap = {};
      results.forEach(({ genreId, count }) => {
        contentMap[genreId] = count;
      });
      
      setGenreContent(contentMap);
    } catch (error) {
      console.error('Error fetching genre content:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllFilters = () => {
    setSelectedYear('');
    setSelectedLanguage('');
  };

  const hasActiveFilters = selectedYear || selectedLanguage;

  const selectedYearLabel = yearOptions.find(opt => opt.value === selectedYear)?.label;
  const selectedLanguageLabel = LANGUAGES.find(opt => opt.code === selectedLanguage)?.name;

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-y-auto">
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-gray-800/50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
            {/* Main Header Row */}
            <div className="flex items-center justify-between h-12 sm:h-16">
              {/* Left: Back button + Title */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={onBack}
                  className="flex items-center space-x-2 sm:space-x-3 bg-gray-800/60 hover:bg-purple-600 text-white px-3 py-2 sm:px-4 rounded-xl transition-all duration-300 group hover:scale-105"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                  <span className="font-semibold text-sm sm:text-base">Back</span>
                </button>
                
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-white">All Genres</h1>
                  <p className="text-xs sm:text-sm text-gray-400">
                    {contentType === CONTENT_TYPES.MOVIE ? 'Movies' : 'TV Shows'}
                  </p>
                </div>
              </div>

              {/* Right: Desktop Filters */}
              <div className="hidden lg:flex items-center space-x-3">
                <FilterDropdown
                  label="Year"
                  value={selectedYear}
                  onChange={setSelectedYear}
                  options={yearOptions}
                  icon={Calendar}
                />
                
                <FilterDropdown
                  label="Language"
                  value={selectedLanguage}
                  onChange={setSelectedLanguage}
                  options={LANGUAGES}
                  icon={Globe}
                />

                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center space-x-2 bg-red-600/20 hover:bg-red-600/30 backdrop-blur-md border border-red-500/30 rounded-xl px-4 py-3 text-red-400 hover:text-white transition-all duration-300"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="font-medium">Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mt-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-between w-full bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-white"
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-sm sm:text-base">Filters</span>
                  {hasActiveFilters && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {/* Mobile Filter Options */}
              {showFilters && (
                <div className="mt-3 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <FilterDropdown
                      label="Year"
                      value={selectedYear}
                      onChange={setSelectedYear}
                      options={yearOptions}
                      icon={Calendar}
                    />
                    
                    <FilterDropdown
                      label="Language"
                      value={selectedLanguage}
                      onChange={setSelectedLanguage}
                      options={LANGUAGES}
                      icon={Globe}
                    />

                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="flex items-center justify-center space-x-2 bg-red-600/20 hover:bg-red-600/30 backdrop-blur-md border border-red-500/30 rounded-xl px-4 py-3 text-red-400 hover:text-white transition-all duration-300"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span className="font-medium">Clear All</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Applied Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-800/50">
                <span className="text-xs sm:text-sm text-gray-400 mr-2">Applied filters:</span>
                <FilterBadge
                  label="Year"
                  value={selectedYearLabel !== 'All Years' ? selectedYearLabel : ''}
                  onRemove={() => setSelectedYear('')}
                />
                <FilterBadge
                  label="Language"
                  value={selectedLanguageLabel !== 'All Languages' ? selectedLanguageLabel : ''}
                  onRemove={() => setSelectedLanguage('')}
                />
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="pt-4 sm:pt-8">
          {/* Genre Grid */}
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
              {filteredGenres.map(genre => (
                <div key={genre.id} className="relative">
                  <GenreCard
                    genre={genre}
                    contentType={contentType}
                    onClick={() => onGenreClick(genre, selectedYear, selectedLanguage)}
                  />
                  
                  {/* Content Count Badge */}
                  {genreContent[genre.id] && (
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-purple-600 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs font-bold shadow-lg">
                      {genreContent[genre.id] > 999 ? '999+' : genreContent[genre.id]}
                    </div>
                  )}
                  
                  {loading && (
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-gray-600 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center animate-pulse">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-400 rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Horizontal Scroll Section Component
const HorizontalScrollSection = ({ 
  genre, 
  content, 
  contentType, 
  onContentClick, 
  onSeeMoreClick, 
  onExploreMoreGenres,
  loading,
  isFirstSection = false
}) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScrollButtons();
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollButtons);
      return () => scrollContainer.removeEventListener('scroll', checkScrollButtons);
    }
  }, [checkScrollButtons, content]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      const targetScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const displayContent = content.slice(0, 10); // Limit to 10 items

  return (
    <div className="mb-8 sm:mb-12">
      {/* Explore More Genres Button - Only show for the first genre section */}
      {isFirstSection && (
        <ExploreMoreGenresButton onClick={onExploreMoreGenres} />
      )}

      {/* Genre Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 px-3 sm:px-4 lg:px-8">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">
            {genre.name}
          </h2>
          <div className={`px-2 py-1 sm:px-3 rounded-full text-xs font-semibold ${
            contentType === CONTENT_TYPES.MOVIE 
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
              : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
          }`}>
            {content.length} {contentType === CONTENT_TYPES.MOVIE ? 'Movies' : 'Shows'}
          </div>
        </div>
        
        {/* Desktop Navigation Buttons */}
        <div className="hidden md:flex items-center space-x-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`p-2 rounded-xl transition-all duration-300 ${
              canScrollLeft 
                ? 'bg-gray-800/60 hover:bg-purple-600 text-white shadow-lg hover:scale-105' 
                : 'bg-gray-800/30 text-gray-600 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`p-2 rounded-xl transition-all duration-300 ${
              canScrollRight 
                ? 'bg-gray-800/60 hover:bg-purple-600 text-white shadow-lg hover:scale-105' 
                : 'bg-gray-800/30 text-gray-600 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="relative group">
        <div 
          ref={scrollRef}
          className="flex space-x-2 sm:space-x-4 overflow-x-auto scrollbar-hide scroll-smooth px-3 sm:px-4 lg:px-8 pb-2"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {loading ? (
            // Loading Skeletons
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex-shrink-0 w-36 sm:w-48 md:w-56 lg:w-64">
                <div className="bg-gray-800/60 rounded-xl sm:rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-[2/3] bg-gray-700/60"></div>
                  <div className="p-2 sm:p-3">
                    <div className="h-3 sm:h-4 bg-gray-700/60 rounded mb-2"></div>
                    <div className="h-2 sm:h-3 bg-gray-700/60 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <>
              {/* Content Cards */}
              {displayContent.map(item => (
                <HorizontalContentCard
                  key={item.id}
                  content={item}
                  contentType={contentType}
                  onClick={onContentClick}
                />
              ))}
              
              {/* See More Button - Only show if there are more than 10 items */}
              {content.length > 10 && (
                <SeeMoreButton
                  onClick={() => onSeeMoreClick(genre)}
                  genreName={genre.name}
                  contentType={contentType}
                />
              )}
            </>
          )}
        </div>

        {/* Mobile Scroll Indicators */}
        <div className="flex justify-center mt-4 md:hidden">
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(Math.ceil(displayContent.length / 3), 5) }).map((_, index) => (
              <div
                key={index}
                className="w-1 h-1 sm:w-2 sm:h-2 bg-gray-600 rounded-full opacity-30"
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Full Page Content Detail View
const ContentDetailView = ({ content, contentType, onBack }) => {
  const [contentDetails, setContentDetails] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (content) {
      fetchContentDetails();
    }
  }, [content, contentType]);

  const fetchContentDetails = async () => {
    setLoading(true);
    try {
      const [details, creditsData, videosData] = await Promise.all([
        apiRequest(`/${contentType}/${content.id}`),
        apiRequest(`/${contentType}/${content.id}/credits`),
        apiRequest(`/${contentType}/${content.id}/videos`)
      ]);
      setContentDetails(details);
      setCredits(creditsData);
      setVideos(videosData);
    } catch (error) {
      console.error('Error fetching content details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!content) return null;

  const backdropUrl = content.backdrop_path 
    ? `${TMDB_IMAGE_BASE_URL}/w1280${content.backdrop_path}`
    : null;

  const trailer = videos?.results?.find(video => 
    video.type === 'Trailer' && video.site === 'YouTube'
  );

  const title = contentType === CONTENT_TYPES.MOVIE ? content.title : content.name;
  const releaseDate = contentType === CONTENT_TYPES.MOVIE ? content.release_date : content.first_air_date;
  
  const posterImageSizes = getImageSizes(content.poster_path);

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-y-auto">
      {/* Hero Section */}
      <div className="relative min-h-screen">
        {/* Background Image */}
        {backdropUrl && (
          <div className="absolute inset-0">
            <img
              src={backdropUrl}
              alt={title}
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
          </div>
        )}

        {/* Navigation */}
        <div className="relative z-10 p-3 sm:p-4 lg:p-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 sm:space-x-3 bg-black/60 backdrop-blur-md hover:bg-black/80 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl transition-all duration-300 group hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-semibold text-sm sm:text-base">Back</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="relative z-10 px-3 sm:px-4 lg:px-8 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12">
              {/* Poster */}
              <div className="flex-shrink-0 mx-auto lg:mx-0">
                <div className="w-64 sm:w-80 lg:w-96">
                  {posterImageSizes ? (
                    <picture>
                      <source media="(max-width: 1024px)" srcSet={posterImageSizes.tablet} />
                      <source media="(min-width: 1025px)" srcSet={posterImageSizes.desktop} />
                      <img
                        src={posterImageSizes.fallback}
                        alt={title}
                        className="w-full rounded-2xl sm:rounded-3xl shadow-2xl"
                        loading="eager"
                      />
                    </picture>
                  ) : (
                    <div className="w-full aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl flex items-center justify-center">
                      {contentType === CONTENT_TYPES.MOVIE ? 
                        <Film className="w-16 h-16 sm:w-24 sm:h-24 text-gray-600" /> :
                        <Tv className="w-16 h-16 sm:w-24 sm:h-24 text-gray-600" />
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* Content Info */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-2xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                  {title}
                </h1>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="flex items-center bg-yellow-500/20 backdrop-blur-md px-3 py-2 sm:px-4 rounded-full">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400 mr-2" />
                    <span className="font-bold text-white text-base sm:text-lg">
                      {content.vote_average?.toFixed(1)}/10
                    </span>
                  </div>
                  
                  <div className="flex items-center bg-white/10 backdrop-blur-md px-3 py-2 sm:px-4 rounded-full text-white">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="font-medium text-sm sm:text-base">
                      {releaseDate ? new Date(releaseDate).getFullYear() : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-6 sm:mb-8">
                  {trailer && (
                    <button
                      onClick={() => window.open(`https://youtube.com/watch?v=${trailer.key}`, '_blank')}
                      className="flex items-center space-x-2 sm:space-x-3 bg-red-600 hover:bg-red-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg group"
                    >
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-bold text-base sm:text-lg">Watch Trailer</span>
                    </button>
                  )}
                </div>

                <div className="max-w-4xl">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Overview</h3>
                  <p className="text-gray-300 leading-relaxed text-base sm:text-lg">
                    {content.overview || 'No overview available.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Genre Expanded View Component with Enhanced Filtering and Search
const GenreExpandedView = ({ genre, contentType, onBack, onContentClick, initialFilters = {}, initialPage = 1 }) => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedYear, setSelectedYear] = useState(initialFilters.year || '');
  const [selectedLanguage, setSelectedLanguage] = useState(initialFilters.language || '');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const yearOptions = generateYearOptions();

  useEffect(() => {
    fetchGenreContent();
  }, [genre, contentType, currentPage, selectedYear, selectedLanguage, debouncedSearchQuery]);

  const fetchGenreContent = async () => {
    setLoading(true);
    try {
      let data;
      
      if (debouncedSearchQuery.trim()) {
        // Search within genre
        const searchParams = {
          query: debouncedSearchQuery.trim(),
          page: currentPage
        };
        
        const searchData = await apiRequest(`/search/${contentType}`, searchParams);
        
        // Filter search results by genre
        const filteredResults = (searchData.results || []).filter(item => 
          item.genre_ids && item.genre_ids.includes(genre.id)
        );
        
        data = {
          results: filteredResults,
          total_pages: Math.ceil(filteredResults.length / 20)
        };
      } else {
        // Normal genre discovery
        const params = {
          with_genres: genre.id,
          page: currentPage,
          sort_by: contentType === CONTENT_TYPES.MOVIE ? 'release_date.desc' : 'first_air_date.desc'
        };

        if (selectedYear) {
          if (contentType === CONTENT_TYPES.MOVIE) {
            params.primary_release_year = selectedYear;
          } else {
            params.first_air_date_year = selectedYear;
          }
        }

        if (selectedLanguage) {
          params.with_original_language = selectedLanguage;
        }

        data = await apiRequest(`/discover/${contentType}`, params);
      }
      
      setContent(data.results || []);
      setTotalPages(Math.min(data.total_pages || 1, 500));
    } catch (error) {
      console.error('Error fetching genre content:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllFilters = () => {
    setSelectedYear('');
    setSelectedLanguage('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedYear || selectedLanguage || searchQuery.trim();
  const selectedYearLabel = yearOptions.find(opt => opt.value === selectedYear)?.label;
  const selectedLanguageLabel = LANGUAGES.find(opt => opt.code === selectedLanguage)?.name;

  const handleBackWithState = () => {
    onBack(currentPage); // Pass current page to parent
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-y-auto">
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-gray-800/50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
            {/* Explore More Genres Button */}
            <ExploreMoreGenresButton onClick={() => onBack('explore')} />

            {/* Main Header Row */}
            <div className="flex items-center justify-between h-12 sm:h-16">
              {/* Left: Back button + Genre name */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={handleBackWithState}
                  className="flex items-center space-x-2 sm:space-x-3 bg-gray-800/60 hover:bg-purple-600 text-white px-3 py-2 sm:px-4 rounded-xl transition-all duration-300 group hover:scale-105"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                  <span className="font-semibold text-sm sm:text-base">Back</span>
                </button>
                
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-white">{genre.name}</h1>
                  <p className="text-xs sm:text-sm text-gray-400">
                    {contentType === CONTENT_TYPES.MOVIE ? 'Movies' : 'TV Shows'}
                  </p>
                </div>
              </div>

              {/* Right: Desktop Search */}
              <div className="flex-1 max-w-lg mx-4 sm:mx-8 hidden md:block">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors duration-300" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder={`Search ${genre.name.toLowerCase()} ${contentType === CONTENT_TYPES.MOVIE ? 'movies' : 'shows'}...`}
                    className="block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 bg-gray-900/60 backdrop-blur-md border border-gray-800/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-gray-900/80 text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Right: Desktop Filters */}
              <div className="hidden lg:flex items-center space-x-3">
                <FilterDropdown
                  label="Year"
                  value={selectedYear}
                  onChange={(value) => {
                    setSelectedYear(value);
                    setCurrentPage(1);
                  }}
                  options={yearOptions}
                  icon={Calendar}
                />
                
                <FilterDropdown
                  label="Language"
                  value={selectedLanguage}
                  onChange={(value) => {
                    setSelectedLanguage(value);
                    setCurrentPage(1);
                  }}
                  options={LANGUAGES}
                  icon={Globe}
                />

                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center space-x-2 bg-red-600/20 hover:bg-red-600/30 backdrop-blur-md border border-red-500/30 rounded-xl px-4 py-3 text-red-400 hover:text-white transition-all duration-300"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="font-medium">Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Search */}
            <div className="md:hidden mt-3">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors duration-300" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={`Search ${genre.name.toLowerCase()} ${contentType === CONTENT_TYPES.MOVIE ? 'movies' : 'shows'}...`}
                  className="block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 bg-gray-900/60 backdrop-blur-md border border-gray-800/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-gray-900/80 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mt-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-between w-full bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-white"
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-sm sm:text-base">Filters</span>
                  {hasActiveFilters && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {/* Mobile Filter Options */}
              {showFilters && (
                <div className="mt-3 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <FilterDropdown
                      label="Year"
                      value={selectedYear}
                      onChange={(value) => {
                        setSelectedYear(value);
                        setCurrentPage(1);
                      }}
                      options={yearOptions}
                      icon={Calendar}
                    />
                    
                    <FilterDropdown
                      label="Language"
                      value={selectedLanguage}
                      onChange={(value) => {
                        setSelectedLanguage(value);
                        setCurrentPage(1);
                      }}
                      options={LANGUAGES}
                      icon={Globe}
                    />

                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="flex items-center justify-center space-x-2 bg-red-600/20 hover:bg-red-600/30 backdrop-blur-md border border-red-500/30 rounded-xl px-4 py-3 text-red-400 hover:text-white transition-all duration-300"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span className="font-medium">Clear All</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Applied Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-800/50">
                <span className="text-xs sm:text-sm text-gray-400 mr-2">Applied filters:</span>
                {searchQuery.trim() && (
                  <FilterBadge
                    label="Search"
                    value={searchQuery.trim()}
                    onRemove={() => {
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                  />
                )}
                <FilterBadge
                  label="Year"
                  value={selectedYearLabel !== 'All Years' ? selectedYearLabel : ''}
                  onRemove={() => {
                    setSelectedYear('');
                    setCurrentPage(1);
                  }}
                />
                <FilterBadge
                  label="Language"
                  value={selectedLanguageLabel !== 'All Languages' ? selectedLanguageLabel : ''}
                  onRemove={() => {
                    setSelectedLanguage('');
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="pt-4 sm:pt-8">
          {/* Content Grid */}
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="bg-gray-800/60 rounded-xl sm:rounded-2xl overflow-hidden animate-pulse">
                    <div className="aspect-[2/3] bg-gray-700/60"></div>
                    <div className="p-2 sm:p-3">
                      <div className="h-3 sm:h-4 bg-gray-700/60 rounded mb-2"></div>
                      <div className="h-2 sm:h-3 bg-gray-700/60 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : content.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
                  {content.map(item => (
                    <HorizontalContentCard
                      key={item.id}
                      content={item}
                      contentType={contentType}
                      onClick={onContentClick}
                    />
                  ))}
                </div>

                {/* Smart Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8 sm:mt-12">
                    <SmartPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            ) : (
              // No Results
              <div className="text-center py-16 sm:py-32">
                <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-16 shadow-2xl border border-gray-800/50 max-w-2xl mx-auto">
                  <div className="relative mb-6 sm:mb-8">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                      <Search className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-600/20 to-gray-800/20 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
                    No Results Found
                  </h3>
                  <p className="text-gray-300 text-base sm:text-xl leading-relaxed">
                    {searchQuery.trim() ? 
                      `No ${contentType === CONTENT_TYPES.MOVIE ? 'movies' : 'shows'} found matching "${searchQuery}" in ${genre.name}.` :
                      `No ${contentType === CONTENT_TYPES.MOVIE ? 'movies' : 'shows'} found with the selected filters.`
                    }
                    <br />
                    Try adjusting your search or filters.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Content Type Toggle
const ContentTypeToggle = ({ contentType, onContentTypeChange }) => {
  return (
    <div className="flex items-center space-x-1 sm:space-x-2 bg-gray-900/80 backdrop-blur-md rounded-xl sm:rounded-2xl p-1 sm:p-2 border border-gray-800/50">
      <button
        onClick={() => onContentTypeChange(CONTENT_TYPES.MOVIE)}
        className={`flex items-center space-x-2 sm:space-x-3 px-3 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 font-bold text-sm sm:text-base ${
          contentType === CONTENT_TYPES.MOVIE
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
            : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
        }`}
      >
        <Film className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Movies</span>
      </button>
      <button
        onClick={() => onContentTypeChange(CONTENT_TYPES.TV)}
        className={`flex items-center space-x-2 sm:space-x-3 px-3 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 font-bold text-sm sm:text-base ${
          contentType === CONTENT_TYPES.TV
            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105'
            : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
        }`}
      >
        <Tv className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>TV Shows</span>
      </button>
    </div>
  );
};

// Navigation Views
const VIEWS = {
  HOME: 'home',
  SEARCH: 'search',
  GENRE: 'genre',
  DETAIL: 'detail',
  GENRE_EXPLORER: 'genre_explorer'
};

// Main App Component
const App = () => {
  const [genres, setGenres] = useState([]);
  const [genreContent, setGenreContent] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedGenreFilters, setSelectedGenreFilters] = useState({});
  const [contentType, setContentType] = useState(CONTENT_TYPES.MOVIE);
  
  // Navigation Stack Management with page state
  const [navigationStack, setNavigationStack] = useState([{ view: VIEWS.HOME }]);
  const [currentView, setCurrentView] = useState(VIEWS.HOME);
  const [genrePageStates, setGenrePageStates] = useState({}); // Store page states for genres

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Navigation Functions
  const pushToNavigationStack = (view, data = {}) => {
    const navigationItem = { view, ...data };
    setNavigationStack(prev => [...prev, navigationItem]);
    setCurrentView(view);
  };

  const popFromNavigationStack = (preservedPage = null) => {
    if (navigationStack.length > 1) {
      const newStack = navigationStack.slice(0, -1);
      setNavigationStack(newStack);
      const previousView = newStack[newStack.length - 1];
      setCurrentView(previousView.view);
      
      // Store page state if provided
      if (preservedPage && selectedGenre) {
        if (preservedPage === 'explore') {
          // Navigate to genre explorer instead of storing page
          pushToNavigationStack(VIEWS.GENRE_EXPLORER);
          return;
        }
        setGenrePageStates(prev => ({
          ...prev,
          [`${selectedGenre.id}_${contentType}`]: preservedPage
        }));
      }
      
      // Clear state based on what view we're going back to
      if (previousView.view === VIEWS.HOME) {
        setSelectedContent(null);
        setSelectedGenre(null);
        setSelectedGenreFilters({});
      } else if (previousView.view === VIEWS.GENRE || previousView.view === VIEWS.GENRE_EXPLORER) {
        setSelectedContent(null);
      }
    } else {
      // If we're at the root, just go to home
      setNavigationStack([{ view: VIEWS.HOME }]);
      setCurrentView(VIEWS.HOME);
      setSelectedContent(null);
      setSelectedGenre(null);
      setSelectedGenreFilters({});
    }
  };

  const navigateToHome = () => {
    setNavigationStack([{ view: VIEWS.HOME }]);
    setCurrentView(VIEWS.HOME);
    setSelectedContent(null);
    setSelectedGenre(null);
    setSelectedGenreFilters({});
    setSearchQuery('');
    setGenrePageStates({}); // Clear page states when going home
  };

  // Smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  useEffect(() => {
    fetchGenres();
  }, [contentType]);

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      fetchSearchResults();
    } else {
      setSearchResults([]);
      // If we were in search view and search is cleared, go back to home
      if (currentView === VIEWS.SEARCH) {
        navigateToHome();
      }
    }
  }, [debouncedSearchQuery, contentType]);

  useEffect(() => {
    if (genres.length > 0) {
      fetchGenreContent();
    }
  }, [genres]);

  const fetchGenres = async () => {
    try {
      const data = await apiRequest(`/genre/${contentType}/list`);
      setGenres(data.genres || []);
    } catch (error) {
      console.error('Error fetching genres:', error);
      setError(error.message);
    }
  };

  const fetchGenreContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      const genrePromises = genres.slice(0, 8).map(async (genre) => {
        const params = {
          with_genres: genre.id,
          sort_by: contentType === CONTENT_TYPES.MOVIE ? 'popularity.desc' : 'popularity.desc',
          page: 1
        };

        if (contentType === CONTENT_TYPES.MOVIE) {
          params['release_date.lte'] = currentDate;
          params['release_date.gte'] = '1900-01-01';
        } else {
          params['first_air_date.lte'] = currentDate;
          params['first_air_date.gte'] = '1900-01-01';
        }

        const data = await apiRequest(`/discover/${contentType}`, params);
        
        const filteredResults = (data.results || []).filter(item => {
          const releaseDate = contentType === CONTENT_TYPES.MOVIE ? item.release_date : item.first_air_date;
          if (!releaseDate) return false;
          
          const itemDate = new Date(releaseDate);
          const currentDateObj = new Date(currentDate);
          
          return itemDate <= currentDateObj;
        });

        return {
          genre,
          content: filteredResults.slice(0, 12) // Get 12 items per genre
        };
      });

      const results = await Promise.all(genrePromises);
      const contentMap = {};
      
      results.forEach(({ genre, content }) => {
        contentMap[genre.id] = content;
      });
      
      setGenreContent(contentMap);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchResults = async () => {
    try {
      const data = await apiRequest(`/search/${contentType}`, {
        query: debouncedSearchQuery.trim(),
        page: 1
      });
      
      const currentDate = new Date().toISOString().split('T')[0];
      const filteredResults = (data.results || []).filter(item => {
        const releaseDate = contentType === CONTENT_TYPES.MOVIE ? item.release_date : item.first_air_date;
        if (!releaseDate) return false;
        
        const itemDate = new Date(releaseDate);
        const currentDateObj = new Date(currentDate);
        
        return itemDate <= currentDateObj;
      });

      setSearchResults(filteredResults);
      
      // Navigate to search view if we have results and we're not already there
      if (filteredResults.length > 0 && currentView !== VIEWS.SEARCH) {
        pushToNavigationStack(VIEWS.SEARCH);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleContentClick = (content) => {
    setSelectedContent(content);
    pushToNavigationStack(VIEWS.DETAIL);
  };

  const handleSeeMoreClick = (genre) => {
    setSelectedGenre(genre);
    setSelectedGenreFilters({});
    
    // Get stored page state for this genre, default to 1
    const storedPage = genrePageStates[`${genre.id}_${contentType}`] || 1;
    
    pushToNavigationStack(VIEWS.GENRE, { initialPage: storedPage });
  };

  const handleSeeAllGenres = () => {
    pushToNavigationStack(VIEWS.GENRE_EXPLORER);
  };

  const handleGenreClick = (genre, year = '', language = '') => {
    setSelectedGenre(genre);
    setSelectedGenreFilters({ year, language });
    pushToNavigationStack(VIEWS.GENRE, { initialPage: 1 });
  };

  const handleBackNavigation = (preservedPage = null) => {
    popFromNavigationStack(preservedPage);
  };

  const handleContentTypeChange = (newContentType) => {
    setContentType(newContentType);
    setSearchQuery('');
    setGenrePageStates({}); // Clear page states when switching content type
    navigateToHome();
  };

  // Get current navigation item to extract initial page
  const currentNavItem = navigationStack[navigationStack.length - 1] || { view: VIEWS.HOME };

  // Show detail view if content is selected
  if (currentView === VIEWS.DETAIL && selectedContent) {
    return (
      <ContentDetailView
        content={selectedContent}
        contentType={contentType}
        onBack={handleBackNavigation}
      />
    );
  }

  // Show genre expanded view
  if (currentView === VIEWS.GENRE && selectedGenre) {
    return (
      <GenreExpandedView
        genre={selectedGenre}
        contentType={contentType}
        onBack={handleBackNavigation}
        onContentClick={handleContentClick}
        initialFilters={selectedGenreFilters}
        initialPage={currentNavItem.initialPage || 1}
      />
    );
  }

  // Show genre explorer view
  if (currentView === VIEWS.GENRE_EXPLORER) {
    return (
      <GenreExplorerPage
        genres={genres}
        contentType={contentType}
        onBack={handleBackNavigation}
        onGenreClick={handleGenreClick}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-110 transition-transform duration-1000"
          style={{
            backgroundImage: `url(${DARK_BG})`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-purple-900/20 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Modern Navigation */}
        <nav className="bg-black/60 backdrop-blur-2xl border-b border-gray-800/50 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24">
              {/* Logo */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="relative">
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl sm:rounded-2xl shadow-lg">
                    <Monitor className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl sm:rounded-2xl blur opacity-30 animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-400 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    CINEMATIC
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-400 font-medium">STUDIO</p>
                </div>
              </div>

              {/* Conditional Home Button - Only show when NOT on home view */}
              {currentView !== VIEWS.HOME && (
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <button
                    onClick={navigateToHome}
                    className="flex items-center space-x-1 sm:space-x-2 bg-gray-800/60 hover:bg-blue-600 text-white px-3 py-2 sm:px-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg group"
                  >
                    <Home className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-semibold text-sm sm:text-base">Home</span>
                  </button>

                  {/* Desktop Content Toggle */}
                  <div className="hidden lg:flex">
                    <ContentTypeToggle 
                      contentType={contentType}
                      onContentTypeChange={handleContentTypeChange}
                    />
                  </div>
                </div>
              )}

              {/* Home view - Show desktop content toggle in original position */}
              {currentView === VIEWS.HOME && (
                <div className="hidden lg:flex">
                  <ContentTypeToggle 
                    contentType={contentType}
                    onContentTypeChange={handleContentTypeChange}
                  />
                </div>
              )}
              
              {/* Desktop Search - Only show on HOME view */}
              {currentView === VIEWS.HOME && (
                <div className="flex-1 max-w-2xl mx-4 sm:mx-8 hidden md:block">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 sm:pl-6 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 group-focus-within:text-purple-400 transition-colors duration-300" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearch}
                      placeholder={`Search ${contentType === CONTENT_TYPES.MOVIE ? 'movies' : 'TV shows'}...`}
                      className="block w-full pl-12 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 bg-gray-900/60 backdrop-blur-md border border-gray-800/50 rounded-xl sm:rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-base sm:text-lg hover:bg-gray-900/80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/5 to-blue-600/0 rounded-xl sm:rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Mobile Content Type Toggle */}
            <div className="lg:hidden pb-3 sm:pb-4 flex justify-center">
              <ContentTypeToggle 
                contentType={contentType}
                onContentTypeChange={handleContentTypeChange}
              />
            </div>
            
            {/* Mobile Search - Only show on HOME view */}
            {currentView === VIEWS.HOME && (
              <div className="md:hidden pb-4 sm:pb-6">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors duration-300" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder={`Search ${contentType === CONTENT_TYPES.MOVIE ? 'movies' : 'TV shows'}...`}
                    className="block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-900/60 backdrop-blur-md border border-gray-800/50 rounded-xl sm:rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-gray-900/80 text-sm sm:text-base"
                  />
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Main Content with proper spacing to avoid header overlap */}
        <div className="pt-4 sm:pt-8">
          {/* API Key Warning */}
          {!API_KEY && (
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 mb-6 sm:mb-8">
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-xl border border-yellow-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl">
                <div className="flex items-start space-x-3 sm:space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-2xl font-bold text-yellow-400 mb-2 sm:mb-3">
                      API Key Required
                    </h3>
                    <p className="text-yellow-200/90 text-sm sm:text-lg mb-1 sm:mb-2">
                      Add your TMDB API key to unlock the full movie and TV show experience.
                    </p>
                    <p className="text-yellow-300/70 text-xs sm:text-base">
                      Get your free key at: <span className="font-mono bg-yellow-400/20 px-2 py-1 sm:px-3 rounded-lg text-xs sm:text-sm">themoviedb.org</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 mb-6 sm:mb-8">
              <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl">
                <div className="flex items-start space-x-3 sm:space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                      <X className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-2xl font-bold text-red-400 mb-2 sm:mb-3">
                      Something went wrong
                    </h3>
                    <p className="text-red-200/90 text-sm sm:text-lg">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Results View */}
          {currentView === VIEWS.SEARCH && searchResults.length > 0 && (
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 mb-6 sm:mb-8">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                  Search Results for "{searchQuery}"
                </h2>
                <p className="text-gray-400 text-sm sm:text-base">
                  Found {searchResults.length} {contentType === CONTENT_TYPES.MOVIE ? 'movies' : 'TV shows'}
                </p>
              </div>
              
              <div className="flex space-x-2 sm:space-x-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2">
                {searchResults.slice(0, 20).map(item => (
                  <HorizontalContentCard
                    key={item.id}
                    content={item}
                    contentType={contentType}
                    onClick={handleContentClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Genre Sections - Only show on HOME view */}
          {API_KEY && currentView === VIEWS.HOME && (
            <>
              {/* See All Genres Section */}
              <SeeAllGenresSection onSeeAllGenres={handleSeeAllGenres} />

              {genres.slice(0, 8).map((genre, index) => (
                <HorizontalScrollSection
                  key={genre.id}
                  genre={genre}
                  content={genreContent[genre.id] || []}
                  contentType={contentType}
                  onContentClick={handleContentClick}
                  onSeeMoreClick={handleSeeMoreClick}
                  onExploreMoreGenres={handleSeeAllGenres}
                  loading={loading && !genreContent[genre.id]}
                  isFirstSection={index === 0}
                />
              ))}
            </>
          )}

          {/* Welcome State - Only show on HOME view */}
          {!API_KEY && !error && currentView === VIEWS.HOME && (
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
              <div className="text-center py-16 sm:py-32">
                <div className="bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-black/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-16 shadow-2xl border border-purple-500/20 max-w-4xl mx-auto">
                  <div className="relative mb-8 sm:mb-12">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                      <Monitor className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-full animate-pulse"></div>
                  </div>
                  
                  <h2 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-6 sm:mb-8">
                    Welcome to Cinematic Studio
                  </h2>
                  <p className="text-gray-300 text-lg sm:text-2xl leading-relaxed mb-8 sm:mb-12">
                    Your premium destination for discovering movies and TV shows by genre.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
                    <div className="bg-blue-500/10 backdrop-blur-md p-4 sm:p-8 rounded-xl sm:rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:transform hover:scale-105">
                      <Search className="w-8 h-8 sm:w-12 sm:h-12 text-blue-400 mb-4 sm:mb-6 mx-auto" />
                      <h4 className="font-bold text-white text-lg sm:text-xl mb-2 sm:mb-4">Genre Discovery</h4>
                      <p className="text-gray-300 leading-relaxed text-sm sm:text-base">Browse content organized by genres with horizontal scrolling sections.</p>
                    </div>
                    
                    <div className="bg-purple-500/10 backdrop-blur-md p-4 sm:p-8 rounded-xl sm:rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:transform hover:scale-105">
                      <Star className="w-8 h-8 sm:w-12 sm:h-12 text-purple-400 mb-4 sm:mb-6 mx-auto" />
                      <h4 className="font-bold text-white text-lg sm:text-xl mb-2 sm:mb-4">Smart Navigation</h4>
                      <p className="text-gray-300 leading-relaxed text-sm sm:text-base">Horizontal scroll with "See More" buttons for expanded genre exploration.</p>
                    </div>
                    
                    <div className="bg-green-500/10 backdrop-blur-md p-4 sm:p-8 rounded-xl sm:rounded-2xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:transform hover:scale-105">
                      <Globe className="w-8 h-8 sm:w-12 sm:h-12 text-green-400 mb-4 sm:mb-6 mx-auto" />
                      <h4 className="font-bold text-white text-lg sm:text-xl mb-2 sm:mb-4">Mobile Optimized</h4>
                      <p className="text-gray-300 leading-relaxed text-sm sm:text-base">Touch-friendly horizontal scrolling with responsive card layouts.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Results for Search */}
          {currentView === VIEWS.SEARCH && searchResults.length === 0 && searchQuery.trim() && (
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
              <div className="text-center py-16 sm:py-32">
                <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-16 shadow-2xl border border-gray-800/50 max-w-2xl mx-auto">
                  <div className="relative mb-6 sm:mb-8">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                      <Search className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-600/20 to-gray-800/20 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
                    No Results Found
                  </h3>
                  <p className="text-gray-300 text-lg sm:text-xl leading-relaxed">
                    Try different search terms or browse by genre below.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

// Root App with Theme Provider
export default function CinematicStudio() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}