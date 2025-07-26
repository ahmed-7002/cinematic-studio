import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Search, Moon, Sun, Star, Calendar, Globe, Filter, ChevronLeft, ChevronRight, X, Play, Clock, Users, Film, Tv, Monitor } from 'lucide-react';

// TMDB API Configuration
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const API_KEY = '5439c598007c64a9e335cc7be4078732'; // <-- Insert your TMDB API key here

// Background image from Unsplash
const DARK_BG = 'https://images.unsplash.com/photo-1596727147705-61a532a659bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';

// Content types
const CONTENT_TYPES = {
  MOVIE: 'movie',
  TV: 'tv'
};

// Theme Context (simplified to always use dark theme)
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

// Content Card Component (handles both movies and TV shows)
const ContentCard = ({ content, contentType, onClick }) => {
  const posterUrl = content.poster_path 
    ? `${TMDB_IMAGE_BASE_URL}${content.poster_path}`
    : null;

  const title = contentType === CONTENT_TYPES.MOVIE ? content.title : content.name;
  const releaseDate = contentType === CONTENT_TYPES.MOVIE ? content.release_date : content.first_air_date;

  return (
    <div 
      onClick={() => onClick(content)}
      className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden border border-white/20 dark:border-gray-700/50"
    >
      <div className="aspect-[2/3] overflow-hidden relative">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.parentElement.innerHTML = `
                <div class="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                  <svg class="w-16 h-16 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                  </svg>
                </div>
              `;
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
            {contentType === CONTENT_TYPES.MOVIE ? 
              <Film className="w-16 h-16 text-gray-400 dark:text-gray-500" /> :
              <Tv className="w-16 h-16 text-gray-400 dark:text-gray-500" />
            }
          </div>
        )}
        
        {/* Content type indicator */}
        <div className="absolute top-2 right-2">
          <div className={`p-2 rounded-full backdrop-blur-sm ${
            contentType === CONTENT_TYPES.MOVIE 
              ? 'bg-blue-500/80 text-white' 
              : 'bg-purple-500/80 text-white'
          }`}>
            {contentType === CONTENT_TYPES.MOVIE ? 
              <Film className="w-4 h-4" /> : 
              <Tv className="w-4 h-4" />
            }
          </div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-2 left-2 right-2 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="font-semibold">{content.vote_average?.toFixed(1) || 'N/A'}</span>
            </div>
            <span className="bg-black/50 px-2 py-1 rounded-full text-xs">
              {releaseDate ? new Date(releaseDate).getFullYear() : 'N/A'}
            </span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
          {content.overview || 'No overview available.'}
        </p>
      </div>
    </div>
  );
};

// Content Detail Modal (handles both movies and TV shows)
const ContentDetailModal = ({ content, contentType, isOpen, onClose }) => {
  const [contentDetails, setContentDetails] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && content) {
      fetchContentDetails();
    }
  }, [isOpen, content, contentType]);

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

  if (!isOpen) return null;

  const backdropUrl = content.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${content.backdrop_path}`
    : null;

  const trailer = videos?.results?.find(video => 
    video.type === 'Trailer' && video.site === 'YouTube'
  );

  const title = contentType === CONTENT_TYPES.MOVIE ? content.title : content.name;
  const releaseDate = contentType === CONTENT_TYPES.MOVIE ? content.release_date : content.first_air_date;
  const director = credits?.crew?.find(person => person.job === 'Director');
  const creator = contentDetails?.created_by?.[0];
  const mainCast = credits?.cast?.slice(0, 6) || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 dark:border-gray-700/50">
        <div className="relative">
          {backdropUrl && (
            <div className="h-48 sm:h-64 md:h-80 overflow-hidden rounded-t-3xl relative">
              <img
                src={backdropUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
            </div>
          )}
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all duration-300 hover:scale-110"
          >
            <X className="w-6 h-6" />
          </button>

          {trailer && (
            <button
              onClick={() => window.open(`https://youtube.com/watch?v=${trailer.key}`, '_blank')}
              className="absolute bottom-4 left-4 flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Play className="w-5 h-5" />
              <span className="font-semibold">Watch Trailer</span>
            </button>
          )}

          {/* Content type badge */}
          <div className="absolute top-4 left-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl backdrop-blur-sm ${
              contentType === CONTENT_TYPES.MOVIE 
                ? 'bg-blue-600/90 text-white' 
                : 'bg-purple-600/90 text-white'
            }`}>
              {contentType === CONTENT_TYPES.MOVIE ? 
                <Film className="w-5 h-5" /> : 
                <Tv className="w-5 h-5" />
              }
              <span className="font-semibold">
                {contentType === CONTENT_TYPES.MOVIE ? 'Movie' : 'TV Show'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : (
            <>
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3">
                  <div className="sticky top-8">
                    <img
                      src={content.poster_path ? `${TMDB_IMAGE_BASE_URL}${content.poster_path}` : null}
                      alt={title}
                      className="w-full rounded-2xl shadow-2xl"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjUwIiB5PSIxMDAiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRTVFN0VCIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5Q0EwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
                      }}
                    />
                  </div>
                </div>
                
                <div className="lg:w-2/3">
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    {title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 px-3 py-2 rounded-xl">
                      <Star className="w-5 h-5 fill-yellow-500 text-yellow-500 mr-2" />
                      <span className="font-bold text-gray-900 dark:text-white text-lg">
                        {content.vote_average?.toFixed(1)}/10
                      </span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400 text-sm">
                        ({content.vote_count?.toLocaleString()} votes)
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 px-3 py-2 rounded-xl">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="font-medium">
                        {releaseDate ? new Date(releaseDate).getFullYear() : 'N/A'}
                      </span>
                    </div>
                    
                    {contentType === CONTENT_TYPES.MOVIE && contentDetails?.runtime && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 px-3 py-2 rounded-xl">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="font-medium">{contentDetails.runtime} min</span>
                      </div>
                    )}

                    {contentType === CONTENT_TYPES.TV && contentDetails?.number_of_seasons && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 px-3 py-2 rounded-xl">
                        <Monitor className="w-4 h-4 mr-2" />
                        <span className="font-medium">
                          {contentDetails.number_of_seasons} Season{contentDetails.number_of_seasons !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 px-3 py-2 rounded-xl">
                      <Globe className="w-4 h-4 mr-2" />
                      <span className="font-medium">{content.original_language?.toUpperCase()}</span>
                    </div>
                  </div>

                  {contentDetails?.genres && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Genres</h3>
                      <div className="flex flex-wrap gap-2">
                        {contentDetails.genres.map(genre => (
                          <span 
                            key={genre.id}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transition-shadow duration-300"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Overview
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                      {content.overview || 'No overview available.'}
                    </p>
                  </div>

                  {/* Show different info based on content type */}
                  {contentType === CONTENT_TYPES.MOVIE && director && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Director
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">{director.name}</p>
                    </div>
                  )}

                  {contentType === CONTENT_TYPES.TV && creator && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Creator
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">{creator.name}</p>
                    </div>
                  )}

                  {contentType === CONTENT_TYPES.TV && contentDetails?.networks && contentDetails.networks.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Networks
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {contentDetails.networks.map(network => (
                          <span 
                            key={network.id}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm font-medium"
                          >
                            {network.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {mainCast.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Main Cast
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {mainCast.map(actor => (
                          <div key={actor.id} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {actor.name}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400 text-sm">
                              as {actor.character}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Filter Component
const FilterSection = ({ genres, selectedGenre, onGenreChange, selectedYear, onYearChange, selectedLanguage, onLanguageChange, contentType }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  // Popular languages for filtering
  const languages = [
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
    { code: 'ru', name: 'Russian' },
    { code: 'th', name: 'Thai' },
    { code: 'tr', name: 'Turkish' },
    { code: 'nl', name: 'Dutch' },
    { code: 'sv', name: 'Swedish' },
    { code: 'no', name: 'Norwegian' },
    { code: 'da', name: 'Danish' },
    { code: 'fi', name: 'Finnish' },
    { code: 'pl', name: 'Polish' }
  ];

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-xl p-6 mb-8 border border-white/20 dark:border-gray-700/50">
      <div className="flex items-center mb-6">
        <Filter className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Filters for {contentType === CONTENT_TYPES.MOVIE ? 'Movies' : 'TV Shows'}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Genre
          </label>
          <select
            value={selectedGenre}
            onChange={(e) => onGenreChange(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 font-medium"
          >
            <option value="">All Genres</option>
            {genres.map(genre => (
              <option key={genre.id} value={genre.id}>{genre.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {contentType === CONTENT_TYPES.MOVIE ? 'Release Year' : 'First Air Date Year'}
          </label>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 font-medium"
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Language
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 font-medium"
          >
            <option value="">All Languages</option>
            {languages.map(language => (
              <option key={language.code} value={language.code}>{language.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    const pages = [];
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate start and end based on current page
      let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      // Adjust start if we're near the end
      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const showPrevious = currentPage > 1;
  const showNext = currentPage < totalPages;

  return (
    <div className="flex flex-col items-center space-y-6 py-12">
      {/* Main pagination controls */}
      <div className="flex items-center justify-center flex-wrap gap-3">
        {/* Previous Button */}
        {showPrevious && (
          <button
            onClick={() => onPageChange(currentPage - 1)}
            className="flex items-center px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>
        )}

        {/* First page button (if not in visible range) */}
        {pageNumbers[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              1
            </button>
            {pageNumbers[0] > 2 && (
              <span className="px-2 text-gray-500 dark:text-gray-400 font-bold">...</span>
            )}
          </>
        )}

        {/* Page numbers */}
        {pageNumbers.map(pageNum => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg ${
              pageNum === currentPage
                ? 'bg-blue-600 text-white border-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-2 border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700'
            }`}
          >
            {pageNum}
          </button>
        ))}

        {/* Last page button (if not in visible range) */}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="px-2 text-gray-500 dark:text-gray-400 font-bold">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next Button */}
        {showNext && (
          <button
            onClick={() => onPageChange(currentPage + 1)}
            className="flex items-center px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        )}
      </div>

      {/* Quick navigation buttons */}
      <div className="flex items-center space-x-4">
        {/* Go to First Page (only show when not on first page) */}
        {currentPage > 1 && (
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all duration-200"
          >
            First Page
          </button>
        )}

        {/* Page info */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Page</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">{currentPage}</span>
          <span>of</span>
          <span className="font-bold">{totalPages}</span>
        </div>

        {/* Go to Last Page (only show when not on last page) */}
        {currentPage < totalPages && (
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all duration-200"
          >
            Last Page
          </button>
        )}
      </div>
    </div>
  );
};

// Content Type Toggle Component
const ContentTypeToggle = ({ contentType, onContentTypeChange }) => {
  return (
    <div className="flex items-center space-x-1 bg-gray-800/80 backdrop-blur-md rounded-xl p-1 border border-gray-700/50">
      <button
        onClick={() => onContentTypeChange(CONTENT_TYPES.MOVIE)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 font-semibold ${
          contentType === CONTENT_TYPES.MOVIE
            ? 'bg-blue-600 text-white shadow-lg'
            : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
        }`}
      >
        <Film className="w-5 h-5" />
        <span>Movies</span>
      </button>
      <button
        onClick={() => onContentTypeChange(CONTENT_TYPES.TV)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 font-semibold ${
          contentType === CONTENT_TYPES.TV
            ? 'bg-purple-600 text-white shadow-lg'
            : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
        }`}
      >
        <Tv className="w-5 h-5" />
        <span>TV Shows</span>
      </button>
    </div>
  );
};

// Main App Component
const App = () => {
  const [content, setContent] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContent, setSelectedContent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [contentType, setContentType] = useState(CONTENT_TYPES.MOVIE);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch genres when content type changes
  useEffect(() => {
    fetchGenres();
  }, [contentType]);

  // Fetch content when filters change
  useEffect(() => {
    fetchContent();
  }, [debouncedSearchQuery, currentPage, selectedGenre, selectedYear, selectedLanguage, contentType]);

  // Reset filters when content type changes
  useEffect(() => {
    setSelectedGenre('');
    setSelectedYear('');
    setSelectedLanguage('');
    setCurrentPage(1);
    setSearchQuery('');
  }, [contentType]);

  const fetchGenres = async () => {
    try {
      const data = await apiRequest(`/genre/${contentType}/list`);
      setGenres(data.genres || []);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
      const currentYear = new Date().getFullYear();
      
      let endpoint = `/discover/${contentType}`;
      let params = {
        page: currentPage,
        sort_by: contentType === CONTENT_TYPES.MOVIE ? 'release_date.desc' : 'first_air_date.desc'
      };

      // Always filter out upcoming releases - only show content up to current date
      if (contentType === CONTENT_TYPES.MOVIE) {
        params['release_date.lte'] = currentDate; // Movies released up to today
      } else {
        params['first_air_date.lte'] = currentDate; // TV shows that aired up to today
      }

      if (debouncedSearchQuery.trim()) {
        endpoint = `/search/${contentType}`;
        params.query = debouncedSearchQuery.trim();
        // For search, we still want to sort by date if possible
        delete params.sort_by;
        // Keep the date filter for search results too
      }

      if (selectedGenre) {
        params.with_genres = selectedGenre;
      }

      if (selectedYear) {
        if (contentType === CONTENT_TYPES.MOVIE) {
          params.year = selectedYear;
        } else {
          params.first_air_date_year = selectedYear;
        }
      }

      if (selectedLanguage) {
        params.with_original_language = selectedLanguage;
      }

      const data = await apiRequest(endpoint, params);
      
      // Filter out any upcoming releases that might still appear and sort results by date in descending order (newest first)
      let filteredResults = (data.results || []).filter(item => {
        const releaseDate = contentType === CONTENT_TYPES.MOVIE ? item.release_date : item.first_air_date;
        if (!releaseDate) return false;
        return new Date(releaseDate) <= new Date(currentDate);
      });

      // Sort by date in descending order (newest first)
      filteredResults = filteredResults.sort((a, b) => {
        const dateA = contentType === CONTENT_TYPES.MOVIE ? a.release_date : a.first_air_date;
        const dateB = contentType === CONTENT_TYPES.MOVIE ? b.release_date : b.first_air_date;
        
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        
        return new Date(dateB) - new Date(dateA);
      });
      
      setContent(filteredResults);
      setTotalPages(Math.min(data.total_pages || 1, 500)); // TMDB limits to 500 pages
    } catch (error) {
      setError(error.message);
      setContent([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
    setCurrentPage(1);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setCurrentPage(1);
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContentClick = (content) => {
    setSelectedContent(content);
  };

  const handleContentTypeChange = (newContentType) => {
    setContentType(newContentType);
  };

  return (
    <div className="min-h-screen transition-all duration-300 relative">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${DARK_BG})`
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="bg-black/20 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                    <Monitor className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    CINEMATIC STUDIO
                  </h1>
                </div>
              </div>

              {/* Content Type Toggle */}
              <div className="hidden lg:flex">
                <ContentTypeToggle 
                  contentType={contentType}
                  onContentTypeChange={handleContentTypeChange}
                />
              </div>
              
              <div className="flex-1 max-w-2xl mx-8 hidden md:block">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder={`Search for ${contentType === CONTENT_TYPES.MOVIE ? 'movies' : 'TV shows'}...`}
                    className="block w-full pl-12 pr-4 py-4 border-2 border-gray-600/50 rounded-2xl bg-gray-800/80 backdrop-blur-md text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-lg font-medium"
                  />
                </div>
              </div>
            </div>
            
            {/* Mobile Content Type Toggle */}
            <div className="lg:hidden pb-4 flex justify-center">
              <ContentTypeToggle 
                contentType={contentType}
                onContentTypeChange={handleContentTypeChange}
              />
            </div>
            
            {/* Mobile Search */}
            <div className="md:hidden pb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder={`Search for ${contentType === CONTENT_TYPES.MOVIE ? 'movies' : 'TV shows'}...`}
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-600/50 rounded-xl bg-gray-800/80 backdrop-blur-md text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 font-medium"
                />
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* API Key Warning */}
          {!API_KEY && (
            <div className="bg-yellow-100/90 dark:bg-yellow-900/30 backdrop-blur-md border-2 border-yellow-300 dark:border-yellow-700 rounded-2xl p-6 mb-8 shadow-xl transition-colors duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
                    API Key Required
                  </h3>
                  <div className="mt-2 text-yellow-700 dark:text-yellow-300">
                    <p className="font-medium">Please add your TMDB API key to the API_KEY variable in the code to fetch movie and TV show data.</p>
                    <p className="text-sm mt-1">Get your free API key at: <span className="font-mono bg-yellow-200 dark:bg-yellow-800 px-2 py-1 rounded">themoviedb.org</span></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <FilterSection
            genres={genres}
            selectedGenre={selectedGenre}
            onGenreChange={handleGenreChange}
            selectedYear={selectedYear}
            onYearChange={handleYearChange}
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
            contentType={contentType}
          />

          {/* Error State */}
          {error && (
            <div className="bg-red-100/90 dark:bg-red-900/30 backdrop-blur-md border-2 border-red-300 dark:border-red-700 rounded-2xl p-6 mb-8 shadow-xl transition-colors duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                    <X className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-red-800 dark:text-red-200">
                    Error Loading {contentType === CONTENT_TYPES.MOVIE ? 'Movies' : 'TV Shows'}
                  </h3>
                  <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent shadow-lg"></div>
                <div className="absolute inset-0 rounded-full bg-blue-600/20 animate-pulse"></div>
              </div>
              <p className="mt-6 text-xl font-semibold text-gray-700 dark:text-gray-300">
                Loading amazing {contentType === CONTENT_TYPES.MOVIE ? 'movies' : 'TV shows'}...
              </p>
            </div>
          )}

          {/* Content Grid */}
          {!loading && content.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 sm:gap-8">
                {content.map(item => (
                  <ContentCard
                    key={item.id}
                    content={item}
                    contentType={contentType}
                    onClick={handleContentClick}
                  />
                ))}
              </div>
              
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}

          {/* No Results */}
          {!loading && content.length === 0 && !error && API_KEY && (
            <div className="text-center py-20">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl p-12 shadow-xl border border-white/20 dark:border-gray-700/50 max-w-md mx-auto transition-colors duration-300">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  No {contentType === CONTENT_TYPES.MOVIE ? 'Movies' : 'TV Shows'} Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                  No {contentType === CONTENT_TYPES.MOVIE ? 'movies' : 'TV shows'} match your current search criteria. Try adjusting your filters or search terms.
                </p>
              </div>
            </div>
          )}

          {/* Welcome State (when no API key and no error) */}
          {!API_KEY && !error && (
            <div className="text-center py-20">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl p-12 shadow-xl border border-white/20 dark:border-gray-700/50 max-w-2xl mx-auto transition-colors duration-300">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Monitor className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Welcome to Cinematic Studio</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xl leading-relaxed mb-8">
                  Your gateway to discovering amazing movies and TV shows from around the world. Add your TMDB API key to get started!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl transition-colors duration-300">
                    <Search className="w-8 h-8 text-blue-600 mb-3" />
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">Advanced Search</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Search through thousands of movies and TV shows with powerful filtering options.</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl transition-colors duration-300">
                    <Star className="w-8 h-8 text-purple-600 mb-3" />
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">Detailed Info</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Get comprehensive details, cast info, and watch trailers for both movies and TV shows.</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl transition-colors duration-300">
                    <Globe className="w-8 h-8 text-green-600 mb-3" />
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">Global Entertainment</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Explore movies and TV shows from different countries and languages.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Detail Modal */}
        <ContentDetailModal
          content={selectedContent}
          contentType={contentType}
          isOpen={!!selectedContent}
          onClose={() => setSelectedContent(null)}
        />
      </div>
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