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
  Heart, Gift, PlusCircle
} from 'lucide-react';

export const HomeFeed: React.FC = () => {
  const { posts, currentUser, savePostToggle, claimDonation, joinVolunteerEvent, chatWithUser } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'for_you' | 'nearby' | 'volunteer' | 'donations' | 'jobs' | 'events' | 'emergency'>('for_you');
  
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [joiningPostId, setJoiningPostId] = useState<string | null>(null);

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
        // Filter by user categories of interest, or show all if empty
        return sorted.filter(p => 
          currentUser.categories.length === 0 || 
          currentUser.categories.some(cat => p.category.toLowerCase().includes(cat.toLowerCase()) || p.type.toLowerCase().includes(cat.toLowerCase()))
        );
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
    await savePostToggle(postId);
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
      alert('Link copied to clipboard!');
    }
  };

  const handleMessage = async (e: React.MouseEvent, post: Post) => {
    e.stopPropagation();
    if (currentUser?.id === post.userId) {
      alert("This is your own opportunity!");
      return;
    }
    // Redirect to messaging, initiating chat
    await chatWithUser(post.userId, `Hi ${post.authorName}! I am interested in your post: "${post.title}". How can I help?`);
    navigate('/chat');
  };

  const handleAction = async (e: React.MouseEvent, post: Post) => {
    e.stopPropagation();
    if (currentUser?.id === post.userId) {
      alert("This is your own opportunity!");
      return;
    }

    setJoiningPostId(post.id);
    try {
      if (post.type === 'donation') {
        if (window.confirm(`Would you like to reserve "${post.title}"? This will claim the item and open a chat with the owner.`)) {
          await claimDonation(post.id);
          navigate('/chat');
        }
      } else if (post.type === 'volunteer' || post.type === 'emergency') {
        await joinVolunteerEvent(post.id);
        alert('You have successfully registered for this event! Notification sent.');
      } else {
        // Just contact author
        await handleMessage(e, post);
      }
    } catch (err) {
      console.error(err);
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

      {/* Posts List */}
      <div className="space-y-4 text-left">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-350">No opportunities found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">
              Try checking other categories or creating a new post to ask the community for help.
            </p>
            <Button variant="primary" size="sm" onClick={() => navigate('/create-post')} className="mt-4 font-semibold">
              Create New Opportunity
            </Button>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isExpanded = expandedPostId === post.id;
            const hasJoined = currentUser && post.details?.slotsFilled !== undefined && 
              post.details.slotsTotal !== undefined && post.details.slotsFilled >= post.details.slotsTotal;
              
            return (
              <Card
                key={post.id}
                hoverEffect
                onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                className={`p-5 relative cursor-pointer border ${
                  post.urgency === 'critical' 
                    ? 'border-red-200 dark:border-red-950/40 bg-red-50/10 dark:bg-red-950/5' 
                    : 'border-slate-100 dark:border-slate-800/80'
                }`}
              >
                {/* Emergency Tag for top feed items */}
                {post.urgency === 'critical' && (
                  <span className="absolute top-0 right-0 transform translate-x-[-16px] translate-y-[-10px] bg-red-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-sm animate-pulse">
                    Urgent Alert
                  </span>
                )}

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
                          <span title="Verified Organization">
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
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{post.distance} ({post.location.split(',')[0]})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant={getUrgencyVariant(post.urgency)}>
                      {post.urgency} Urgency
                    </Badge>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="mt-4">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-display">
                    {post.title}
                  </h3>
                  <p className={`text-xs text-slate-600 dark:text-slate-450 mt-1.5 leading-relaxed ${
                    isExpanded ? '' : 'line-clamp-2'
                  }`}>
                    {post.description}
                  </p>
                </div>

                {/* Photos */}
                {post.photos && post.photos.length > 0 && (
                  <div className="mt-3.5 overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 max-h-48">
                    <img
                      src={post.photos[0]}
                      alt="Opportunity attachment"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Tab specific detail fields when expanded */}
                {isExpanded && post.details && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4 text-xs bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-xl">
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
                    {post.details.date && (
                      <div className="col-span-2 flex items-center space-x-1.5">
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
                      <div className="col-span-2">
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
                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800/80 rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    #{post.category}
                  </span>

                  <div className="flex items-center space-x-1">
                    {/* Save Button */}
                    <button
                      onClick={(e) => handleSave(e, post.id)}
                      className={`p-2 rounded-xl transition hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                        post.saved ? 'text-brand-amber-500 fill-brand-amber-500' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={(e) => handleShare(e, post)}
                      className="p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {/* Message Button */}
                    <button
                      onClick={(e) => handleMessage(e, post)}
                      className="p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    {/* primary action trigger based on type */}
                    {currentUser?.id !== post.userId && (
                      <Button
                        onClick={(e) => handleAction(e, post)}
                        variant={post.type === 'emergency' ? 'danger' : 'primary'}
                        size="sm"
                        disabled={joiningPostId === post.id || hasJoined || post.details?.completed}
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
                              hasJoined ? 'Slots Filled' : 'Join Event'
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
      <button
        onClick={() => navigate('/create-post')}
        className="md:hidden fixed bottom-20 right-5 w-14 h-14 bg-brand-blue-500 hover:bg-brand-blue-600 active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-blue-500/30 cursor-pointer hover-scale transition-transform duration-200 z-30 border border-brand-blue-600/30"
      >
        <PlusCircle className="w-6 h-6" />
      </button>
    </div>
  );
};
