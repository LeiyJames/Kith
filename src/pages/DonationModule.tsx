import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Post } from '../services/mockDb';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Gift, MapPin, CheckCircle, Package, ArrowRight, Tag, Truck, Clock, Bookmark, MessageSquare, ShieldCheck, Calendar } from 'lucide-react';
import { ImageGallery } from './HomeFeed';

export const DonationModule: React.FC = () => {
  const { posts, claimDonation, currentUser, showToast, savePostToggle, chatWithUser } = useApp();
  const navigate = useNavigate();
  
  // Filter states
  const [conditionFilter, setConditionFilter] = useState<string>('All');
  const [deliveryFilter, setDeliveryFilter] = useState<string>('All');
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  // Lightbox states
  const [fullViewPhotos, setFullViewPhotos] = useState<string[] | null>(null);
  const [fullViewIndex, setFullViewIndex] = useState<number>(0);

  const donationPosts = useMemo(() => {
    return posts.filter(p => p.type === 'donation');
  }, [posts]);

  const filteredDonations = useMemo(() => {
    return donationPosts.filter(post => {
      const condition = post.details?.condition || 'Good';
      const delivery = post.details?.delivery || 'Pickup Only';

      const matchesCondition = conditionFilter === 'All' || condition === conditionFilter;
      const matchesDelivery = deliveryFilter === 'All' || delivery === deliveryFilter;

      return matchesCondition && matchesDelivery;
    });
  }, [donationPosts, conditionFilter, deliveryFilter]);

  const handleClaim = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    if (!currentUser) {
      showToast('Please sign in to claim donation items.', 'warning');
      return;
    }
    setClaimingId(postId);
    try {
      await claimDonation(postId);
      showToast('Item reserved successfully! A direct message has been sent to coordinate pickup.', 'success');
      const post = posts.find(p => p.id === postId);
      navigate('/chat', { state: { userId: post?.userId } });
    } catch (err) {
      console.error(err);
    } finally {
      setClaimingId(null);
    }
  };

  const handleSave = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    if (!currentUser) {
      showToast('Please sign in to bookmark donations.', 'warning');
      return;
    }
    savePostToggle(postId);
    const isSaved = currentUser.savedPosts?.includes(postId);
    showToast(isSaved ? 'Donation removed from bookmarks.' : 'Donation bookmarked successfully!', 'success');
  };

  const handleDonateItem = () => {
    if (!currentUser) {
      showToast('Please sign in to donate an item.', 'warning');
      return;
    }
    navigate('/create-post');
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl font-bold font-display text-slate-800 dark:text-white flex items-center">
          <Gift className="w-6 h-6 text-brand-blue-500 mr-2" />
          Donation Hub
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Claim items donated by neighbors or offer items you no longer need.
        </p>
      </div>

      {/* Filter panel */}
      <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-wrap gap-4 text-xs font-semibold">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Condition:</span>
          {['All', 'New', 'Like New', 'Good', 'Fair'].map((cond) => (
            <button
              key={cond}
              onClick={() => setConditionFilter(cond)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer border ${
                conditionFilter === cond
                  ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'
              }`}
            >
              {cond}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Logistics:</span>
          {['All', 'Pickup Only', 'Delivery Available'].map((deliv) => (
            <button
              key={deliv}
              onClick={() => setDeliveryFilter(deliv)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer border ${
                deliveryFilter === deliv
                  ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'
              }`}
            >
              {deliv.split(' ')[0]}
            </button>
          ))}
        </div>

        {(!currentUser || currentUser.role === 'kith' || currentUser.role === 'admin') && (
          <Button variant="secondary" size="sm" onClick={handleDonateItem} className="ml-auto text-xs py-1.5 font-bold">
            Donate an Item
          </Button>
        )}
      </Card>

      {/* Donation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {filteredDonations.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white dark:bg-slate-900 border rounded-2xl">
            <Package className="w-12 h-12 text-slate-350 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-500">No donations match your filters</p>
          </div>
        ) : (
          filteredDonations.map((post) => {
            const isCompleted = post.details?.completed;
            const isReservedByMe = post.details?.reservedBy === currentUser?.id;
            const isExpanded = expandedPostId === post.id;
            const isSaved = currentUser?.savedPosts?.includes(post.id);

            return (
              <Card
                key={post.id}
                hoverEffect
                onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                className={`p-5 relative cursor-pointer border ${
                  isCompleted 
                    ? 'opacity-70 bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-850'
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
                    {isCompleted && (
                      <span className="inline-flex items-center bg-brand-green-500 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                        {isReservedByMe ? 'Claimed By You' : 'Reserved'}
                      </span>
                    )}
                    <Badge variant={isCompleted ? 'neutral' : 'info'}>
                      Donation
                    </Badge>
                  </div>
                </div>

                {/* Category tags & Title & Description */}
                <div className="mt-4">
                  <div className="flex items-center gap-1.5 flex-wrap mb-2">
                    <span className="px-2.5 py-0.5 bg-brand-blue-50 dark:bg-brand-blue-900/15 text-brand-blue-600 dark:text-brand-blue-400 text-[10px] font-extrabold rounded-lg border border-brand-blue-100/30 dark:border-brand-blue-900/30">
                      #{post.category}
                    </span>
                    <span className="px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-brand-amber-600 dark:text-brand-amber-400 text-[10px] font-extrabold rounded-lg border border-brand-amber-100/30 dark:border-brand-amber-900/30">
                      {post.details?.condition || 'Good'} Condition
                    </span>
                    <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold rounded-lg border border-emerald-100/30 dark:border-emerald-900/30">
                      {post.details?.delivery || 'Pickup Only'}
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

                {/* Specs Grid */}
                {isExpanded && post.details && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2.5 text-xs font-semibold text-slate-650 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-xl">
                    <div className="flex items-center space-x-1.5">
                      <Tag className="w-3.5 h-3.5 text-brand-blue-500 flex-shrink-0" />
                      <span className="text-slate-500 font-medium">Condition:</span>
                      <strong className="text-slate-700 dark:text-slate-350">{post.details.condition || 'Good'}</strong>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Truck className="w-3.5 h-3.5 text-brand-green-500 flex-shrink-0" />
                      <span className="text-slate-500 font-medium">Logistics:</span>
                      <strong className="text-slate-700 dark:text-slate-350">{post.details.delivery || 'Pickup Only'}</strong>
                    </div>
                    {post.details.donationCategory && (
                      <div className="flex items-center space-x-1.5 col-span-2 border-t border-slate-100 dark:border-slate-800/50 pt-2 mt-1">
                        <span className="text-slate-500 font-medium">Category:</span>
                        <strong className="text-slate-700 dark:text-slate-350">{post.details.donationCategory}</strong>
                      </div>
                    )}
                    {post.details.quantity && (
                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-500 font-medium">Quantity:</span>
                        <strong className="text-slate-700 dark:text-slate-350">{post.details.quantity}</strong>
                      </div>
                    )}
                    <div className="flex items-start space-x-1.5 col-span-2 border-t border-slate-100 dark:border-slate-800/50 pt-2 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-blue-500 flex-shrink-0 mt-0.5" />
                      <span className="break-words whitespace-normal leading-tight text-slate-600 dark:text-slate-400">{post.location}</span>
                    </div>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="mt-5 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-end w-full">
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
                          await chatWithUser(post.userId, `Hi ${post.authorName}! I am interested in your donation item: "${post.title}". Is it still available?`);
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

                    {/* Claim Button */}
                    {currentUser?.id !== post.userId && (
                      <Button
                        onClick={(e) => handleClaim(e, post.id)}
                        variant="primary"
                        size="sm"
                        disabled={claimingId === post.id || isCompleted}
                        className="ml-2 font-bold cursor-pointer py-1.5 text-xs rounded-xl animate-scale-in"
                      >
                        {claimingId === post.id ? 'Claiming...' : (
                          <span className="flex items-center">
                            {isCompleted ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                Claimed
                              </>
                            ) : (
                              'Accept Item'
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
