import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Post } from '../services/mockDb';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Map, List, Search as SearchIcon, MapPin, Navigation, Calendar, Heart, Gift, AlertTriangle, ShieldCheck } from 'lucide-react';

// Coordinates layout mapping for simulated SVG map
interface MapMarker {
  id: string;
  x: number; // percentage
  y: number; // percentage
  type: Post['type'];
  title: string;
  post: Post;
}

const CATEGORY_CHIPS = ['All', 'Tutoring', 'Volunteer', 'Donations', 'Emergency Response', 'Environment', 'Jobs', 'Community Events'];

export const Search: React.FC = () => {
  const { posts } = useApp();
  const navigate = useNavigate();
  
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedUrgency, setSelectedUrgency] = useState('All');
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);

  // Filter posts
  const getFilteredPosts = () => {
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
  };

  const filteredPosts = getFilteredPosts();

  // Coordinates mapping to simulate locations in a grid (x: 10-90, y: 10-90)
  const mapMarkers: MapMarker[] = filteredPosts.map((post, index) => {
    // Generate deterministic coordinates based on post ID character codes
    const charSum = post.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const x = 15 + (charSum % 70); // x between 15% and 85%
    const y = 15 + ((charSum * 7) % 70); // y between 15% and 85%
    
    return {
      id: post.id,
      x,
      y,
      type: post.type,
      title: post.title,
      post
    };
  });

  const getMarkerColor = (type: Post['type']) => {
    switch (type) {
      case 'emergency': return 'bg-red-500 text-white';
      case 'donation': return 'bg-brand-amber-500 text-white';
      case 'volunteer': return 'bg-brand-green-500 text-white';
      case 'event': return 'bg-brand-blue-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const activeMarker = mapMarkers.find(m => m.id === activeMarkerId);

  return (
    <div className="space-y-6 text-left">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-800 dark:text-white">Find Opportunities</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Explore community needs and projects nearby.</p>
        </div>

        {/* View Toggle */}
        <div className="inline-flex bg-slate-100 dark:bg-slate-850 p-1 rounded-xl self-start sm:self-auto border dark:border-slate-800">
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
                  : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100'
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

      {/* VIEW CONTROLS */}
      {viewMode === 'list' ? (
        /* LIST VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.length === 0 ? (
            <div className="col-span-2 text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No matching search opportunities</p>
              <p className="text-xs text-slate-400 mt-1">Try relaxing your search queries or category filters.</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <Card
                key={post.id}
                hoverEffect
                onClick={() => navigate('/feed')}
                className="p-5 flex flex-col justify-between cursor-pointer border border-slate-100 dark:border-slate-800"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant={post.type === 'emergency' ? 'emergency' : 'neutral'}>
                      #{post.category}
                    </Badge>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      {post.distance}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150 font-display line-clamp-1">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-450 mt-1.5 leading-relaxed line-clamp-2">
                    {post.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img src={post.authorAvatar} alt="author" className="w-6 h-6 rounded-lg" />
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-28">
                      {post.authorName}
                    </span>
                  </div>
                  <span className="text-[10px] text-brand-blue-500 hover:underline font-bold flex items-center">
                    Learn details <Navigation className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* MAP VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mock Interactive SVG Map */}
          <Card className="lg:col-span-2 relative h-[450px] bg-slate-100 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-inner">
            
            {/* SVG Background representing roads, river, park */}
            <svg className="absolute inset-0 w-full h-full opacity-35 dark:opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              {/* River */}
              <path d="M-50,220 C200,220 300,100 800,80 L800,140 C300,160 200,280 -50,280 Z" fill="#93c5fd" />
              
              {/* Parks */}
              <rect x="8%" y="12%" width="22%" height="24%" rx="12" fill="#86efac" />
              <rect x="70%" y="60%" width="20%" height="28%" rx="12" fill="#86efac" />
              
              {/* Streets grid */}
              <line x1="0" y1="150" x2="800" y2="150" stroke="#cbd5e1" strokeWidth="6" />
              <line x1="0" y1="350" x2="800" y2="350" stroke="#cbd5e1" strokeWidth="6" />
              <line x1="200" y1="0" x2="200" y2="500" stroke="#cbd5e1" strokeWidth="6" />
              <line x1="600" y1="0" x2="600" y2="500" stroke="#cbd5e1" strokeWidth="6" />
            </svg>

            <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-150 text-[10px] font-bold text-slate-500 flex items-center shadow-sm">
              <Navigation className="w-3.5 h-3.5 text-brand-blue-500 mr-1.5 animate-pulse" />
              Simulated City Grid (Nearby)
            </div>

            {/* Markers layer */}
            {mapMarkers.map((marker) => (
              <button
                key={marker.id}
                onClick={() => setActiveMarkerId(marker.id)}
                style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                className={`absolute w-8 h-8 rounded-full transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-lg border-2 border-white transition-all cursor-pointer hover:scale-125 ${getMarkerColor(marker.type)} ${
                  activeMarkerId === marker.id ? 'ring-4 ring-brand-blue-500 ring-offset-2 scale-125' : ''
                }`}
              >
                {marker.type === 'emergency' && <AlertTriangle className="w-3.5 h-3.5" />}
                {marker.type === 'donation' && <Gift className="w-3.5 h-3.5" />}
                {marker.type === 'volunteer' && <Heart className="w-3.5 h-3.5" />}
                {marker.type === 'event' && <Calendar className="w-3.5 h-3.5" />}
                {['need_help', 'offer_help', 'job'].includes(marker.type) && <MapPin className="w-3.5 h-3.5" />}
              </button>
            ))}
          </Card>

          {/* Active Marker Detail Sidebar panel */}
          <div className="space-y-4">
            {activeMarker ? (
              <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-md">
                <div className="flex justify-between items-start mb-3">
                  <Badge variant={activeMarker.post.type === 'emergency' ? 'emergency' : 'info'}>
                    {activeMarker.post.category}
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-bold">{activeMarker.post.distance}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-display">
                  {activeMarker.post.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-1.5 leading-relaxed line-clamp-4">
                  {activeMarker.post.description}
                </p>

                <div className="flex items-center space-x-2.5 mt-4 p-2 bg-slate-50 dark:bg-slate-850 rounded-xl">
                  <img src={activeMarker.post.authorAvatar} alt="avatar" className="w-7 h-7 rounded-lg" />
                  <div className="text-left overflow-hidden">
                    <h5 className="text-[10px] font-bold text-slate-800 dark:text-slate-350 flex items-center">
                      {activeMarker.post.authorName}
                      {activeMarker.post.isOrganization && <ShieldCheck className="w-3 h-3 text-brand-blue-500 ml-1" />}
                    </h5>
                    <p className="text-[9px] text-slate-400">Owner</p>
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
                <p className="text-[10px] text-slate-400 mt-0.5">Click any colored marker on the grid to view details.</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
