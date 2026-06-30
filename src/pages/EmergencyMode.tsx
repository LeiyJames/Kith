import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { AlertOctagon, Flame, ShieldAlert, PhoneCall, HeartHandshake, Eye, MapPin, Compass } from 'lucide-react';

const EMERGENCY_CHIPS = [
  { id: 'flood', label: 'Flood', icon: Compass, color: 'text-blue-500 bg-blue-50/20' },
  { id: 'fire', label: 'Fire', icon: Flame, color: 'text-red-500 bg-red-50/20' },
  { id: 'medical', label: 'Medical', icon: ShieldAlert, color: 'text-red-500 bg-red-50/20' },
  { id: 'missing', label: 'Missing Person', icon: AlertOctagon, color: 'text-purple-500 bg-purple-50/20' },
  { id: 'food', label: 'Food Aid', icon: HeartHandshake, color: 'text-brand-green-500 bg-brand-green-50/20' }
];

export const EmergencyMode: React.FC = () => {
  const { posts } = useApp();
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Filter emergency items
  const emergencyPosts = posts.filter(p => p.type === 'emergency' || p.urgency === 'critical');

  const filteredEmergency = emergencyPosts.filter(post => 
    selectedFilter === 'All' || 
    post.title.toLowerCase().includes(selectedFilter.toLowerCase()) || 
    post.category.toLowerCase().includes(selectedFilter.toLowerCase())
  );

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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/create-post')}
              className="bg-transparent border-white text-white hover:bg-white/10 text-xs font-bold"
            >
              Report Emergency Incident
            </Button>
          </div>
        </div>
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
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Urgent Incident Reports</h2>
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
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">Relief Centers</h3>
          
          {[
            { name: 'Sector 5 Gym Shelter', capacity: '85% Capacity', address: '450 Park Avenue' },
            { name: 'Red Cross Aid Depot', capacity: 'Ready for supply drop', address: '82 Greenwood Ave' },
            { name: 'Downtown Medical Center', capacity: 'Alert - High caseload', address: '12 Hospital Boulevard' }
          ].map((center, idx) => (
            <Card key={idx} className="p-4 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">{center.name}</h4>
                <Badge variant={center.capacity.includes('85%') ? 'danger' : 'success'}>
                  {center.capacity}
                </Badge>
              </div>
              <p className="text-slate-400 flex items-center mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                {center.address}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
