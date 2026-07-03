import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Settings as SettingsIcon, Shield, Bell, Languages, Eye, Moon, Sun, Trash2, Link, AlertTriangle } from 'lucide-react';
import { supabase } from '../services/mockDb';

export const Settings: React.FC = () => {
  const { theme, toggleTheme, currentUser, updateProfile, logoutUser, showToast } = useApp();
  const navigate = useNavigate();
  
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [privacyPublic, setPrivacyPublic] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ name, email, location });
      showToast('Settings updated successfully!', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      setIsDeleteModalOpen(false);
      if (currentUser) {
        // Delete profile row (cascades database-wide)
        const { error } = await supabase.from('profiles').delete().eq('id', currentUser.id);
        if (error) throw error;
      }
      await logoutUser();
      showToast('Your account has been deleted successfully.', 'info');
      navigate('/landing');
    } catch (err) {
      console.error("Delete account failed:", err);
      showToast("Failed to delete account. Please try again.", "error");
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl font-bold font-display text-slate-850 dark:text-white flex items-center">
          <SettingsIcon className="w-6 h-6 text-brand-blue-500 mr-2" />
          Settings Console
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure notification alerts, profile data, privacy visibility, and dark mode.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile details */}
        <Card className="md:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150 font-display pb-2 border-b mb-4 flex items-center">
            <Shield className="w-4 h-4 text-brand-blue-500 mr-2" />
            Profile Parameters
          </h3>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Input
              label="Location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="secondary" size="sm" className="font-bold">
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Quick Settings Sidebar */}
        <div className="space-y-6">
          
          {/* Preferences */}
          <Card className="p-5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150 font-display pb-2 border-b">Preferences</h3>
            
            {/* Theme selector */}
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500 flex items-center">
                {theme === 'light' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2 text-brand-amber-500" />}
                Dark Mode
              </span>
              <button
                onClick={toggleTheme}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
                  theme === 'dark' ? 'bg-brand-blue-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    theme === 'dark' ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>

            {/* Notification triggers */}
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500 flex items-center">
                <Bell className="w-4 h-4 mr-2" />
                Email Alerts
              </span>
              <button
                onClick={() => setNotifEmail(!notifEmail)}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
                  notifEmail ? 'bg-brand-green-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    notifEmail ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>

            {/* Privacy toggle */}
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500 flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                Public Directory
              </span>
              <button
                onClick={() => setPrivacyPublic(!privacyPublic)}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
                  privacyPublic ? 'bg-brand-green-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    privacyPublic ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
          </Card>

          {/* Delete Account */}
          <Card className="p-5 border border-red-100 dark:border-red-950/20 bg-red-50/5 dark:bg-red-950/5 space-y-3">
            <h4 className="text-xs font-bold text-red-650 flex items-center">
              <Trash2 className="w-4 h-4 mr-1.5" />
              Danger Zone
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Once you delete your account, all volunteer registrations, posts, and details are lost.
            </p>
            <Button variant="danger" size="sm" fullWidth onClick={handleDelete} className="text-xs py-2">
              Delete Account
            </Button>
          </Card>
        </div>
      </div>
      
      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-950/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Delete your Kith account?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This action is permanent and cannot be undone. All your posts, registrations, mentorships, and messages will be permanently deleted from the database.
              </p>
            </div>
            
            <div className="flex space-x-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-xs py-2.5 font-bold cursor-pointer"
              >
                Cancel, Keep Account
              </Button>
              <Button
                variant="danger"
                size="sm"
                fullWidth
                onClick={confirmDeleteAccount}
                className="text-xs py-2.5 font-bold cursor-pointer"
              >
                Yes, Delete Account
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
