import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Search, Moon, Sun, Star, Calendar, Globe, Filter, ChevronLeft, ChevronRight, X, Play, Clock, Users, Film, Tv, Monitor, ArrowLeft, ExternalLink, MapPin, Award } from 'lucide-react';

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

// Modern Content Card Component
const ContentCard = ({ content, contentType, onClick }) => {
  const imageSizes = getImageSizes(content.poster_path);
  const title = contentType === CONTENT_TYPES.MOVIE ? content.title : content.name;
  const releaseDate = contentType === CONTENT_TYPES.MOVIE ? content.release_date : content.first_air_date;

  return (
    <div 
      onClick={() => onClick(content)}
      className="group relative cursor-pointer transform-gpu transition-all duration-500 hover:scale-105 hover:z-10"
    >
      {/* Main Card */}
      <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-800/50 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500">
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
                className="w-full h-full object-cover transform-gpu transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
                decoding="async"
              />
            </picture>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              {contentType === CONTENT_TYPES.MOVIE ? 
                <Film className="w-16 h-16 text-gray-600" /> :
                <Tv className="w-16 h-16 text-gray-600" />
              }
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Content Type Badge */}
          <div className="absolute top-3 right-3 transform translate-x-10 group-hover:translate-x-0 transition-transform duration-500">
            <div className={`p-2 rounded-full backdrop-blur-md ${
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
          
          {/* Rating and Year Overlay */}
          <div className="absolute bottom-4 left-4 right-4 transform translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center bg-black/60 backdrop-blur-md px-3 py-2 rounded-full">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-2" />
                <span className="font-bold text-sm">{content.vote_average?.toFixed(1) || 'N/A'}</span>
              </div>
              <div className="bg-black/60 backdrop-blur-md px-3 py-2 rounded-full">
                <span className="font-medium text-sm">
                  {releaseDate ? new Date(releaseDate).getFullYear() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Info */}
        <div className="p-4">
          <h3 className="font-bold text-white mb-2 line-clamp-2 leading-tight text-sm lg:text-base group-hover:text-purple-400 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-gray-400 text-xs lg:text-sm line-clamp-2 leading-relaxed">
            {content.overview || 'No overview available.'}
          </p>
        </div>
        
        {/* Hover Effect Border */}
        <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-purple-500/50 transition-all duration-500" />
      </div>
    </div>
  );
};

// Cast Member Component
const CastMember = ({ member, role = 'cast' }) => {
  const profileImage = member.profile_path 
    ? `${TMDB_IMAGE_BASE_URL}/w185${member.profile_path}`
    : null;

  return (
    <div className="flex flex-col items-center text-center group cursor-pointer">
      <div className="relative mb-3">
        <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600 group-hover:border-purple-500 transition-all duration-300 group-hover:scale-110">
          {profileImage ? (
            <img
              src={profileImage}
              alt={member.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users className="w-6 h-6 lg:w-8 lg:h-8 text-gray-500" />
            </div>
          )}
        </div>
        {/* Role indicator for crew members */}
        {role === 'crew' && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
            <Award className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      <div className="min-h-0">
        <p className="font-semibold text-white text-xs lg:text-sm mb-1 line-clamp-2 group-hover:text-purple-400 transition-colors duration-300">
          {member.name}
        </p>
        <p className="text-gray-400 text-xs line-clamp-2">
          {role === 'cast' ? member.character : member.job}
        </p>
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
  
  // Get key crew members
  const director = credits?.crew?.find(person => person.job === 'Director');
  const producers = credits?.crew?.filter(person => person.job === 'Producer').slice(0, 3) || [];
  const writers = credits?.crew?.filter(person => person.job === 'Writer' || person.job === 'Screenplay').slice(0, 3) || [];
  const creator = contentDetails?.created_by?.[0];
  
  const mainCast = credits?.cast?.slice(0, 12) || [];
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
        <div className="relative z-10 p-4 lg:p-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-3 bg-black/60 backdrop-blur-md hover:bg-black/80 text-white px-6 py-3 rounded-2xl transition-all duration-300 group hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-semibold">Back to Browse</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="relative z-10 px-4 lg:px-8 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* Poster */}
              <div className="flex-shrink-0 mx-auto lg:mx-0">
                <div className="w-80 lg:w-96">
                  {posterImageSizes ? (
                    <picture>
                      <source media="(max-width: 1024px)" srcSet={posterImageSizes.tablet} />
                      <source media="(min-width: 1025px)" srcSet={posterImageSizes.desktop} />
                      <img
                        src={posterImageSizes.fallback}
                        alt={title}
                        className="w-full rounded-3xl shadow-2xl"
                        loading="eager"
                      />
                    </picture>
                  ) : (
                    <div className="w-full aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl flex items-center justify-center">
                      {contentType === CONTENT_TYPES.MOVIE ? 
                        <Film className="w-24 h-24 text-gray-600" /> :
                        <Tv className="w-24 h-24 text-gray-600" />
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* Content Info */}
              <div className="flex-1 text-center lg:text-left">
                {/* Title */}
                <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
                  {title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-8">
                  <div className="flex items-center bg-yellow-500/20 backdrop-blur-md px-4 py-2 rounded-full">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-2" />
                    <span className="font-bold text-white text-lg">
                      {content.vote_average?.toFixed(1)}/10
                    </span>
                    <span className="ml-2 text-gray-300 text-sm">
                      ({content.vote_count?.toLocaleString()})
                    </span>
                  </div>
                  
                  <div className="flex items-center bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span className="font-medium">
                      {releaseDate ? new Date(releaseDate).getFullYear() : 'N/A'}
                    </span>
                  </div>
                  
                  {contentType === CONTENT_TYPES.MOVIE && contentDetails?.runtime && (
                    <div className="flex items-center bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white">
                      <Clock className="w-5 h-5 mr-2" />
                      <span className="font-medium">{contentDetails.runtime} min</span>
                    </div>
                  )}

                  {contentType === CONTENT_TYPES.TV && contentDetails?.number_of_seasons && (
                    <div className="flex items-center bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white">
                      <Monitor className="w-5 h-5 mr-2" />
                      <span className="font-medium">
                        {contentDetails.number_of_seasons} Season{contentDetails.number_of_seasons !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Genres */}
                {contentDetails?.genres && (
                  <div className="mb-8">
                    <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                      {contentDetails.genres.map(genre => (
                        <span 
                          key={genre.id}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-sm font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8">
                  {trailer && (
                    <button
                      onClick={() => window.open(`https://youtube.com/watch?v=${trailer.key}`, '_blank')}
                      className="flex items-center space-x-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg group"
                    >
                      <Play className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-bold text-lg">Watch Trailer</span>
                    </button>
                  )}
                  
                  <div className={`flex items-center space-x-3 px-8 py-4 rounded-2xl ${
                    contentType === CONTENT_TYPES.MOVIE 
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                      : 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                  }`}>
                    {contentType === CONTENT_TYPES.MOVIE ? 
                      <Film className="w-6 h-6" /> : 
                      <Tv className="w-6 h-6" />
                    }
                    <span className="font-bold text-lg">
                      {contentType === CONTENT_TYPES.MOVIE ? 'Movie' : 'TV Show'}
                    </span>
                  </div>
                </div>

                {/* Overview */}
                <div className="max-w-4xl">
                  <h3 className="text-2xl font-bold text-white mb-4">Overview</h3>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {content.overview || 'No overview available.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Content Sections */}
      <div className="bg-gradient-to-b from-black to-gray-900 px-4 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Key People Section */}
          {(director || creator || producers.length > 0 || writers.length > 0) && (
            <section>
              <h2 className="text-3xl font-bold text-white mb-8 text-center lg:text-left">Key People</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                {/* Director/Creator */}
                {director && <CastMember member={director} role="crew" />}
                {creator && <CastMember member={creator} role="crew" />}
                
                {/* Producers */}
                {producers.map(producer => (
                  <CastMember key={`producer-${producer.id}`} member={producer} role="crew" />
                ))}
                
                {/* Writers */}
                {writers.map(writer => (
                  <CastMember key={`writer-${writer.id}`} member={writer} role="crew" />
                ))}
              </div>
            </section>
          )}

          {/* Cast Section */}
          {mainCast.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold text-white mb-8 text-center lg:text-left">Cast</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {mainCast.map(actor => (
                  <CastMember key={actor.id} member={actor} role="cast" />
                ))}
              </div>
            </section>
          )}

          {/* Additional Info for TV Shows */}
          {contentType === CONTENT_TYPES.TV && contentDetails?.networks && contentDetails.networks.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold text-white mb-8 text-center lg:text-left">Networks</h2>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                {contentDetails.networks.map(network => (
                  <div 
                    key={network.id}
                    className="bg-gray-800/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-gray-700/50"
                  >
                    <span className="text-white font-semibold">{network.name}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Modern Filter Section
const FilterSection = ({ genres, selectedGenre, onGenreChange, selectedYear, onYearChange, selectedLanguage, onLanguageChange, contentType }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

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
    { code: 'ru', name: 'Russian' }
  ];

  return (
    <div className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 mb-8 border border-gray-800/50">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mr-4">
          <Filter className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white">
          Discover {contentType === CONTENT_TYPES.MOVIE ? 'Movies' : 'TV Shows'}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            Genre
          </label>
          <select
            value={selectedGenre}
            onChange={(e) => onGenreChange(e.target.value)}
            className="w-full p-4 bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-2xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-gray-800/80"
          >
            <option value="">All Genres</option>
            {genres.map(genre => (
              <option key={genre.id} value={genre.id}>{genre.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            {contentType === CONTENT_TYPES.MOVIE ? 'Release Year' : 'First Air Date Year'}
          </label>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="w-full p-4 bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-2xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-gray-800/80"
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            Language
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="w-full p-4 bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-2xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-gray-800/80"
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

// Modern Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    const pages = [];
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
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

  return (
    <div className="flex flex-col items-center space-y-8 py-16">
      <div className="flex items-center justify-center flex-wrap gap-3">
        {currentPage > 1 && (
          <button
            onClick={() => onPageChange(currentPage - 1)}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-purple-600 hover:to-blue-600 text-white rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg border border-gray-700/50"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </button>
        )}

        {pageNumbers[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-4 py-3 bg-gray-800/60 hover:bg-purple-600 text-white rounded-2xl transition-all duration-300 hover:scale-105 font-semibold"
            >
              1
            </button>
            {pageNumbers[0] > 2 && (
              <span className="px-2 text-gray-400">...</span>
            )}
          </>
        )}

        {pageNumbers.map(pageNum => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`px-4 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 ${
              pageNum === currentPage
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'bg-gray-800/60 hover:bg-purple-600 text-white'
            }`}
          >
            {pageNum}
          </button>
        ))}

        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="px-2 text-gray-400">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-4 py-3 bg-gray-800/60 hover:bg-purple-600 text-white rounded-2xl transition-all duration-300 hover:scale-105 font-semibold"
            >
              {totalPages}
            </button>
          </>
        )}

        {currentPage < totalPages && (
          <button
            onClick={() => onPageChange(currentPage + 1)}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-purple-600 hover:to-blue-600 text-white rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg border border-gray-700/50"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        )}
      </div>

      <div className="text-center">
        <span className="text-gray-400">
          Page <span className="text-purple-400 font-bold">{currentPage}</span> of{' '}
          <span className="text-white font-bold">{totalPages}</span>
        </span>
      </div>
    </div>
  );
};

// Modern Content Type Toggle
const ContentTypeToggle = ({ contentType, onContentTypeChange }) => {
  return (
    <div className="flex items-center space-x-2 bg-gray-900/80 backdrop-blur-md rounded-2xl p-2 border border-gray-800/50">
      <button
        onClick={() => onContentTypeChange(CONTENT_TYPES.MOVIE)}
        className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 font-bold ${
          contentType === CONTENT_TYPES.MOVIE
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
            : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
        }`}
      >
        <Film className="w-5 h-5" />
        <span>Movies</span>
      </button>
      <button
        onClick={() => onContentTypeChange(CONTENT_TYPES.TV)}
        className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 font-bold ${
          contentType === CONTENT_TYPES.TV
            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105'
            : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
        }`}
      >
        <Tv className="w-5 h-5" />
        <span>TV Shows</span>
      </button>
    </div>
  );
};

// Modern Loading Component
const LoadingSpinner = ({ contentType }) => (
  <div className="flex flex-col items-center justify-center py-32">
    <div className="relative mb-8">
      <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-500/30"></div>
      <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-purple-500 absolute top-0"></div>
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 animate-pulse"></div>
    </div>
    <div className="text-center">
      <h3 className="text-2xl font-bold text-white mb-2">
        Discovering Amazing Content
      </h3>
      <p className="text-gray-400 text-lg">
        Loading {contentType === CONTENT_TYPES.MOVIE ? 'movies' : 'TV shows'} for you...
      </p>
    </div>
  </div>
);

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
  const [showDetailView, setShowDetailView] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

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
    fetchContent();
  }, [debouncedSearchQuery, currentPage, selectedGenre, selectedYear, selectedLanguage, contentType]);

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
      const currentDate = new Date().toISOString().split('T')[0];
      
      let endpoint = `/discover/${contentType}`;
      let params = {
        page: currentPage,
        sort_by: contentType === CONTENT_TYPES.MOVIE ? 'release_date.desc' : 'first_air_date.desc'
      };

      if (selectedYear) {
        if (contentType === CONTENT_TYPES.MOVIE) {
          params.year = selectedYear;
          if (selectedYear === '2025') {
            params['release_date.lte'] = currentDate;
          }
        } else {
          params.first_air_date_year = selectedYear;
          if (selectedYear === '2025') {
            params['first_air_date.lte'] = currentDate;
          }
        }
      } else {
        if (contentType === CONTENT_TYPES.MOVIE) {
          params['release_date.lte'] = currentDate;
          params['release_date.gte'] = '1900-01-01';
        } else {
          params['first_air_date.lte'] = currentDate;
          params['first_air_date.gte'] = '1900-01-01';
        }
      }

      if (debouncedSearchQuery.trim()) {
        endpoint = `/search/${contentType}`;
        params.query = debouncedSearchQuery.trim();
        delete params.sort_by;
      }

      if (selectedGenre) {
        params.with_genres = selectedGenre;
      }

      if (selectedLanguage) {
        params.with_original_language = selectedLanguage;
      }

      const data = await apiRequest(endpoint, params);
      
      let filteredResults = (data.results || []).filter(item => {
        const releaseDate = contentType === CONTENT_TYPES.MOVIE ? item.release_date : item.first_air_date;
        if (!releaseDate) return false;
        
        const itemDate = new Date(releaseDate);
        const currentDateObj = new Date(currentDate);
        
        return itemDate <= currentDateObj;
      });

      filteredResults = filteredResults.sort((a, b) => {
        const dateA = contentType === CONTENT_TYPES.MOVIE ? a.release_date : a.first_air_date;
        const dateB = contentType === CONTENT_TYPES.MOVIE ? b.release_date : b.first_air_date;
        
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        
        return new Date(dateB) - new Date(dateA);
      });
      
      setContent(filteredResults);
      setTotalPages(Math.min(data.total_pages || 1, 500));
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
    setShowDetailView(true);
  };

  const handleBackToBrowse = () => {
    setShowDetailView(false);
    setSelectedContent(null);
  };

  const handleContentTypeChange = (newContentType) => {
    setContentType(newContentType);
  };

  // Show detail view if content is selected
  if (showDetailView && selectedContent) {
    return (
      <ContentDetailView
        content={selectedContent}
        contentType={contentType}
        onBack={handleBackToBrowse}
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-24">
              {/* Logo */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg">
                    <Monitor className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-30 animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-400 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    CINEMATIC
                  </h1>
                  <p className="text-sm text-gray-400 font-medium">STUDIO</p>
                </div>
              </div>

              {/* Desktop Content Toggle */}
              <div className="hidden lg:flex">
                <ContentTypeToggle 
                  contentType={contentType}
                  onContentTypeChange={handleContentTypeChange}
                />
              </div>
              
              {/* Desktop Search */}
              <div className="flex-1 max-w-2xl mx-8 hidden md:block">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-gray-400 group-focus-within:text-purple-400 transition-colors duration-300" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder={`Search ${contentType === CONTENT_TYPES.MOVIE ? 'movies' : 'TV shows'}...`}
                    className="block w-full pl-14 pr-6 py-4 bg-gray-900/60 backdrop-blur-md border border-gray-800/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-lg hover:bg-gray-900/80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/5 to-blue-600/0 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
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
            <div className="md:hidden pb-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors duration-300" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder={`Search ${contentType === CONTENT_TYPES.MOVIE ? 'movies' : 'TV shows'}...`}
                  className="block w-full pl-12 pr-4 py-4 bg-gray-900/60 backdrop-blur-md border border-gray-800/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-gray-900/80"
                />
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* API Key Warning */}
          {!API_KEY && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-xl border border-yellow-500/30 rounded-3xl p-8 mb-8 shadow-2xl">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-yellow-400 mb-3">
                    API Key Required
                  </h3>
                  <p className="text-yellow-200/90 text-lg mb-2">
                    Add your TMDB API key to unlock the full movie and TV show experience.
                  </p>
                  <p className="text-yellow-300/70">
                    Get your free key at: <span className="font-mono bg-yellow-400/20 px-3 py-1 rounded-lg">themoviedb.org</span>
                  </p>
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
            <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 backdrop-blur-xl border border-red-500/30 rounded-3xl p-8 mb-8 shadow-2xl">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <X className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-red-400 mb-3">
                    Something went wrong
                  </h3>
                  <p className="text-red-200/90 text-lg">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && <LoadingSpinner contentType={contentType} />}

          {/* Content Grid */}
          {!loading && content.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6 lg:gap-8 mb-8">
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
            <div className="text-center py-32">
              <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl rounded-3xl p-16 shadow-2xl border border-gray-800/50 max-w-2xl mx-auto">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                    <Search className="w-12 h-12 text-gray-300" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-600/20 to-gray-800/20 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-6">
                  No {contentType === CONTENT_TYPES.MOVIE ? 'Movies' : 'TV Shows'} Found
                </h3>
                <p className="text-gray-300 text-xl leading-relaxed">
                  Try adjusting your search terms or filters to discover amazing content.
                </p>
              </div>
            </div>
          )}

          {/* Welcome State */}
          {!API_KEY && !error && (
            <div className="text-center py-32">
              <div className="bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-black/60 backdrop-blur-xl rounded-3xl p-16 shadow-2xl border border-purple-500/20 max-w-4xl mx-auto">
                <div className="relative mb-12">
                  <div className="w-32 h-32 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                    <Monitor className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-full animate-pulse"></div>
                </div>
                
                <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-8">
                  Welcome to Cinematic Studio
                </h2>
                <p className="text-gray-300 text-2xl leading-relaxed mb-12">
                  Your premium destination for discovering movies and TV shows from around the world.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-blue-500/10 backdrop-blur-md p-8 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:transform hover:scale-105">
                    <Search className="w-12 h-12 text-blue-400 mb-6 mx-auto" />
                    <h4 className="font-bold text-white text-xl mb-4">Smart Discovery</h4>
                    <p className="text-gray-300 leading-relaxed">Advanced search and filtering to find exactly what you're looking for.</p>
                  </div>
                  
                  <div className="bg-purple-500/10 backdrop-blur-md p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:transform hover:scale-105">
                    <Star className="w-12 h-12 text-purple-400 mb-6 mx-auto" />
                    <h4 className="font-bold text-white text-xl mb-4">Rich Details</h4>
                    <p className="text-gray-300 leading-relaxed">Comprehensive information, cast details, and trailers for every title.</p>
                  </div>
                  
                  <div className="bg-green-500/10 backdrop-blur-md p-8 rounded-2xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:transform hover:scale-105">
                    <Globe className="w-12 h-12 text-green-400 mb-6 mx-auto" />
                    <h4 className="font-bold text-white text-xl mb-4">Global Content</h4>
                    <p className="text-gray-300 leading-relaxed">Explore entertainment from different countries and cultures.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
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