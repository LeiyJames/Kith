import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

const SKILL_OPTIONS = ['Programming', 'Math', 'English', 'Spanish', 'Gardening', 'Cooking', 'Driving', 'Heavy Lifting', 'Child Care', 'Elderly Care', 'Marketing', 'Photography', 'First Aid'];
const INTEREST_OPTIONS = ['Tutoring', 'Volunteer', 'Donations', 'Emergency Response', 'Environment', 'Animals', 'Healthcare', 'Local Events', 'Disaster Relief'];
const CATEGORY_OPTIONS = ['Volunteer', 'Donations', 'Tutoring', 'Community Events', 'Jobs', 'Emergency Response'];

export const Onboarding: React.FC = () => {
  const { currentUser, updateProfile } = useApp();
  const navigate = useNavigate();
  
  const [presetAvatars] = useState(() => {
    const styles = ['adventurer', 'avataaars', 'bottts', 'fun-emoji', 'lorelei', 'shapes'];
    return Array.from({ length: 6 }).map((_, idx) => {
      const randomSeed = Math.random().toString(36).substring(7) + `-${idx}`;
      const style = styles[idx % styles.length];
      return `https://api.dicebear.com/7.x/${style}/svg?seed=${randomSeed}`;
    });
  });

  const [step, setStep] = useState(1);
  const [avatar, setAvatar] = useState(currentUser?.avatar || presetAvatars[0]);
  const [name, setName] = useState(currentUser?.name || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  
  const [selectedSkills, setSelectedSkills] = useState<string[]>(currentUser?.skills || []);
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState('');

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(currentUser?.languages || ['English']);
  
  const [selectedAvailTypes, setSelectedAvailTypes] = useState<string[]>(['Weekends', 'Weekdays']);
  const [customAvailability, setCustomAvailability] = useState('');

  const toggleItem = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleAddCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed]);
      if (!SKILL_OPTIONS.includes(trimmed) && !customSkills.includes(trimmed)) {
        setCustomSkills([...customSkills, trimmed]);
      }
    }
    setCustomSkillInput('');
  };

  const handleAvailToggle = (option: string) => {
    if (option === 'None') {
      setSelectedAvailTypes(['None']);
    } else {
      let updated = selectedAvailTypes.filter(t => t !== 'None');
      if (updated.includes(option)) {
        updated = updated.filter(t => t !== option);
      } else {
        updated.push(option);
      }
      if (updated.length === 0) {
        updated = ['None'];
      }
      setSelectedAvailTypes(updated);
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

    let finalAvailability = 'None';
    if (!selectedAvailTypes.includes('None')) {
      const parts = selectedAvailTypes.filter(t => t !== 'Other');
      if (selectedAvailTypes.includes('Other') && customAvailability.trim()) {
        parts.push(customAvailability.trim());
      }
      finalAvailability = parts.length > 0 ? parts.join(', ') : 'None';
    }

    try {
      await updateProfile({
        name,
        avatar,
        location,
        bio,
        skills: selectedSkills,
        interests: selectedInterests,
        categories: selectedCategories,
        languages: selectedLanguages,
        availability: finalAvailability
      });
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
                  {presetAvatars.map((av, idx) => (
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
            <div>
              <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100">
                What are your skills?
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Select skills you can share with others (e.g. for mentoring, volunteering, or physical tasks).
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[...SKILL_OPTIONS, ...customSkills].map((skill) => (
                <button
                  key={skill}
                  type="button"
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

            {/* Custom Skill Input */}
            <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-850/80 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Add other skills
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a custom skill (e.g. Carpentry, Coding)..."
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomSkill();
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-none focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 text-slate-800 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSkill}
                  className="px-4 py-2 bg-brand-blue-500 hover:bg-brand-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer transition active-scale"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Languages Spoken Dropdown */}
              <div className="text-left">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Languages spoken
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && !selectedLanguages.includes(val)) {
                      setSelectedLanguages([...selectedLanguages, val]);
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-none focus:border-brand-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-brand-blue-500 text-slate-800 dark:text-slate-100 cursor-pointer"
                >
                  <option value="" disabled>Select language...</option>
                  <option value="English">English</option>
                  <option value="Cebuano">Cebuano</option>
                  <option value="Tagalog">Tagalog</option>
                </select>
                {/* Language Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedLanguages.map((lang) => (
                    <span
                      key={lang}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-blue-50 dark:bg-brand-blue-900/20 text-brand-blue-600 dark:text-brand-blue-400 border border-brand-blue-100 dark:border-brand-blue-900/30"
                    >
                      {lang}
                      <button
                        type="button"
                        onClick={() => setSelectedLanguages(selectedLanguages.filter(l => l !== lang))}
                        className="ml-1.5 text-brand-blue-400 hover:text-brand-blue-650 dark:hover:text-brand-blue-300 font-bold focus:outline-none cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* General Availability Custom Chips/Toggles */}
              <div className="text-left">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  General Availability
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Weekdays', 'Weekends', 'Evenings', 'None', 'Other'].map((opt) => {
                    const isSelected = selectedAvailTypes.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleAvailToggle(opt)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer active-scale ${
                          isSelected
                            ? 'bg-brand-green-500 border-brand-green-500 text-white shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {/* Custom Availability Input */}
                {selectedAvailTypes.includes('Other') && (
                  <div className="mt-2.5 animate-scale-in">
                    <input
                      type="text"
                      placeholder="Specify availability (e.g. Fridays 10am-12pm)..."
                      value={customAvailability}
                      onChange={(e) => setCustomAvailability(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-550 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-none focus:border-brand-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-brand-blue-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                )}
              </div>
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
