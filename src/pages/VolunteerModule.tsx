import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Post } from '../services/mockDb';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Heart, Calendar, Clock, MapPin, Sparkles, Filter, CheckCircle } from 'lucide-react';

const VOLUNTEER_CATEGORIES = ['All', 'Volunteer', 'Tutoring', 'Emergency Response', 'Environment', 'Animals', 'Healthcare', 'Community Events'];

export const VolunteerModule: React.FC = () => {
  const { posts, joinVolunteerEvent, currentUser } = useApp();
  const navigate = useNavigate();
  
  // Filter states
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const volunteerPosts = posts.filter(p => p.type === 'volunteer' || p.type === 'emergency');

  const filteredVolunteer = volunteerPosts.filter(post => {
    const categoryMatch = 
      selectedSubCategory === 'All' || 
      post.category.toLowerCase().includes(selectedSubCategory.toLowerCase()) || 
      post.type.toLowerCase().includes(selectedSubCategory.toLowerCase());
    
    const difficultyMatch = 
      selectedDifficulty === 'All' || 
      post.details?.difficulty === selectedDifficulty;

    return categoryMatch && difficultyMatch;
  });

  const handleRegister = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    setJoiningId(postId);
    try {
      await joinVolunteerEvent(postId);
      alert('Congratulations! You registered successfully for this project. Check your profile dashboard for details.');
    } catch (err) {
      console.error(err);
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl font-bold font-display text-slate-850 dark:text-white flex items-center">
          <Heart className="w-6 h-6 text-brand-green-500 mr-2 fill-brand-green-500/10" />
          Volunteer Portal
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Browse local volunteer drives, events, and emergency alerts that need your support.
        </p>
      </div>

      {/* Filter bar */}
      <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-wrap gap-4 text-xs font-semibold">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Category:</span>
          {VOLUNTEER_CATEGORIES.slice(0, 5).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedSubCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer border ${
                selectedSubCategory === cat
                  ? 'bg-slate-850 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-850'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat === 'Emergency Response' ? 'Emergency' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Difficulty:</span>
          {['All', 'Easy', 'Moderate', 'Challenging'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer border ${
                selectedDifficulty === diff
                  ? 'bg-slate-850 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-850'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        <Button variant="secondary" size="sm" onClick={() => navigate('/create-post')} className="ml-auto text-xs py-1.5 font-bold">
          Organize Event
        </Button>
      </Card>

      {/* Opportunities List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredVolunteer.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white dark:bg-slate-900 border rounded-2xl">
            <Filter className="w-12 h-12 text-slate-350 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-500">No events match your selected filters</p>
          </div>
        ) : (
          filteredVolunteer.map((post) => {
            const slotsTotal = post.details?.slotsTotal || 0;
            const slotsFilled = post.details?.slotsFilled || 0;
            const remaining = slotsTotal - slotsFilled;
            const hasSlots = remaining > 0;
            const isEmergency = post.type === 'emergency' || post.urgency === 'critical';

            return (
              <Card
                key={post.id}
                hoverEffect
                onClick={() => navigate('/feed')}
                className={`p-5 flex flex-col justify-between border ${
                  isEmergency 
                    ? 'border-red-200 dark:border-red-950/40 bg-red-50/5 dark:bg-red-950/5' 
                    : 'border-slate-100 dark:border-slate-800/80'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isEmergency
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-brand-green-50 text-brand-green-600 dark:bg-brand-green-950/20'
                    }`}>
                      {isEmergency ? 'Critical Aid' : post.category}
                    </span>
                    <Badge variant={post.details?.difficulty === 'Easy' ? 'success' : post.details?.difficulty === 'Moderate' ? 'warning' : 'danger'}>
                      {post.details?.difficulty}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-150 font-display line-clamp-1">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-450 mt-1.5 leading-relaxed line-clamp-3">
                    {post.description}
                  </p>

                  {/* Schedule Stats */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-semibold text-slate-650 bg-slate-50/50 dark:bg-slate-950/10 p-2.5 rounded-xl border dark:border-slate-800/80">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-green-500" />
                      <span>{post.details?.date || 'Today'}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-green-500" />
                      <span className="truncate">{post.details?.time || 'Flexible'}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-blue-500" />
                      <span className="truncate">{post.location.split(',')[0]}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 font-bold text-brand-blue-600 dark:text-brand-blue-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>+{post.details?.hoursRequired || 2} Impact Hrs</span>
                    </div>
                  </div>
                </div>

                {/* Footer and Register slots */}
                <div className="mt-5 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                  <div className="text-left">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Remaining Slots</span>
                    <span className={`text-xs font-bold ${
                      remaining <= 3 ? 'text-red-500' : 'text-slate-700 dark:text-slate-350'
                    }`}>
                      {hasSlots ? `${remaining} slots left` : 'All slots filled'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <img src={post.authorAvatar} alt="organizer" className="w-6 h-6 rounded-lg border" />
                    <Button
                      onClick={(e) => handleRegister(e, post.id)}
                      variant={isEmergency ? 'danger' : 'secondary'}
                      size="sm"
                      disabled={joiningId === post.id || !hasSlots}
                      className="text-xs py-1.5 font-bold cursor-pointer rounded-xl"
                    >
                      {joiningId === post.id ? 'Joining...' : (
                        <span className="flex items-center">
                          {!hasSlots ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 mr-1" />
                              Filled
                            </>
                          ) : (
                            'Sign Up'
                          )}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
