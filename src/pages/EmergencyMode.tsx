import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { AlertOctagon, Flame, ShieldAlert, PhoneCall, HeartHandshake, Eye, MapPin, Compass, AlertCircle } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mockDb } from '../services/mockDb';

const EMERGENCY_CHIPS = [
  { id: 'flood', label: 'Flood', icon: Compass, color: 'text-blue-500 bg-blue-50/20' },
  { id: 'fire', label: 'Fire', icon: Flame, color: 'text-red-500 bg-red-50/20' },
  { id: 'medical', label: 'Medical', icon: ShieldAlert, color: 'text-red-500 bg-red-50/20' },
  { id: 'missing', label: 'Missing Person', icon: AlertOctagon, color: 'text-purple-500 bg-purple-50/20' },
  { id: 'food', label: 'Food Aid', icon: HeartHandshake, color: 'text-brand-green-500 bg-brand-green-50/20' }
];

export const EmergencyMode: React.FC = () => {
  const { posts, currentUser, showToast } = useApp();
  const navigate = useNavigate();
  
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [reliefCenters, setReliefCenters] = useState<any[]>([]);
  const [isAddCenterOpen, setIsAddCenterOpen] = useState(false);
  const [newCenterName, setNewCenterName] = useState('');
  const [newCenterCapacity, setNewCenterCapacity] = useState('');
  const [newCenterAddress, setNewCenterAddress] = useState('');

  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Filter emergency items
  const emergencyPosts = posts.filter(p => p.type === 'emergency' || p.urgency === 'critical');

  const filteredEmergency = emergencyPosts.filter(post => 
    selectedFilter === 'All' || 
    post.title.toLowerCase().includes(selectedFilter.toLowerCase()) || 
    post.category.toLowerCase().includes(selectedFilter.toLowerCase())
  );

  const loadReliefCenters = async () => {
    try {
      const centers = await mockDb.getReliefCenters();
      setReliefCenters(centers);
    } catch (err) {
      console.error("Load relief centers failed:", err);
    }
  };

  useEffect(() => {
    loadReliefCenters();
  }, []);

  // Helper function to dynamically calculate coordinates from address/seed for mock scattering
  const getCoordinatesForAddress = (address: string, seed: string) => {
    if (address.toLowerCase().includes('park')) return [40.7618, -73.9718];
    if (address.toLowerCase().includes('greenwood')) return [40.6501, -73.9750];
    if (address.toLowerCase().includes('hospital')) return [40.7228, -74.0160];
    if (address.toLowerCase().includes('gym') || address.toLowerCase().includes('shelter')) return [40.7300, -73.9900];
    
    // Dynamic offset based on string hash for rendering distinct items
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const latOffset = ((Math.abs(hash) % 100) / 1500) - 0.03;
    const lngOffset = (((Math.abs(hash) >> 8) % 100) / 1500) - 0.03;
    return [40.7128 + latOffset, -74.0060 + lngOffset];
  };

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('emergency-map', {
        zoomControl: true,
        attributionControl: false
      }).setView([40.7128, -74.0060], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(mapRef.current);
    }
  }, []);

  // Sync Map markers
  useEffect(() => {
    if (!mapRef.current) return;

    if (!markersGroupRef.current) {
      markersGroupRef.current = L.layerGroup().addTo(mapRef.current);
    } else {
      markersGroupRef.current.clearLayers();
    }

    const markersGroup = markersGroupRef.current;

    // Add Emergency Incident markers (Pulse Red)
    filteredEmergency.forEach(post => {
      const [lat, lng] = getCoordinatesForAddress(post.location, post.id);
      const iconHtml = `
        <div class="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center border-2 border-white shadow-lg animate-pulse">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
        </div>
      `;
      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-emergency-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      L.marker([lat, lng], { icon: customIcon })
        .addTo(markersGroup)
        .bindPopup(`
          <div class="p-2 font-sans text-left min-w-[160px] text-slate-800">
            <span class="px-2 py-0.5 bg-red-100 text-red-700 text-[9px] font-extrabold rounded uppercase tracking-wider">
              ${post.category}
            </span>
            <h4 class="font-bold text-xs mt-2 mb-0.5 leading-snug">${post.title}</h4>
            <p class="text-[10px] text-slate-500 leading-tight line-clamp-2">${post.description}</p>
          </div>
        `);
    });

    // Add Relief Center markers (Solid Teal Shield)
    reliefCenters.forEach(center => {
      const [lat, lng] = getCoordinatesForAddress(center.address, center.id);
      const iconHtml = `
        <div class="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center border-2 border-white shadow-lg">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
      `;
      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-relief-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      L.marker([lat, lng], { icon: customIcon })
        .addTo(markersGroup)
        .bindPopup(`
          <div class="p-2 font-sans text-left min-w-[160px] text-slate-800">
            <span class="px-2 py-0.5 bg-teal-100 text-teal-700 text-[9px] font-extrabold rounded uppercase tracking-wider">
              ${center.capacity}
            </span>
            <h4 class="font-bold text-xs mt-2 mb-0.5 leading-snug">${center.name}</h4>
            <p class="text-[10px] text-slate-500 leading-tight">${center.address}</p>
          </div>
        `);
    });
  }, [filteredEmergency, reliefCenters]);

  const handleAddCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCenterName.trim() || !newCenterCapacity.trim() || !newCenterAddress.trim()) return;

    try {
      await mockDb.createReliefCenter(newCenterName, newCenterCapacity, newCenterAddress);
      showToast("Relief Center registered successfully!", "success");
      setNewCenterName('');
      setNewCenterCapacity('');
      setNewCenterAddress('');
      setIsAddCenterOpen(false);
      await loadReliefCenters();
    } catch (err) {
      console.error(err);
      showToast("Failed to add relief center. Please try again.", "error");
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* High Visibility Danger Header */}
      <Card className="p-6 relative bg-red-500 text-white border-none shadow-lg overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-6 translate-x-6">
          <AlertOctagon className="w-64 h-64" />
        </div>
        
        <div className="relative space-y-4">
          <Badge className="bg-white/20 text-white font-extrabold px-3 py-1 uppercase tracking-wider animate-pulse">
            Active Emergency Mode
          </Badge>
          
          <h1 className="text-xl font-bold font-display leading-tight">
            Sector 5 Flooding Relief Coordinator
          </h1>
          <p className="text-xs opacity-90 max-w-xl leading-relaxed">
            Flash flooding has affected Sector 5, forcing evacuation of certain blocks. Emergency shelters are open. Please coordinate volunteer labor or donations of supplies using the options below.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <a 
              href="tel:911" 
              className="px-4 py-2 bg-white text-red-600 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all flex items-center shadow-md cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 mr-2" />
              Call Emergency Services (911)
            </a>
            {(!currentUser || currentUser.role === 'kith' || currentUser.role === 'admin') && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/create-post')}
                className="bg-transparent border-white text-white hover:bg-white/10 text-xs font-bold"
              >
                Report Emergency Incident
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Interactive Emergency Map Card */}
      <Card className="p-4 h-[320px] border border-slate-100 dark:border-slate-800/80 shadow-md relative overflow-hidden flex flex-col bg-white dark:bg-slate-900">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider flex items-center">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full mr-2 animate-ping"></span>
            Interactive Emergency Response Map
          </h3>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Incidents (Red) &bull; Relief Shelters (Teal)
          </span>
        </div>
        <div id="emergency-map" className="flex-1 w-full rounded-xl overflow-hidden z-10 border border-slate-100 dark:border-slate-800/50" />
      </Card>

      {/* Incident category selector */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {EMERGENCY_CHIPS.map((chip) => {
          const Icon = chip.icon;
          return (
            <button
              key={chip.id}
              onClick={() => setSelectedFilter(chip.id)}
              className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-2 cursor-pointer transition ${
                selectedFilter === chip.id
                  ? 'border-red-500 bg-red-50/20 text-red-600 font-extrabold'
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className={`p-2 rounded-lg ${chip.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span>{chip.label}</span>
            </button>
          )})}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Urgent Reports feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">Urgent Incident Reports</h2>
            <span className="text-[10px] text-red-500 font-bold">{filteredEmergency.length} active logs</span>
          </div>

          {filteredEmergency.length === 0 ? (
            <Card className="p-8 text-center bg-slate-50/50 dark:bg-slate-900/50 border border-dashed rounded-2xl flex flex-col items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-500">No active emergency logs found</p>
            </Card>
          ) : (
            filteredEmergency.map((post) => (
              <Card
                key={post.id}
                hoverEffect
                onClick={() => navigate('/feed')}
                className="p-5 border-l-4 border-l-red-500 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
                        {post.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{post.distance} ({post.location.split(',')[0]})</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-850 dark:text-slate-150 font-display pt-1">{post.title}</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed line-clamp-2">
                  {post.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <img src={post.authorAvatar} alt="reporter" className="w-6 h-6 rounded-lg border" />
                    <span className="text-[10px] font-bold text-slate-650 dark:text-slate-350">{post.authorName}</span>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => navigate('/feed')} className="text-[10px] py-1 px-3 rounded-lg font-bold">
                    Join Relief Response
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Action centers / Evacuation Maps sidebar */}
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">Relief Centers</h3>
            {(currentUser?.role === 'kith' || currentUser?.role === 'admin') && (
              <Button
                variant="outline"
                size="sm"
                className="text-[9px] py-1 px-2 font-bold cursor-pointer"
                onClick={() => setIsAddCenterOpen(!isAddCenterOpen)}
              >
                {isAddCenterOpen ? 'Cancel' : '+ Add Center'}
              </Button>
            )}
          </div>

          {isAddCenterOpen && (
            <Card className="p-4 border border-red-200 dark:border-red-900 bg-red-50/5 dark:bg-red-950/5 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center">
                <AlertCircle className="w-4 h-4 text-red-500 mr-1.5" />
                Register Relief Shelter
              </h4>
              <form onSubmit={handleAddCenter} className="space-y-2">
                <input
                  type="text"
                  placeholder="Center Name"
                  required
                  value={newCenterName}
                  onChange={(e) => setNewCenterName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-850 dark:text-white focus:outline-none focus:border-brand-blue-500"
                />
                <input
                  type="text"
                  placeholder="Capacity status (e.g. 20% Capacity)"
                  required
                  value={newCenterCapacity}
                  onChange={(e) => setNewCenterCapacity(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-850 dark:text-white focus:outline-none focus:border-brand-blue-500"
                />
                <input
                  type="text"
                  placeholder="Address"
                  required
                  value={newCenterAddress}
                  onChange={(e) => setNewCenterAddress(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-850 dark:text-white focus:outline-none focus:border-brand-blue-500"
                />
                <Button type="submit" variant="primary" size="sm" fullWidth className="text-[10px] py-1.5 font-bold cursor-pointer">
                  Save Relief Center
                </Button>
              </form>
            </Card>
          )}

          {reliefCenters.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              <p className="text-xs">No registered relief centers yet.</p>
            </div>
          ) : (
            reliefCenters.map((center, idx) => (
              <Card key={center.id || idx} className="p-4 border border-slate-100 dark:border-slate-800 space-y-2 text-xs hover:border-slate-250 dark:hover:border-slate-700 transition">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">{center.name}</h4>
                  <Badge variant={center.capacity.toLowerCase().includes('alert') || center.capacity.toLowerCase().includes('85') ? 'danger' : 'success'}>
                    {center.capacity}
                  </Badge>
                </div>
                <p className="text-slate-450 dark:text-slate-400 flex items-center mt-1">
                  <MapPin className="w-3.5 h-3.5 mr-1" />
                  {center.address}
                </p>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
