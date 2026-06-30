import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  Activity, Heart, Gift, Award, Calendar, Bookmark, 
  MapPin, Clock, ShieldCheck, Mail, Sparkles, Trophy 
} from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { currentUser, posts, savePostToggle } = useApp();
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <div className="text-center py-16">
        <p className="text-sm font-semibold text-slate-500">Please sign in to view profile dashboard.</p>
      </div>
    );
  }

  // Get saved posts list
  const savedOpportunities = posts.filter(p => currentUser.savedPosts.includes(p.id));

  // Calendar simulator: June 2026 dates (highlight 4, 12, 20, 26)
  const helpedDates = [4, 12, 20, 26];

  const handleRemoveSaved = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    await savePostToggle(postId);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* 1. Profile Header Card */}
      <Card className="p-6 relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-md">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-blue-500 via-brand-green-500 to-brand-amber-500" />
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-150 dark:border-slate-800 shadow-sm"
          />

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-850 dark:text-white flex items-center justify-center sm:justify-start">
                  {currentUser.name}
                  {currentUser.verified && (
                    <ShieldCheck className="w-5 h-5 ml-1.5 text-brand-blue-500 fill-brand-blue-500/10" />
                  )}
                </h2>
                <div className="flex items-center justify-center sm:justify-start text-xs text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 mr-1" />
                  <span>{currentUser.location}</span>
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={() => navigate('/settings')} className="font-semibold">
                Edit Settings
              </Button>
            </div>

            <p className="text-xs text-slate-550 dark:text-slate-400 italic max-w-xl leading-relaxed">
              "{currentUser.bio || 'No bio written yet.'}"
            </p>

            <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 pt-2">
              {currentUser.languages.map(l => (
                <Badge key={l} variant="neutral">{l}</Badge>
              ))}
              <Badge variant="info">{currentUser.availability}</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Impact Dashboard Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">Impact Dashboard</h2>
        
        {/* Core metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Impact Score', count: currentUser.impactScore, desc: 'Top 15% helper', icon: Trophy, color: 'text-brand-amber-500 bg-brand-amber-50/20' },
            { label: 'Volunteer Hours', count: `${currentUser.volunteerHours} hrs`, desc: '6 events total', icon: Clock, color: 'text-brand-green-500 bg-brand-green-50/20' },
            { label: 'Items Donated', count: currentUser.itemsDonated, desc: 'Donations completed', icon: Gift, color: 'text-brand-blue-500 bg-brand-blue-50/20' },
            { label: 'People Helped', count: currentUser.peopleHelped, desc: 'Direct connections', icon: Heart, color: 'text-red-500 bg-red-50/20' },
          ].map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <Card key={idx} className="p-4 border border-slate-100 dark:border-slate-800 text-left flex items-center justify-between">
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">{metric.label}</span>
                  <span className="block text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">{metric.count}</span>
                  <span className="block text-[9px] text-slate-400 font-medium mt-0.5">{metric.desc}</span>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${metric.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </Card>
            );
          })}
        </div>

        {/* 3. Skill Chips & Achievements Shelf split grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Skills and interests */}
          <Card className="p-5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-150 font-display pb-2 border-b">
              My Skills & Causes
            </h3>
            
            <div className="space-y-3">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">My Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentUser.skills.map(s => (
                    <Badge key={s} variant="info">{s}</Badge>
                  ))}
                  {currentUser.skills.length === 0 && <span className="text-xs text-slate-400">No skills added.</span>}
                </div>
              </div>

              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Causes I Care About</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentUser.interests.map(i => (
                    <Badge key={i} variant="success">{i}</Badge>
                  ))}
                  {currentUser.interests.length === 0 && <span className="text-xs text-slate-400">No causes selected.</span>}
                </div>
              </div>
            </div>
          </Card>

          {/* Badges and achievements */}
          <Card className="p-5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-150 font-display pb-2 border-b">
              Badge Showcase
            </h3>

            <div className="grid grid-cols-3 gap-3 text-center">
              {currentUser.badges.map((badge) => (
                <div 
                  key={badge.id} 
                  title={badge.description}
                  className="flex flex-col items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 hover-scale cursor-pointer"
                >
                  <span className="text-2xl mb-1">{badge.icon}</span>
                  <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 truncate w-full">
                    {badge.name}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Impact Calendar (Days helped) */}
          <Card className="p-5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-855 dark:text-slate-150 font-display pb-2 border-b flex items-center">
              <Calendar className="w-4 h-4 text-brand-green-500 mr-2" />
              Impact Calendar
            </h3>
            
            {/* June 2026 grid representation */}
            <div>
              <span className="block text-[10px] text-slate-400 font-bold mb-2">June 2026</span>
              <div className="grid grid-cols-7 gap-1 text-[10px] font-bold text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                  <span key={idx} className="text-slate-400 py-1">{day}</span>
                ))}
                
                {/* Pad first week of June 2026 (starts on Monday, so 1 blank space for Sunday) */}
                <span className="py-2" />
                
                {Array.from({ length: 30 }, (_, i) => i + 1).map((date) => {
                  const isHelped = helpedDates.includes(date);
                  return (
                    <span
                      key={date}
                      className={`py-1.5 rounded-lg flex items-center justify-center ${
                        isHelped 
                          ? 'bg-brand-green-500 text-white shadow-sm font-extrabold shadow-brand-green-500/20' 
                          : 'bg-slate-50 dark:bg-slate-850 text-slate-650'
                      }`}
                    >
                      {date}
                    </span>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* 4. Bookmarked opportunities list */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">Saved Opportunities</h2>
          
          {savedOpportunities.length === 0 ? (
            <Card className="p-8 text-center bg-slate-50/50 dark:bg-slate-900/50 border border-dashed rounded-2xl">
              <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-500">No saved items</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Click the bookmark icon on any feed opportunity to save it here.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedOpportunities.map((post) => (
                <Card
                  key={post.id}
                  hoverEffect
                  onClick={() => navigate('/feed')}
                  className="p-4 border border-slate-100 dark:border-slate-800 flex justify-between items-center cursor-pointer"
                >
                  <div className="text-left overflow-hidden">
                    <Badge variant="neutral">#{post.category}</Badge>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-1.5 truncate">
                      {post.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{post.location}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => handleRemoveSaved(e, post.id)}
                    className="text-xs font-semibold text-red-500"
                  >
                    Remove
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
