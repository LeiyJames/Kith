import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Post } from '../services/mockDb';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Heart, Calendar, Clock, MapPin, Sparkles, Filter, CheckCircle, Bookmark, MessageSquare, ShieldCheck, UserCheck } from 'lucide-react';
import { ImageGallery } from './HomeFeed';

const VOLUNTEER_CATEGORIES = ['All', 'Volunteer', 'Tutoring', 'Emergency Response', 'Environment', 'Animals', 'Healthcare', 'Community Events'];

export const VolunteerModule: React.FC = () => {
  const { posts, joinVolunteerEvent, currentUser, showToast, userRegistrations, savePostToggle, chatWithUser } = useApp();
  const navigate = useNavigate();
  
  // Filter states
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  // Lightbox / Full View Modal state
  const [fullViewPhotos, setFullViewPhotos] = useState<string[] | null>(null);
  const [fullViewIndex, setFullViewIndex] = useState<number>(0);

  const volunteerPosts = useMemo(() => {
    return posts.filter(p => p.type === 'volunteer' || p.type === 'emergency');
  }, [posts]);

  const filteredVolunteer = useMemo(() => {
    return volunteerPosts.filter(post => {
      const categoryMatch = 
        selectedSubCategory === 'All' || 
        post.category.toLowerCase().includes(selectedSubCategory.toLowerCase()) || 
        post.type.toLowerCase().includes(selectedSubCategory.toLowerCase());
      
      const difficultyMatch = 
        selectedDifficulty === 'All' || 
        post.details?.difficulty === selectedDifficulty;

      return categoryMatch && difficultyMatch;
    });
  }, [volunteerPosts, selectedSubCategory, selectedDifficulty]);

  const handleRegister = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    if (!currentUser) {
      showToast('Please sign in to register for volunteer projects.', 'warning');
      return;
    }
    setJoiningId(postId);
    try {
      await joinVolunteerEvent(postId);
      showToast('Congratulations! You registered successfully for this project. Check your profile dashboard for details.', 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setJoiningId(null);
    }
  };

  const handleSave = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    if (!currentUser) {
      showToast('Please sign in to bookmark opportunities.', 'warning');
      return;
    }
    savePostToggle(postId);
    const isSaved = currentUser.savedPosts?.includes(postId);
    showToast(isSaved ? 'Opportunity removed from bookmarks.' : 'Opportunity bookmarked successfully!', 'success');
  };

  const handleOrganizeEvent = () => {
    if (!currentUser) {
      showToast('Please sign in to organize events.', 'warning');
      return;
    }
    navigate('/create-post');
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl font-bold font-display text-slate-800 dark:text-white flex items-center">
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
                  ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800'
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
                  ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {(!currentUser || currentUser.role === 'kith' || currentUser.role === 'admin') && (
          <Button variant="secondary" size="sm" onClick={handleOrganizeEvent} className="ml-auto text-xs py-1.5 font-bold">
            Organize Event
          </Button>
        )}
      </Card>

      {/* Opportunities List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
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
            const isExpanded = expandedPostId === post.id;
            const isRegistered = userRegistrations?.includes(post.id) || false;
            const isSaved = currentUser?.savedPosts?.includes(post.id);

            return (
              <Card
                key={post.id}
                hoverEffect
                onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                className={`p-5 relative cursor-pointer border ${
                  post.urgency === 'critical' 
                    ? 'border-red-200 dark:border-red-950/40 bg-red-50/10 dark:bg-red-950/5' 
                    : 'border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900'
                }`}
              >
                {/* Card Header (Author info) */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-100 dark:border-slate-800"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center">
                        {post.authorName}
                        {post.isOrganization && (
                          <span className="tooltip-trigger inline-flex" data-tooltip="Verified Organization">
                            <ShieldCheck className="w-4 h-4 ml-1.5 text-brand-blue-500 fill-brand-blue-500/10" />
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <MapPin className="w-3 h-3 text-slate-400 animate-pulse" />
                        <span>{post.distance}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {post.urgency === 'critical' && (
                      <span className="inline-flex items-center bg-red-500 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                        Urgent Alert
                      </span>
                    )}
                    <Badge variant={post.urgency === 'critical' ? 'emergency' : post.urgency === 'high' ? 'warning' : 'neutral'}>
                      {post.urgency} Urgency
                    </Badge>
                  </div>
                </div>

                {/* Category tags & Title & Description */}
                <div className="mt-4">
                  <div className="flex items-center gap-1.5 flex-wrap mb-2">
                    <span className="px-2.5 py-0.5 bg-brand-blue-50 dark:bg-brand-blue-900/15 text-brand-blue-600 dark:text-brand-blue-400 text-[10px] font-extrabold rounded-lg border border-brand-blue-100/30 dark:border-brand-blue-900/30">
                      #{post.category}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold border ${
                      post.details?.difficulty === 'Easy' 
                        ? 'bg-green-50 text-green-700 border-green-150 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30' 
                        : post.details?.difficulty === 'Moderate'
                        ? 'bg-amber-50 text-amber-700 border-amber-150 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
                        : 'bg-red-50 text-red-700 border-red-150 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'
                    }`}>
                      {post.details?.difficulty} Difficulty
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-805 dark:text-slate-100 font-display leading-snug">
                    {post.title}
                  </h3>
                  <p className={`text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed ${
                    isExpanded ? '' : 'line-clamp-3'
                  }`}>
                    {post.description}
                  </p>
                  {post.description.length > 150 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedPostId(isExpanded ? null : post.id);
                      }}
                      className="text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 hover:underline font-bold text-[10px] uppercase mt-1.5 cursor-pointer focus:outline-none"
                    >
                      {isExpanded ? 'Show Less' : 'Read More'}
                    </button>
                  )}
                </div>

                {/* Photos Gallery */}
                {post.photos && post.photos.length > 0 && (
                  <ImageGallery
                    photos={post.photos}
                    onOpenFullView={(index) => {
                      setFullViewPhotos(post.photos);
                      setFullViewIndex(index);
                    }}
                  />
                )}

                {/* Schedule Stats */}
                {isExpanded && post.details && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2.5 text-xs font-semibold text-slate-650 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-xl">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-green-500 flex-shrink-0" />
                      <span>{post.details?.date || 'Today'}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-green-500 flex-shrink-0" />
                      <span className="truncate">{post.details?.time || 'Flexible'}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 font-bold text-brand-blue-600 dark:text-brand-blue-400">
                      <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>+{post.details?.hoursRequired || 2} Impact Hrs</span>
                    </div>
                    <div></div> {/* spacer */}
                    <div className="flex items-start space-x-1.5 col-span-2 border-t border-slate-100 dark:border-slate-800/50 pt-2 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-blue-500 flex-shrink-0 mt-0.5" />
                      <span className="break-words whitespace-normal leading-tight text-slate-600 dark:text-slate-400">{post.location}</span>
                    </div>
                  </div>
                )}

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

                  <div className="flex items-center space-x-1">
                    {/* Save Button */}
                    <button
                      onClick={(e) => handleSave(e, post.id)}
                      data-tooltip={isSaved ? "Remove Bookmark" : "Bookmark Opportunity"}
                      className={`tooltip-trigger p-2 rounded-xl transition hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                        isSaved ? 'text-brand-amber-500 fill-brand-amber-500' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>

                    {/* Message Button */}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!currentUser) {
                          showToast('Please sign in to message authors.', 'warning');
                          navigate('/auth');
                          return;
                        }
                        try {
                          await chatWithUser(post.userId, `Hi ${post.authorName}! I am interested in volunteering for your event: "${post.title}". How can I help?`);
                          navigate('/chat', { state: { userId: post.userId } });
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      data-tooltip="Message Author"
                      className="tooltip-trigger p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    <Button
                      onClick={(e) => handleRegister(e, post.id)}
                      variant={isEmergency ? 'danger' : 'primary'}
                      size="sm"
                      disabled={joiningId === post.id || isRegistered || !hasSlots}
                      className="text-xs py-1.5 font-bold cursor-pointer rounded-xl ml-1.5"
                    >
                      {joiningId === post.id ? 'Joining...' : (
                        <span className="flex items-center">
                          {isRegistered ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 mr-1" />
                              Registered
                            </>
                          ) : !hasSlots ? (
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

      {/* Lightbox / Full View Modal */}
      {fullViewPhotos && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-[10000] flex flex-col justify-between p-6 select-none animate-toast-in pointer-events-auto"
          onClick={() => setFullViewPhotos(null)}
        >
          <div className="flex justify-between items-center text-white max-w-5xl mx-auto w-full">
            <span className="text-xs font-semibold">
              Image {fullViewIndex + 1} of {fullViewPhotos.length}
            </span>
            <button
              onClick={() => setFullViewPhotos(null)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-base cursor-pointer transition font-bold"
            >
              ×
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center max-w-5xl mx-auto w-full relative">
            {fullViewPhotos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFullViewIndex((prev) => (prev === 0 ? fullViewPhotos.length - 1 : prev - 1));
                }}
                className="absolute left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center text-xl cursor-pointer transition select-none z-50 font-bold"
              >
                ‹
              </button>
            )}

            <img
              src={fullViewPhotos[fullViewIndex]}
              alt="Full view attachment"
              className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl animate-scale-up"
            />

            {fullViewPhotos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFullViewIndex((prev) => (prev === fullViewPhotos.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center text-xl cursor-pointer transition select-none z-50 font-bold"
              >
                ›
              </button>
            )}
          </div>

          <div className="text-center text-white/50 text-[10px] pb-2 font-medium">
            Tap anywhere to close
          </div>
        </div>
      )}
    </div>
  );
};
