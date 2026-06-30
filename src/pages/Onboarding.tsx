import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { User, MapPin, Heart, BookOpen, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
];

const SKILL_OPTIONS = ['Programming', 'Math', 'English', 'Spanish', 'Gardening', 'Cooking', 'Driving', 'Heavy Lifting', 'Child Care', 'Elderly Care', 'Marketing', 'Photography', 'First Aid'];
const INTEREST_OPTIONS = ['Tutoring', 'Volunteer', 'Donations', 'Emergency Response', 'Environment', 'Animals', 'Healthcare', 'Local Events', 'Disaster Relief'];
const CATEGORY_OPTIONS = ['Volunteer', 'Donations', 'Tutoring', 'Community Events', 'Jobs', 'Emergency Response'];

export const Onboarding: React.FC = () => {
  const { currentUser, updateProfile } = useApp();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [avatar, setAvatar] = useState(currentUser?.avatar || PRESET_AVATARS[0]);
  const [name, setName] = useState(currentUser?.name || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const [languages, setLanguages] = useState('English');
  const [availability, setAvailability] = useState('Saturdays & Weekday evenings');

  const toggleItem = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    try {
      await updateProfile({
        name,
        avatar,
        location,
        bio,
        skills: selectedSkills,
        interests: selectedInterests,
        categories: selectedCategories,
        languages: languages.split(',').map(l => l.trim()),
        availability
      });
      navigate('/feed');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-all duration-200">
      <Card className="w-full max-w-xl p-8 relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl text-left">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-blue-500 via-brand-green-500 to-brand-amber-500" />
        
        {/* Progress header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-1.5">
            <span className="text-sm font-bold text-brand-blue-500">Step {step} of 4</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-400">
              {step === 1 && 'Basic Profile'}
              {step === 2 && 'Skills & Capabilities'}
              {step === 3 && 'Interests & Causes'}
              {step === 4 && 'Complete Profile'}
            </span>
          </div>
          <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-blue-500 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100">
              Let's build your profile
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pick an avatar and write a display name to get recognized by the community.
            </p>

            {/* Avatar Select */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Choose Profile Photo
              </label>
              <div className="flex items-center space-x-6">
                <img 
                  src={avatar} 
                  alt="Chosen avatar" 
                  className="w-16 h-16 rounded-2xl border-2 border-brand-blue-500 object-cover shadow-sm"
                />
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAvatar(av)}
                      className={`w-10 h-10 rounded-xl overflow-hidden border-2 cursor-pointer transition active-scale ${
                        avatar === av ? 'border-brand-blue-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={av} alt="Preset avatar" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Input
              label="Display Name"
              type="text"
              placeholder="Elena Chen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="General Location"
              type="text"
              placeholder="Downtown District / West City"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />

            <div className="text-left">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tell us about yourself
              </label>
              <textarea
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-none focus:border-brand-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-brand-blue-500 text-slate-800 dark:text-slate-100"
                rows={3}
                placeholder="Write a brief bio about what you do or why you joined Kith..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* STEP 2: Skills & Background */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100">
              What are your skills?
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Select skills you can share with others (e.g. for mentoring, volunteering, or physical tasks).
            </p>

            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleItem(skill, selectedSkills, setSelectedSkills)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer active-scale ${
                    selectedSkills.includes(skill)
                      ? 'bg-brand-blue-500 border-brand-blue-500 text-white shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Languages spoken"
                type="text"
                placeholder="English, Spanish"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
              />
              <Input
                label="General Availability"
                type="text"
                placeholder="Weekends, evenings"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* STEP 3: Interests & Categories */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100">
              Interests & Causes
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              What categories or causes do you care about the most?
            </p>

            <div>
              <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Causes of Interest
              </span>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleItem(interest, selectedInterests, setSelectedInterests)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer active-scale ${
                      selectedInterests.includes(interest)
                        ? 'bg-brand-green-500 border-brand-green-500 text-white shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Notification Categories
              </span>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleItem(cat, selectedCategories, setSelectedCategories)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer active-scale ${
                      selectedCategories.includes(cat)
                        ? 'bg-brand-amber-500 border-brand-amber-500 text-white shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Summary Confirmation */}
        {step === 4 && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-brand-green-50 dark:bg-brand-green-950/20 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-10 h-10 text-brand-green-500" />
            </div>
            
            <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100">
              You are all set!
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Your profile is customized. You are ready to explore feed opportunities and connect with your neighborhood!
            </p>

            {/* Profile Review Card */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 text-left max-w-md mx-auto space-y-3 mt-4">
              <div className="flex items-center space-x-3">
                <img src={avatar} alt="Avatar" className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{name || 'Unnamed'}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{location || 'No Location'}</p>
                </div>
              </div>
              
              {bio && <p className="text-xs text-slate-500 dark:text-slate-400 italic">"{bio}"</p>}
              
              <div className="flex flex-wrap gap-1.5 pt-2">
                {selectedSkills.slice(0, 3).map(skill => (
                  <Badge key={skill} variant="info">{skill}</Badge>
                ))}
                {selectedInterests.slice(0, 3).map(interest => (
                  <Badge key={interest} variant="success">{interest}</Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-50 dark:border-slate-800/80">
          <Button
            variant="outline"
            onClick={handleBack}
            className={step === 1 ? 'invisible' : ''}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button
            variant="primary"
            onClick={handleNext}
            disabled={step === 1 && (!name || !location)}
          >
            {step === 4 ? 'Let\'s Begin!' : 'Next'}
            {step !== 4 && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </Card>
    </div>
  );
};
