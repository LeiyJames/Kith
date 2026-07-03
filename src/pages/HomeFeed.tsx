import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Post } from '../services/mockDb';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  MessageSquare, Share2, Bookmark, Check, ShieldCheck, Clock, 
  MapPin, AlertCircle, Sparkles, Filter, ChevronRight, UserCheck, Calendar,
  Heart, Gift, PlusCircle, X
} from 'lucide-react';

export const HomeFeed: React.FC = () => {
  const { posts, currentUser, savePostToggle, claimDonation, joinVolunteerEvent, chatWithUser, showToast, userRegistrations } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'for_you' | 'nearby' | 'volunteer' | 'donations' | 'jobs' | 'events' | 'emergency'>('for_you');
  
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [joiningPostId, setJoiningPostId] = useState<string | null>(null);
  const [fullViewPhotos, setFullViewPhotos] = useState<string[] | null>(null);
  const [fullViewIndex, setFullViewIndex] = useState<number>(0);

  const handleCreatePost = () => {
    if (!currentUser) {
      showToast('Please sign in to create opportunities.', 'warning');
      navigate('/auth');
      return;
    }
    navigate('/create-post');
  };

  // Filter posts based on tab
  const getFilteredPosts = () => {
    // Sort critical urgency first, then by date
    const sorted = [...posts].sort((a, b) => {
      if (a.urgency === 'critical' && b.urgency !== 'critical') return -1;
      if (b.urgency === 'critical' && a.urgency !== 'critical') return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    switch (activeTab) {
      case 'for_you':
        if (!currentUser) return sorted;
        // Filter by user categories of interest, show user's own posts, or show all if empty
        const matched = sorted.filter(p => 
          p.userId === currentUser.id ||
          currentUser.categories.some(cat => p.category.toLowerCase().includes(cat.toLowerCase()) || p.type.toLowerCase().includes(cat.toLowerCase()))
        );
        return matched.length > 0 ? matched : sorted;
      case 'nearby':
        // Filter for distance < 2 miles or simulate nearby
        return sorted.filter(p => parseFloat(p.distance) <= 2.5);
      case 'volunteer':
        return sorted.filter(p => p.type === 'volunteer');
      case 'donations':
        return sorted.filter(p => p.type === 'donation');
      case 'jobs':
        return sorted.filter(p => p.type === 'job');
      case 'events':
        return sorted.filter(p => p.type === 'event');
      case 'emergency':
        return sorted.filter(p => p.type === 'emergency' || p.urgency === 'critical');
      default:
        return sorted;
    }
  };

  const handleSave = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    if (!currentUser) {
      showToast('Please sign in to save opportunities.', 'warning');
      return;
    }
    const saved = await savePostToggle(postId);
    showToast(saved ? 'Opportunity saved to bookmarks!' : 'Opportunity removed from bookmarks!', 'success');
  };

  const handleShare = (e: React.MouseEvent, post: Post) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/feed#${post.id}`);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  const handleMessage = async (e: React.MouseEvent, post: Post) => {
    e.stopPropagation();
    if (!currentUser) {
      showToast('Please sign in to message users.', 'warning');
      return;
    }
    if (currentUser.id === post.userId) {
      showToast("This is your own opportunity!", 'warning');
      return;
    }
    // Redirect to messaging, initiating chat
    await chatWithUser(post.userId, `Hi ${post.authorName}! I am interested in your post: "${post.title}". How can I help?`);
    navigate('/chat', { state: { userId: post.userId } });
  };

  const handleAction = async (e: React.MouseEvent, post: Post) => {
    e.stopPropagation();
    if (!currentUser) {
      showToast('Please sign in to take action.', 'warning');
      return;
    }
    if (currentUser.id === post.userId) {
      showToast("This is your own opportunity!", 'warning');
      return;
    }

    setJoiningPostId(post.id);
    try {
      if (post.type === 'donation') {
        if (window.confirm(`Would you like to reserve "${post.title}"? This will claim the item and open a chat with the owner.`)) {
          await claimDonation(post.id);
          showToast('Donation accepted successfully! Coordinate pickup in chat.', 'success');
          navigate('/chat', { state: { userId: post.userId } });
        }
      } else if (post.type === 'volunteer' || post.type === 'emergency') {
        await joinVolunteerEvent(post.id);
        showToast('You have successfully registered for this event! Notification sent.', 'success');
      } else {
        // Just contact author
        await handleMessage(e, post);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to complete action.', 'error');
    } finally {
      setJoiningPostId(null);
    }
  };

  const filteredPosts = getFilteredPosts();

  const getUrgencyVariant = (urgency: Post['urgency']) => {
    if (urgency === 'critical') return 'emergency';
    if (urgency === 'high') return 'danger';
    if (urgency === 'medium') return 'warning';
    return 'neutral';
  };

  return (
    <div className="space-y-6">
      
      {/* Personalized Greeting Header */}
      {currentUser && (
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-brand-blue-500/10 to-brand-green-500/10 dark:from-brand-blue-900/10 dark:to-brand-green-900/10 p-6 rounded-2xl border border-brand-blue-100/30 dark:border-brand-blue-900/20 text-left">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center">
              Hello, {currentUser.name}! <Sparkles className="w-5 h-5 ml-1.5 text-brand-amber-500 fill-brand-amber-500/10" />
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your community impact score is <strong className="text-brand-green-600 dark:text-brand-green-400">{currentUser.impactScore} points</strong>. You've helped <strong className="text-brand-blue-600 dark:text-brand-blue-400">{currentUser.peopleHelped} people</strong> this month.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/profile')}
            className="mt-4 md:mt-0 font-semibold bg-white dark:bg-slate-900"
          >
            View Impact Dashboard
          </Button>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex overflow-x-auto pb-1.5 scrollbar-none space-x-1.5 border-b border-slate-100 dark:border-slate-800">
        {[
          { id: 'for_you', label: 'For You', icon: Sparkles },
          { id: 'nearby', label: 'Nearby', icon: MapPin },
          { id: 'volunteer', label: 'Volunteer', icon: Heart },
          { id: 'donations', label: 'Donations', icon: Gift },
          { id: 'emergency', label: 'Emergency', icon: AlertCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap border ${
                activeTab === tab.id
                  ? 'bg-brand-blue-500 border-brand-blue-500 text-white shadow-md shadow-brand-blue-500/10'
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5 mr-1.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start text-left">
        {filteredPosts.length === 0 ? (
          <div className="col-span-1 md:col-span-2 text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-350">No listings found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">
              Try checking other categories or creating a new post to ask the community for help.
            </p>
            {(!currentUser || currentUser.role === 'kith' || currentUser.role === 'admin') && (
              <Button variant="primary" size="sm" onClick={handleCreatePost} className="mt-4 font-semibold">
                Create New Listing
              </Button>
            )}
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isExpanded = expandedPostId === post.id;
            const hasJoined = currentUser && post.details?.slotsFilled !== undefined && 
              post.details.slotsTotal !== undefined && post.details.slotsFilled >= post.details.slotsTotal;
            const isRegistered = userRegistrations.includes(post.id);
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
                    <Badge variant={getUrgencyVariant(post.urgency)}>
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
                  </div>
                  <h3 className="text-base font-bold text-slate-855 dark:text-slate-100 font-display leading-snug">
                    {post.title}
                  </h3>
                  <p className={`text-xs text-slate-650 dark:text-slate-400 mt-2 leading-relaxed ${
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
                      className="text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 hover:underline font-bold text-[10px] uppercase mt-1.5 cursor-pointer focus:outline-none flex items-center gap-0.5"
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

                {/* Tab specific detail fields when expanded */}
                {isExpanded && post.details && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-4 text-xs bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-xl">
                    {post.details.condition && (
                      <div>
                        <strong className="text-slate-500 dark:text-slate-400">Condition:</strong>
                        <span className="ml-1 text-slate-700 dark:text-slate-350">{post.details.condition}</span>
                      </div>
                    )}
                    {post.details.delivery && (
                      <div>
                        <strong className="text-slate-500 dark:text-slate-400">Delivery:</strong>
                        <span className="ml-1 text-slate-700 dark:text-slate-350">{post.details.delivery}</span>
                      </div>
                    )}
                    {post.details.donationCategory && (
                      <div>
                        <strong className="text-slate-500 dark:text-slate-400">Item Category:</strong>
                        <span className="ml-1 text-slate-700 dark:text-slate-350">{post.details.donationCategory}</span>
                      </div>
                    )}
                    {post.details.quantity && (
                      <div>
                        <strong className="text-slate-500 dark:text-slate-400">Quantity Available:</strong>
                        <span className="ml-1 text-slate-700 dark:text-slate-350">{post.details.quantity}</span>
                      </div>
                    )}
                    {post.details.incidentType && (
                      <div>
                        <strong className="text-slate-500 dark:text-slate-400">Incident Type:</strong>
                        <span className="ml-1 text-red-600 dark:text-red-400 font-bold capitalize">{post.details.incidentType}</span>
                      </div>
                    )}
                    {post.details.jobType && (
                      <div>
                        <strong className="text-slate-500 dark:text-slate-400">Job Type:</strong>
                        <span className="ml-1 text-slate-700 dark:text-slate-350 capitalize">{post.details.jobType}</span>
                      </div>
                    )}
                    {post.details.compensation && (
                      <div>
                        <strong className="text-slate-500 dark:text-slate-400">Salary/Compensation:</strong>
                        <span className="ml-1 text-brand-green-600 dark:text-brand-green-400 font-bold">{post.details.compensation}</span>
                      </div>
                    )}
                    {post.details.mentorshipTopic && (
                      <div>
                        <strong className="text-slate-500 dark:text-slate-400">Mentorship Topic:</strong>
                        <span className="ml-1 text-slate-700 dark:text-slate-350">{post.details.mentorshipTopic}</span>
                      </div>
                    )}
                    {post.details.sessionDuration && (
                      <div>
                        <strong className="text-slate-500 dark:text-slate-400">Duration:</strong>
                        <span className="ml-1 text-slate-700 dark:text-slate-350">{post.details.sessionDuration}</span>
                      </div>
                    )}
                    {post.details.sessionFormat && (
                      <div>
                        <strong className="text-slate-500 dark:text-slate-400">Format:</strong>
                        <span className="ml-1 text-slate-700 dark:text-slate-350 capitalize">{post.details.sessionFormat}</span>
                      </div>
                    )}
                    {post.details.date && (
                      <div className="col-span-2 flex items-center space-x-1.5 border-t border-slate-100 dark:border-slate-800/40 pt-2 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-brand-blue-500" />
                        <strong className="text-slate-500 dark:text-slate-400">Schedule:</strong>
                        <span className="text-slate-700 dark:text-slate-350">{post.details.date} ({post.details.time})</span>
                      </div>
                    )}
                    {post.details.slotsTotal !== undefined && (
                      <div>
                        <strong className="text-slate-500 dark:text-slate-400">Slots Remaining:</strong>
                        <span className="ml-1 text-brand-green-600 dark:text-brand-green-400 font-bold">
                          {post.details.slotsTotal - (post.details.slotsFilled || 0)} / {post.details.slotsTotal}
                        </span>
                      </div>
                    )}
                    {post.details.difficulty && (
                      <div>
                        <strong className="text-slate-500 dark:text-slate-400">Difficulty:</strong>
                        <span className="ml-1 text-slate-700 dark:text-slate-350">{post.details.difficulty}</span>
                      </div>
                    )}
                    {post.details.hoursRequired && (
                      <div>
                        <strong className="text-slate-500 dark:text-slate-400">Hours Required:</strong>
                        <span className="ml-1 text-slate-700 dark:text-slate-350">{post.details.hoursRequired} hrs</span>
                      </div>
                    )}
                    {post.details.skillsNeeded && post.details.skillsNeeded.length > 0 && (
                      <div className="col-span-2 border-t border-slate-100 dark:border-slate-800/40 pt-2 mt-1">
                        <strong className="text-slate-500 dark:text-slate-400">Skills Needed:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {post.details.skillsNeeded.map(s => (
                            <Badge key={s} variant="info">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Controls */}
                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-end w-full">
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

                    {/* Share Button */}
                    <button
                      onClick={(e) => handleShare(e, post)}
                      data-tooltip="Share Opportunity"
                      className="tooltip-trigger p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {/* Message Button */}
                    <button
                      onClick={(e) => handleMessage(e, post)}
                      data-tooltip="Message Author"
                      className="tooltip-trigger p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    {/* primary action trigger based on type */}
                    {currentUser?.id !== post.userId && (
                      <Button
                        onClick={(e) => handleAction(e, post)}
                        variant={post.type === 'emergency' ? 'danger' : 'primary'}
                        size="sm"
                        disabled={joiningPostId === post.id || isRegistered || hasJoined || post.details?.completed}
                        className="ml-2 font-semibold cursor-pointer py-1.5 text-xs rounded-xl"
                      >
                        {joiningPostId === post.id ? 'Connecting...' : (
                          <span className="flex items-center">
                            {post.details?.completed ? (
                              <>
                                <Check className="w-3.5 h-3.5 mr-1" />
                                Claimed
                              </>
                            ) : post.type === 'donation' ? (
                              'Accept Item'
                            ) : post.type === 'volunteer' || post.type === 'emergency' ? (
                              isRegistered ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                                  Registered
                                </>
                              ) : hasJoined ? (
                                'Slots Filled'
                              ) : (
                                'Join Event'
                              )
                            ) : (
                              'Offer Help'
                            )}
                          </span>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Floating Action Button (Mobile only) */}
      {(!currentUser || currentUser.role === 'kith' || currentUser.role === 'admin') && (
        <button
          onClick={handleCreatePost}
          className="md:hidden fixed bottom-20 right-5 w-14 h-14 bg-brand-blue-500 hover:bg-brand-blue-600 active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-blue-500/30 cursor-pointer hover-scale transition-transform duration-200 z-30 border border-brand-blue-600/30"
        >
          <PlusCircle className="w-6 h-6" />
        </button>
      )}

      {/* Lightbox / Full View Modal */}
      {fullViewPhotos && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-[10000] flex flex-col justify-between p-6 select-none animate-toast-in pointer-events-auto"
          onClick={() => setFullViewPhotos(null)}
        >
          {/* Top Bar */}
          <div className="flex justify-between items-center text-white max-w-5xl mx-auto w-full">
            <span className="text-xs font-semibold">
              Image {fullViewIndex + 1} of {fullViewPhotos.length}
            </span>
            <button 
              onClick={() => setFullViewPhotos(null)}
              className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 transition cursor-pointer"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Middle Image Section */}
          <div className="flex-1 flex items-center justify-center relative py-4 max-w-5xl mx-auto w-full">
            {fullViewPhotos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFullViewIndex(prev => (prev === 0 ? fullViewPhotos.length - 1 : prev - 1));
                }}
                className="absolute left-4 w-11 h-11 rounded-full bg-slate-800/60 text-white hover:bg-slate-700/80 flex items-center justify-center transition z-20 cursor-pointer text-lg font-bold"
              >
                ‹
              </button>
            )}

            <img
              src={fullViewPhotos[fullViewIndex]}
              alt="Opportunity full size"
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
            />

            {fullViewPhotos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFullViewIndex(prev => (prev === fullViewPhotos.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-4 w-11 h-11 rounded-full bg-slate-800/60 text-white hover:bg-slate-700/80 flex items-center justify-center transition z-20 cursor-pointer text-lg font-bold"
              >
                ›
              </button>
            )}
          </div>

          {/* Bottom Info */}
          <div className="text-center text-slate-400 text-xs">
            Click outside the image or press the close button to exit full view.
          </div>
        </div>
      )}
    </div>
  );
};

// Swipable/Clickable Image Gallery inside Feed Cards
export const ImageGallery: React.FC<{ photos: string[]; onOpenFullView: (index: number) => void }> = ({ photos, onOpenFullView }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) return null;

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  return (
    <div className="mt-3.5 overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative group h-52">
      <img
        src={photos[currentIndex]}
        alt={`Opportunity attachment ${currentIndex + 1}`}
        className="w-full h-full object-cover cursor-zoom-in transition-all duration-300 hover:scale-[1.01]"
        onClick={(e) => {
          e.stopPropagation();
          onOpenFullView(currentIndex);
        }}
      />

      {photos.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white hover:bg-black/60 flex items-center justify-center transition opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white hover:bg-black/60 flex items-center justify-center transition opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
          >
            ›
          </button>
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex space-x-1.5 bg-black/25 px-2.5 py-1 rounded-full z-10">
            {photos.map((_, idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-white w-3' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
