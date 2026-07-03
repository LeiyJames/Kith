import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ArrowLeft, ArrowRight, Eye, CheckCircle, Image, MapPin, Calendar, Clock, X, Upload } from 'lucide-react';

const getImageUrls = (urlStr: string): string[] => {
  if (!urlStr) return [];
  if (urlStr.startsWith('data:')) {
    return [urlStr];
  }
  return urlStr.split(',').map(u => u.trim()).filter(Boolean);
};

const CATEGORIES = [
  { id: 'need_help', label: 'Need Help', type: 'need_help', cat: 'General Help' },
  { id: 'offer_help', label: 'Offer Help', type: 'offer_help', cat: 'Tutoring' },
  { id: 'donation', label: 'Donate Item', type: 'donation', cat: 'Donations' },
  { id: 'volunteer', label: 'Volunteer Event', type: 'volunteer', cat: 'Volunteer' },
  { id: 'event', label: 'Community Event', type: 'event', cat: 'Community Events' },
  { id: 'job', label: 'Job Listing', type: 'job', cat: 'Jobs' },
  { id: 'emergency', label: 'Emergency Aid', type: 'emergency', cat: 'Emergency Response' },
];

export const CreatePost: React.FC = () => {
  const { addNewPost, currentUser, showToast } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  React.useEffect(() => {
    if (currentUser && currentUser.role !== 'kith' && currentUser.role !== 'admin') {
      showToast('Access restricted to Kith accounts only.', 'error');
      navigate('/feed');
    }
  }, [currentUser, navigate]);

  // Form Fields
  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('low');
  const [photoUrl, setPhotoUrl] = useState('');
  
  // Custom schema fields
  const [condition, setCondition] = useState<'New' | 'Like New' | 'Good' | 'Fair'>('Good');
  const [delivery, setDelivery] = useState<'Pickup Only' | 'Delivery Available'>('Pickup Only');
  const [slotsTotal, setSlotsTotal] = useState(10);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Moderate' | 'Challenging'>('Easy');
  const [hoursRequired, setHoursRequired] = useState(2);
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [skillsNeeded, setSkillsNeeded] = useState('');

  // Donation additional fields
  const [donationCategory, setDonationCategory] = useState('Clothing');
  const [quantity, setQuantity] = useState('1 item');

  // Job additional fields
  const [jobType, setJobType] = useState('Full-time');
  const [compensation, setCompensation] = useState('Volunteer / Unpaid');

  // Mentorship additional fields
  const [mentorshipTopic, setMentorshipTopic] = useState('Technology');
  const [sessionDuration, setSessionDuration] = useState('60 minutes');
  const [sessionFormat, setSessionFormat] = useState('Online');

  // Emergency additional fields
  const [incidentType, setIncidentType] = useState('Flood');

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      setIsPreviewOpen(true);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handlePublish = async () => {
    try {
      const details: any = {};
      let finalUrgency = urgency;

      if (selectedCat.type === 'donation') {
        details.condition = condition;
        details.delivery = delivery;
        details.donationCategory = donationCategory;
        details.quantity = quantity;
        details.completed = false;
        finalUrgency = 'low';
      } else if (selectedCat.type === 'volunteer' || selectedCat.type === 'event') {
        details.date = eventDate || new Date().toISOString().split('T')[0];
        details.time = eventTime || '10:00 AM';
        details.slotsTotal = slotsTotal;
        details.slotsFilled = 0;
        details.difficulty = difficulty;
        details.hoursRequired = hoursRequired;
        details.skillsNeeded = skillsNeeded.split(',').map(s => s.trim()).filter(Boolean);
        finalUrgency = 'low';
      } else if (selectedCat.type === 'emergency') {
        details.date = eventDate || new Date().toISOString().split('T')[0];
        details.time = eventTime || 'ASAP';
        details.slotsTotal = slotsTotal;
        details.slotsFilled = 0;
        details.incidentType = incidentType;
        details.completed = false;
        finalUrgency = 'critical';
      } else if (selectedCat.type === 'job') {
        details.jobType = jobType;
        details.compensation = compensation;
        details.skillsNeeded = skillsNeeded.split(',').map(s => s.trim()).filter(Boolean);
        finalUrgency = 'low';
      } else if (selectedCat.type === 'mentorship') {
        details.mentorshipTopic = mentorshipTopic;
        details.sessionDuration = sessionDuration;
        details.sessionFormat = sessionFormat;
        finalUrgency = 'low';
      }

      await addNewPost({
        type: selectedCat.type as any,
        category: selectedCat.cat,
        title,
        description,
        location,
        urgency: finalUrgency,
        photos: getImageUrls(photoUrl),
        details
      });

      showToast('Listing created successfully! Impact score updated.', 'success');
      if (currentUser?.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (currentUser?.role === 'kith') {
        navigate('/org-dashboard');
      } else {
        navigate('/feed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const autoSelectPhoto = (catType: string) => {
    // No-op to remove mockup presets
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center space-x-2">
        <button onClick={() => navigate('/feed')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
        <h1 className="text-xl font-bold font-display text-slate-850 dark:text-white">Create New Listing</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form panel */}
        <Card className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-md">
          {/* Progress Indicator */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-bold text-brand-blue-500">Form Step {step} of 2</span>
            <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-blue-500 transition-all duration-300"
                style={{ width: `${(step / 2) * 100}%` }}
              />
            </div>
          </div>

          {/* STEP 1: Category, Title, Description */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Select Listing Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCat(cat);
                        autoSelectPhoto(cat.type);
                      }}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-bold text-center transition cursor-pointer active-scale truncate ${
                        selectedCat.id === cat.id
                          ? 'border-brand-blue-500 bg-brand-blue-50/20 text-brand-blue-600 dark:text-brand-blue-400'
                          : 'border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Listing Title"
                type="text"
                placeholder="e.g. Seeking Algebra Math Tutor / Donating warm blankets"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="text-left">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-none focus:border-brand-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-brand-blue-500 text-slate-800 dark:text-slate-100"
                  rows={4}
                  placeholder="Explain what help is needed, schedule details, condition of donation items, or location logistics..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 2: Location, Urgency, Photos & Custom Details */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Location"
                  type="text"
                  placeholder="e.g. Greenwood Library / Downtown Depot"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />

                {/* Urgency selection ONLY for need_help / offer_help */}
                {(selectedCat.type === 'need_help' || selectedCat.type === 'offer_help') ? (
                  <div className="text-left">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Urgency Level
                    </label>
                    <select
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-brand-blue-500 text-slate-800 dark:text-slate-105"
                      value={urgency}
                      onChange={(e: any) => setUrgency(e.target.value)}
                    >
                      <option value="low">Low Urgency</option>
                      <option value="medium">Medium Urgency</option>
                      <option value="high">High Urgency</option>
                      <option value="critical">Critical / Emergency</option>
                    </select>
                  </div>
                ) : selectedCat.type === 'donation' ? (
                  <div className="text-left">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Quantity Available
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1 item / Batch of 10"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-brand-blue-500 text-slate-800 dark:text-slate-105"
                    />
                  </div>
                ) : selectedCat.type === 'job' ? (
                  <div className="text-left">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Job Type
                    </label>
                    <select
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-brand-blue-500 text-slate-800 dark:text-slate-105"
                      value={jobType}
                      onChange={(e: any) => setJobType(e.target.value)}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                ) : selectedCat.type === 'mentorship' ? (
                  <div className="text-left">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Format
                    </label>
                    <select
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-brand-blue-500 text-slate-800 dark:text-slate-105"
                      value={sessionFormat}
                      onChange={(e: any) => setSessionFormat(e.target.value)}
                    >
                      <option value="Online">Online Session</option>
                      <option value="In-person">In-person</option>
                    </select>
                  </div>
                ) : selectedCat.type === 'emergency' ? (
                  <div className="text-left">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Incident Type
                    </label>
                    <select
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-brand-blue-500 text-slate-800 dark:text-slate-105"
                      value={incidentType}
                      onChange={(e: any) => setIncidentType(e.target.value)}
                    >
                      <option value="Flood">Flood Aid</option>
                      <option value="Fire">Fire Rescue</option>
                      <option value="Medical">Medical Alert</option>
                      <option value="Missing">Search & Rescue</option>
                      <option value="Food Aid">Food Distribution</option>
                    </select>
                  </div>
                ) : null}
              </div>

              {/* Donation Custom fields */}
              {selectedCat.type === 'donation' && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-left">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                      Item Category
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                      value={donationCategory}
                      onChange={(e: any) => setDonationCategory(e.target.value)}
                    >
                      <option value="Clothing">Clothing & Apparel</option>
                      <option value="Food">Food & Hydration</option>
                      <option value="Electronics">Electronics & Tools</option>
                      <option value="Books">Books & Learning</option>
                      <option value="Household">Household Supplies</option>
                      <option value="Other">Other Items</option>
                    </select>
                  </div>
                  <div className="text-left">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                      Item Condition
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                      value={condition}
                      onChange={(e: any) => setCondition(e.target.value)}
                    >
                      <option value="New">Brand New</option>
                      <option value="Like New">Like New</option>
                      <option value="Good">Good Condition</option>
                      <option value="Fair">Fair / Usable</option>
                    </select>
                  </div>
                  <div className="text-left">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                      Logistics
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                      value={delivery}
                      onChange={(e: any) => setDelivery(e.target.value)}
                    >
                      <option value="Pickup Only">Pickup Only</option>
                      <option value="Delivery Available">Delivery Available</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Event / Volunteer Custom Fields */}
              {(selectedCat.type === 'volunteer' || selectedCat.type === 'event') && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Event Date"
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                    />
                    <Input
                      label="Event Time"
                      type="text"
                      placeholder="e.g. 10:00 AM - 2:00 PM"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label="Slots Available"
                      type="number"
                      value={slotsTotal}
                      onChange={(e) => setSlotsTotal(parseInt(e.target.value) || 0)}
                    />
                    <div className="text-left">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Difficulty
                      </label>
                      <select
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                        value={difficulty}
                        onChange={(e: any) => setDifficulty(e.target.value)}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Challenging">Challenging</option>
                      </select>
                    </div>
                    <Input
                      label="Hours Required"
                      type="number"
                      value={hoursRequired}
                      onChange={(e) => setHoursRequired(parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <Input
                    label="Skills Needed (comma separated)"
                    type="text"
                    placeholder="e.g. Gardening, Teamwork, Lift 20lbs"
                    value={skillsNeeded}
                    onChange={(e) => setSkillsNeeded(e.target.value)}
                  />
                </div>
              )}

              {/* Emergency Custom Fields */}
              {selectedCat.type === 'emergency' && (
                <div className="p-4 bg-red-50/5 dark:bg-red-950/5 rounded-xl border border-red-150 dark:border-red-900/40 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Response Date"
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                    />
                    <Input
                      label="Immediate Action Time"
                      type="text"
                      placeholder="e.g. ASAP / Immediate"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                    />
                  </div>

                  <Input
                    label="Responders Needed (slots)"
                    type="number"
                    value={slotsTotal}
                    onChange={(e) => setSlotsTotal(parseInt(e.target.value) || 0)}
                  />
                </div>
              )}

              {/* Jobs Custom Fields */}
              {selectedCat.type === 'job' && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Compensation / Salary"
                      type="text"
                      placeholder="e.g. $15/hr / Volunteer / Unpaid"
                      value={compensation}
                      onChange={(e) => setCompensation(e.target.value)}
                    />
                    <Input
                      label="Skills Required (comma separated)"
                      type="text"
                      placeholder="e.g. Project Management, Cleaning"
                      value={skillsNeeded}
                      onChange={(e) => setSkillsNeeded(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Mentorship Custom Fields */}
              {selectedCat.type === 'mentorship' && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="text-left">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                      Mentorship Topic / Field
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-850 dark:text-white"
                      value={mentorshipTopic}
                      onChange={(e: any) => setMentorshipTopic(e.target.value)}
                    >
                      <option value="Technology">Technology & Engineering</option>
                      <option value="Career Development">Career & Resume Building</option>
                      <option value="Education">Education & Academic</option>
                      <option value="Healthcare">Healthcare & Well-being</option>
                      <option value="Arts & Design">Creative Arts & Design</option>
                      <option value="Other">Other Professional Support</option>
                    </select>
                  </div>
                  <div className="text-left">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                      Session Duration
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-855 dark:text-white"
                      value={sessionDuration}
                      onChange={(e: any) => setSessionDuration(e.target.value)}
                    >
                      <option value="30 minutes">30 minutes</option>
                      <option value="60 minutes">60 minutes</option>
                      <option value="90 minutes">90 minutes</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="text-left space-y-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase">
                  Cover Photo (Optional)
                </label>
                <div className="flex items-center space-x-4">
                  {photoUrl ? (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border">
                      <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-slate-250 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition relative cursor-pointer">
                      <span className="text-[10px] text-slate-505 font-bold text-center p-1">Choose File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                  <div className="text-xs text-slate-400">
                    <p className="font-semibold">Select a cover photo from your device.</p>
                    <p>Format support: PNG, JPG, JPEG, SVG, WebP.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className={step === 1 ? 'opacity-30 cursor-not-allowed' : ''}
            >
              Back
            </Button>

            <Button
              variant="primary"
              onClick={handleNext}
              disabled={step === 1 && (!title || !description)}
            >
              {step === 2 ? 'Preview Listing' : 'Next'}
              {step !== 2 && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </Card>

        {/* Info Box / Guidance Sidebar */}
        <div className="space-y-4">
          <Card className="p-5 bg-gradient-to-br from-brand-blue-50 to-brand-green-50 dark:from-brand-blue-900/10 dark:to-brand-green-900/10 border border-brand-blue-100/30 dark:border-brand-blue-800/10">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center mb-2">
              <CheckCircle className="w-4 h-4 text-brand-green-500 mr-2" />
              Community Guidelines
            </h3>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-4 leading-relaxed">
              <li>Keep titles clear and describe the exact need or offer.</li>
              <li>Provide accurate coordinates so volunteers can locate you easily.</li>
              <li>Set a realistic urgency level to ensure emergencies get handled first.</li>
              <li>You will earn **+50 to +100 Impact Points** upon publishing!</li>
            </ul>
          </Card>

          {photoUrl && (
            <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden">
              <span className="block text-xs font-semibold text-slate-500 uppercase mb-2">Image Preview</span>
              <div className="grid grid-cols-2 gap-2">
                {getImageUrls(photoUrl).map((url, index) => (
                  <img key={index} src={url} alt={`Selection ${index + 1}`} className="w-full h-24 object-cover rounded-lg border" />
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* 5. PREVIEW MODAL */}
      {isPreviewOpen && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsPreviewOpen(false)} />
          
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl relative">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-150 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-brand-blue-500" />
                  Listing Preview
                </h3>
                <Badge variant={urgency === 'critical' ? 'emergency' : urgency === 'high' ? 'danger' : 'neutral'}>
                  {urgency} urgency
                </Badge>
              </div>

              {/* Mock Card */}
              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-3">
                  <img src={currentUser?.avatar} alt="Author" className="w-9 h-9 rounded-lg" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{currentUser?.name} (You)</h4>
                    <p className="text-[10px] text-slate-400">Just now • {location}</p>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed whitespace-pre-line">{description}</p>
                
                {photoUrl && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {getImageUrls(photoUrl).map((url, index) => (
                      <img key={index} src={url} alt={`Preview ${index + 1}`} className="w-full h-28 object-cover rounded-xl border border-slate-100 dark:border-slate-800" />
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 text-xs bg-slate-50 dark:bg-slate-950/20 p-3 rounded-xl">
                  <div>
                    <span className="text-slate-400 font-semibold">Category:</span>{' '}
                    <Badge variant="info">#{selectedCat.cat}</Badge>
                  </div>
                  {selectedCat.type === 'donation' && (
                    <>
                      <div><span className="text-slate-400 font-semibold">Condition:</span> <span className="text-slate-700 dark:text-slate-350">{condition}</span></div>
                      <div><span className="text-slate-400 font-semibold">Logistics:</span> <span className="text-slate-700 dark:text-slate-350">{delivery}</span></div>
                    </>
                  )}
                  {(selectedCat.type === 'volunteer' || selectedCat.type === 'event' || selectedCat.type === 'emergency') && (
                    <>
                      <div className="col-span-2 flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand-blue-500" />
                        <span className="text-slate-700 dark:text-slate-350">{eventDate || 'Date pending'} ({eventTime || 'Time pending'})</span>
                      </div>
                      <div><span className="text-slate-400 font-semibold">Slots:</span> <span className="text-slate-750 font-bold">{slotsTotal}</span></div>
                      <div><span className="text-slate-400 font-semibold">Hours:</span> <span className="text-slate-700 dark:text-slate-350">{hoursRequired} hrs</span></div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                  Edit Details
                </Button>
                <Button variant="secondary" onClick={handlePublish}>
                  Publish Listing
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
