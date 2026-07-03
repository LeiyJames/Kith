import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Post } from '../services/mockDb';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Map, List, Search as SearchIcon, MapPin, Navigation, ShieldCheck, Target } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Coordinates layout mapping for Leaflet actual map
interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  type: Post['type'];
  title: string;
  post: Post;
}

const CATEGORY_CHIPS = ['All', 'General Help', 'Tutoring', 'Volunteer', 'Donations', 'Emergency Response', 'Community Events', 'Jobs'];

export const Search: React.FC = () => {
  const { posts, showToast } = useApp();
  const navigate = useNavigate();
  
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedUrgency, setSelectedUrgency] = useState('All');
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const [expandedSearchPostId, setExpandedSearchPostId] = useState<string | null>(null);

  const [gpsLocation, setGpsLocation] = useState<[number, number]>([14.5995, 120.9842]); // Default Manila center
  const [gpsLoading, setGpsLoading] = useState(false);

  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesQuery = 
        post.title.toLowerCase().includes(query.toLowerCase()) || 
        post.description.toLowerCase().includes(query.toLowerCase()) ||
        post.authorName.toLowerCase().includes(query.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'All' || 
        post.category.toLowerCase().includes(selectedCategory.toLowerCase()) || 
        post.type.toLowerCase().includes(selectedCategory.toLowerCase());
      
      const matchesUrgency = 
        selectedUrgency === 'All' || 
        post.urgency === selectedUrgency;

      return matchesQuery && matchesCategory && matchesUrgency;
    });
  }, [posts, query, selectedCategory, selectedUrgency]);

  // GPS auto-positioning on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {} // Silent fallback
      );
    }
  }, []);

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGpsLocation([latitude, longitude]);
        setGpsLoading(false);
        showToast('GPS Location acquired!', 'success');
      },
      (error) => {
        console.error('GPS error:', error);
        setGpsLoading(false);
        showToast('Failed to acquire GPS location. Using default city center.', 'warning');
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Coordinates mapping based on GPS coordinates
  const mapMarkers: MapMarker[] = useMemo(() => {
    return filteredPosts.map((post) => {
      const charSum = post.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      // Generate deterministic offsets around current GPS coordinates (approx 1.5 miles spread)
      const latOffset = ((charSum % 100) / 100 - 0.5) * 0.025;
      const lngOffset = (((charSum * 7) % 100) / 100 - 0.5) * 0.025;
      
      const lat = gpsLocation[0] + latOffset;
      const lng = gpsLocation[1] + lngOffset;
      
      return {
        id: post.id,
        lat,
        lng,
        type: post.type,
        title: post.title,
        post
      };
    });
  }, [filteredPosts, gpsLocation]);

  const getMarkerColorHex = (type: Post['type']) => {
    switch (type) {
      case 'emergency': return '#ef4444'; // red-500
      case 'donation': return '#f59e0b'; // amber-500
      case 'volunteer': return '#22c55e'; // green-500
      case 'event': return '#3b82f6'; // blue-500
      default: return '#64748b'; // slate-500
    }
  };

  const getMarkerSvg = (type: Post['type']) => {
    switch (type) {
      case 'emergency': return '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
      case 'donation': return '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8V4H8L12 8Z"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/></svg>';
      case 'volunteer': return '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>';
      case 'event': return '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
      default: return '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
    }
  };

  const activeMarker = mapMarkers.find(m => m.id === activeMarkerId);

  // Initialize Map inside container div
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map-container', {
        zoomControl: true,
        attributionControl: false
      }).setView(gpsLocation, 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(mapRef.current);
    }
  }, []);

  // Update map center when GPS location changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(gpsLocation, mapRef.current.getZoom() || 12);
    }
  }, [gpsLocation]);

  // Invalidate map size on tab toggle to resolve loading and coordinate calculation bugs
  useEffect(() => {
    if (viewMode === 'map' && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 120);
    }
  }, [viewMode]);

  // Sync Leaflet markers layer
  useEffect(() => {
    if (!mapRef.current) return;

    if (!markersGroupRef.current) {
      markersGroupRef.current = L.layerGroup().addTo(mapRef.current);
    } else {
      markersGroupRef.current.clearLayers();
    }

    const markersGroup = markersGroupRef.current;
    if (!markersGroup) return;

    // Add marker for user location
    const userHtml = `
      <div class="relative flex items-center justify-center">
        <span class="absolute inline-flex h-6 w-6 rounded-full bg-brand-blue-400 opacity-60 animate-ping"></span>
        <div class="h-3.5 w-3.5 rounded-full bg-brand-blue-600 border-2 border-white shadow-md"></div>
      </div>
    `;
    const userIcon = L.divIcon({
      html: userHtml,
      className: 'custom-user-marker',
      iconSize: [24, 24]
    });
    L.marker(gpsLocation, { icon: userIcon }).addTo(markersGroup).bindPopup("<b>Your Location</b>");

    // Add post markers
    mapMarkers.forEach((marker) => {
      const post = marker.post;
      const markerColor = getMarkerColorHex(post.type);
      const iconHtml = `
        <div style="background-color: ${markerColor};" class="w-8 h-8 rounded-full flex items-center justify-center text-white border-2 border-white shadow-lg transform transition-transform duration-250 hover:scale-115">
          ${getMarkerSvg(post.type)}
        </div>
      `;
      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-opportunity-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const m = L.marker([marker.lat, marker.lng], { icon: customIcon })
        .addTo(markersGroup)
        .bindPopup(`
          <div class="p-1.5 font-sans text-left min-w-[150px]">
            <span class="px-2 py-0.5 bg-brand-blue-50 dark:bg-brand-blue-900/15 text-brand-blue-600 dark:text-brand-blue-400 text-[9px] font-extrabold rounded border border-brand-blue-100/30">
              #${post.category}
            </span>
            <h4 class="text-xs font-bold text-slate-800 mt-2 mb-0.5 leading-snug">${post.title}</h4>
            <p class="text-[10px] text-slate-500 line-clamp-2 leading-tight">${post.description}</p>
            <div class="mt-2 text-[9px] text-slate-400 font-medium">By ${post.authorName} (${post.distance})</div>
          </div>
        `, { autoPan: false });

      m.on('click', () => {
        setActiveMarkerId(post.id);
      });
    });
  }, [mapMarkers, gpsLocation]);

  return (
    <div className="space-y-6 text-left">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-800 dark:text-white">Find Opportunities</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Explore community needs and projects nearby.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* GPS Locate Button */}
          <button
            onClick={handleUseGps}
            disabled={gpsLoading}
            className="flex items-center justify-center p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition shadow-sm"
            title="Locate Me (GPS)"
          >
            <Target className={`w-4 h-4 text-brand-blue-500 ${gpsLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* View Toggle */}
          <div className="inline-flex bg-slate-100 dark:bg-slate-850 p-1 rounded-xl border dark:border-slate-800">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-brand-blue-600 dark:text-brand-blue-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              <List className="w-3.5 h-3.5 mr-1.5" />
              List View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-slate-900 text-brand-blue-600 dark:text-brand-blue-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              <Map className="w-3.5 h-3.5 mr-1.5" />
              Map View
            </button>
          </div>
        </div>
      </div>

      {/* Search Input and Filters */}
      <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-none focus:border-brand-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-brand-blue-500 text-slate-800 dark:text-slate-100"
            placeholder="Search keywords, categories, local organizations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Category filter chips */}
        <div className="flex overflow-x-auto pb-1.5 scrollbar-none space-x-1.5">
          {CATEGORY_CHIPS.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-brand-blue-50 dark:bg-brand-blue-900/20 text-brand-blue-600 dark:text-brand-blue-400 border border-brand-blue-200 dark:border-brand-blue-800/30'
                  : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-105'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Extra Filters (Urgency selector) */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider">Urgency:</span>
          {['All', 'low', 'medium', 'high', 'critical'].map((urg) => (
            <button
              key={urg}
              onClick={() => setSelectedUrgency(urg)}
              className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer border capitalize ${
                selectedUrgency === urg
                  ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'
              }`}
            >
              {urg === 'critical' ? 'Emergency' : urg}
            </button>
          ))}
        </div>
      </Card>

      {/* VIEW CONTROLS (Permanent DOM structure preserves Map state) */}
      
      {/* 1. LIST VIEW */}
      <div className={viewMode === 'list' ? 'block' : 'hidden'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          {filteredPosts.length === 0 ? (
            <div className="col-span-1 md:col-span-2 text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No matching search opportunities</p>
              <p className="text-xs text-slate-405 mt-1">Try relaxing your search queries or category filters.</p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const isExpanded = expandedSearchPostId === post.id;
              return (
                <Card
                  key={post.id}
                  hoverEffect
                  className="p-5 flex flex-col justify-between border border-slate-150 dark:border-slate-800/80 bg-white dark:bg-slate-900 min-h-[190px]"
                >
                  <div>
                    {/* Consistent tags matching feed */}
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2.5 py-0.5 bg-brand-blue-50 dark:bg-brand-blue-900/15 text-brand-blue-600 dark:text-brand-blue-400 text-[10px] font-extrabold rounded-lg border border-brand-blue-100/30 dark:border-brand-blue-900/30">
                        #{post.category}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-0.5 text-slate-400" />
                        {post.distance}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-855 dark:text-slate-100 font-display leading-snug line-clamp-1">
                      {post.title}
                    </h3>
                    <p className={`text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed ${
                      isExpanded ? '' : 'line-clamp-2'
                    }`}>
                      {post.description}
                    </p>
                    {post.description.length > 130 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedSearchPostId(isExpanded ? null : post.id);
                        }}
                        className="text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 hover:underline font-bold text-[10px] uppercase mt-1.5 cursor-pointer focus:outline-none"
                      >
                        {isExpanded ? 'Show Less' : 'Read More'}
                      </button>
                    )}

                    {/* Cover Thumbnail */}
                    {post.photos && post.photos.length > 0 && (
                      <div className="mt-3.5 overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 max-h-36">
                        <img
                          src={post.photos[0]}
                          alt="Opportunity cover"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img src={post.authorAvatar} alt="author" className="w-6 h-6 rounded-lg object-cover" />
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-28">
                        {post.authorName}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate('/feed')}
                      className="text-[10px] text-brand-blue-600 dark:text-brand-blue-400 hover:underline font-bold flex items-center cursor-pointer"
                    >
                      Respond Opportunity <Navigation className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* 2. MAP VIEW */}
      <div className={viewMode === 'map' ? 'block' : 'hidden'}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Actual Leaflet Map Layer */}
          <div className="lg:col-span-2 relative h-[450px] bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-inner z-0">
            <div id="map-container" className="absolute inset-0 w-full h-full z-0" />
            <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-150 text-[10px] font-bold text-slate-500 flex items-center shadow-sm z-[1000]">
              <Navigation className="w-3.5 h-3.5 text-brand-blue-500 mr-1.5 animate-pulse" />
              Live Interactive Map (Leaflet)
            </div>
          </div>

          {/* Active Marker Detail Sidebar panel */}
          <div className="space-y-4">
            {activeMarker ? (
              <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-md">
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2.5 py-0.5 bg-brand-blue-50 dark:bg-brand-blue-900/15 text-brand-blue-600 dark:text-brand-blue-400 text-[10px] font-extrabold rounded-lg border border-brand-blue-100/30 dark:border-brand-blue-900/30">
                    #{activeMarker.post.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-0.5 text-slate-400" />
                    {activeMarker.post.distance}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-855 dark:text-slate-200 font-display leading-snug">
                  {activeMarker.post.title}
                </h3>
                <p className={`text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed ${
                  expandedSearchPostId === activeMarker.post.id ? '' : 'line-clamp-4'
                }`}>
                  {activeMarker.post.description}
                </p>
                {activeMarker.post.description.length > 140 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedSearchPostId(expandedSearchPostId === activeMarker.post.id ? null : activeMarker.post.id);
                    }}
                    className="text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 hover:underline font-bold text-[10px] uppercase mt-1 cursor-pointer focus:outline-none"
                  >
                    {expandedSearchPostId === activeMarker.post.id ? 'Show Less' : 'Read More'}
                  </button>
                )}

                {/* Sidebar cover image */}
                {activeMarker.post.photos && activeMarker.post.photos.length > 0 && (
                  <div className="mt-3.5 overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 max-h-36">
                    <img
                      src={activeMarker.post.photos[0]}
                      alt="Opportunity attachment"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2.5 mt-4 p-2 bg-slate-50 dark:bg-slate-850 rounded-xl">
                  <img src={activeMarker.post.authorAvatar} alt="avatar" className="w-7 h-7 rounded-lg object-cover" />
                  <div className="text-left overflow-hidden">
                    <h5 className="text-[10px] font-bold text-slate-800 dark:text-slate-350 flex items-center">
                      {activeMarker.post.authorName}
                      {activeMarker.post.isOrganization && <ShieldCheck className="w-3 h-3 text-brand-blue-500 ml-1" />}
                    </h5>
                    <p className="text-[9px] text-slate-400">Author</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-5">
                  <Button variant="outline" size="sm" fullWidth onClick={() => navigate('/feed')}>
                    View Card
                  </Button>
                  <Button variant="primary" size="sm" fullWidth onClick={() => navigate('/feed')}>
                    Respond
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center bg-slate-50/50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 h-full flex flex-col items-center justify-center">
                <MapPin className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Select a map marker</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Click any colored marker on the map to view details.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
