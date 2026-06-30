import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Post } from '../services/mockDb';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Gift, MapPin, CheckCircle, Package, ArrowRight, Tag, Truck } from 'lucide-react';

export const DonationModule: React.FC = () => {
  const { posts, claimDonation, currentUser } = useApp();
  const navigate = useNavigate();
  
  // Filter states
  const [conditionFilter, setConditionFilter] = useState<string>('All');
  const [deliveryFilter, setDeliveryFilter] = useState<string>('All');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const donationPosts = posts.filter(p => p.type === 'donation');

  const filteredDonations = donationPosts.filter(post => {
    const condition = post.details?.condition || 'Good';
    const delivery = post.details?.delivery || 'Pickup Only';

    const matchesCondition = conditionFilter === 'All' || condition === conditionFilter;
    const matchesDelivery = deliveryFilter === 'All' || delivery === deliveryFilter;

    return matchesCondition && matchesDelivery;
  });

  const handleClaim = async (postId: string) => {
    setClaimingId(postId);
    try {
      await claimDonation(postId);
      setSelectedPost(null);
      alert('Item reserved successfully! A direct message has been sent to coordinate pickup.');
      navigate('/chat');
    } catch (err) {
      console.error(err);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl font-bold font-display text-slate-850 dark:text-white flex items-center">
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

        <Button variant="secondary" size="sm" onClick={() => navigate('/create-post')} className="ml-auto text-xs py-1.5 font-bold">
          Donate an Item
        </Button>
      </Card>

      {/* Donation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredDonations.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white dark:bg-slate-900 border rounded-2xl">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-500">No donations match your filters</p>
          </div>
        ) : (
          filteredDonations.map((post) => {
            const isCompleted = post.details?.completed;
            const isReservedByMe = post.details?.reservedBy === currentUser?.id;
            
            return (
              <Card
                key={post.id}
                hoverEffect
                onClick={() => setSelectedPost(post)}
                className={`overflow-hidden cursor-pointer border flex flex-col justify-between h-[320px] ${
                  isCompleted ? 'opacity-65' : 'border-slate-100 dark:border-slate-800'
                }`}
              >
                <div>
                  {/* Photo container */}
                  <div className="h-36 relative bg-slate-50 dark:bg-slate-850">
                    {post.photos && post.photos.length > 0 ? (
                      <img src={post.photos[0]} alt={post.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Gift className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      <Badge variant="info">{post.details?.condition || 'Good'}</Badge>
                      <Badge variant="warning">{post.details?.delivery === 'Pickup Only' ? 'Pickup' : 'Delivery'}</Badge>
                    </div>

                    {isCompleted && (
                      <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                        <span className="bg-slate-800/90 text-white font-bold text-xs uppercase px-3 py-1 rounded-full flex items-center shadow-md">
                          <CheckCircle className="w-4 h-4 mr-1 text-brand-green-500" />
                          {isReservedByMe ? 'Claimed By You' : 'Reserved'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body details */}
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 font-display line-clamp-1">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {post.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-50 dark:border-slate-800 mt-2">
                  <div className="flex items-center space-x-1.5 truncate max-w-28">
                    <img src={post.authorAvatar} alt="owner" className="w-5 h-5 rounded-md" />
                    <span className="font-bold truncate text-slate-700 dark:text-slate-350">{post.authorName}</span>
                  </div>
                  <span className="flex items-center">
                    <MapPin className="w-3 h-3 text-slate-400 mr-0.5" />
                    {post.distance}
                  </span>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* DETAIL DRAWER / DIALOG MODAL */}
      {selectedPost && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedPost(null)} />
          
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl relative text-left">
              <div className="absolute top-0 inset-x-0 h-1 bg-brand-blue-500" />
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-150 font-display">{selectedPost.title}</h3>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{selectedPost.location} ({selectedPost.distance})</span>
                  </div>
                </div>
                <button onClick={() => setSelectedPost(null)} className="p-1 rounded hover:bg-slate-100 cursor-pointer text-slate-400 text-lg">×</button>
              </div>

              {selectedPost.photos && selectedPost.photos.length > 0 && (
                <img src={selectedPost.photos[0]} alt="Item" className="w-full h-48 object-cover rounded-xl border mb-4" />
              )}

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 whitespace-pre-line">
                {selectedPost.description}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-850 p-3 rounded-xl mb-6 border dark:border-slate-800">
                <div className="flex items-center space-x-1.5">
                  <Tag className="w-4 h-4 text-brand-blue-500" />
                  <span className="text-slate-500 font-medium">Condition:</span>
                  <strong className="text-slate-700 dark:text-slate-350">{selectedPost.details?.condition || 'Good'}</strong>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Truck className="w-4 h-4 text-brand-green-500" />
                  <span className="text-slate-500 font-medium">Logistics:</span>
                  <strong className="text-slate-700 dark:text-slate-350">{selectedPost.details?.delivery || 'Pickup Only'}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <img src={selectedPost.authorAvatar} alt="owner" className="w-8 h-8 rounded-lg" />
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{selectedPost.authorName}</h5>
                    <p className="text-[9px] text-slate-450">Donation Owner</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedPost(null)}>
                    Close
                  </Button>
                  
                  {currentUser?.id !== selectedPost.userId && !selectedPost.details?.completed && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleClaim(selectedPost.id)}
                      disabled={claimingId === selectedPost.id}
                    >
                      {claimingId === selectedPost.id ? 'Claiming...' : (
                        <span className="flex items-center font-bold">
                          Reserve Item <ArrowRight className="w-4 h-4 ml-1.5" />
                        </span>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
