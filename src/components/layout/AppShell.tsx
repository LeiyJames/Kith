import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  Home, Search, PlusCircle, MessageSquare, Heart, Gift, Award, 
  Settings, Bell, Moon, Sun, LogOut, Menu, X, Shield, Activity, 
  MapPin, BookOpen, LayoutDashboard, AlertTriangle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import kithLogo from '../../assets/kithlogo.png';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    currentUser, notifications, unreadCount, logoutUser, 
    theme, toggleTheme, readNotification, readAllNotifications 
  } = useApp();
  
  const navigate = useNavigate();
  const location = useLocation();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleNav = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { name: 'Feed', path: '/feed', icon: Home },
    { name: 'Search & Map', path: '/search', icon: Search },
    { name: 'Donations', path: '/donations', icon: Gift },
    { name: 'Volunteer', path: '/volunteer', icon: Heart },
    { name: 'Mentorship', path: '/mentorship', icon: BookOpen },
    { name: 'Projects', path: '/projects', icon: Award },
    { name: 'Chat', path: '/chat', icon: MessageSquare, countKey: 'messages' },
    { name: 'Emergency', path: '/emergency', icon: AlertTriangle, urgent: true },
  ];

  const orgItems = [
    { name: 'Org Dashboard', path: '/org-dashboard', icon: LayoutDashboard },
  ];

  const adminItems = [
    { name: 'Admin Console', path: '/admin', icon: Shield },
  ];

  return (
    <div className={`min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-200`}>
      
      {/* 1. DESKTOP SIDEBAR NAVIGATION */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800/80 z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-50 dark:border-slate-800/50 cursor-pointer" onClick={() => navigate('/feed')}>
          <img src={kithLogo} alt="Kith Logo" className="w-8 h-8 object-contain mr-2.5" />
          <span className="text-xl font-bold font-display bg-gradient-to-r from-brand-blue-500 to-brand-green-500 bg-clip-text text-transparent">
            Kith
          </span>
        </div>

        <div className="flex-1 py-6 px-4 overflow-y-auto space-y-7">
          {/* Main Navigation */}
          <div>
            <span className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Explore
            </span>
            <nav className="mt-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isActive(item.path)
                        ? 'bg-brand-blue-50 dark:bg-brand-blue-900/10 text-brand-blue-600 dark:text-brand-blue-400 font-semibold'
                        : item.urgent
                          ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive(item.path) ? 'text-brand-blue-500' : item.urgent ? 'text-red-500 animate-pulse' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{item.name}</span>
                    {item.urgent && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Org Dashboard (Condition-based) */}
          {currentUser && (currentUser.role === 'organization' || currentUser.role === 'admin') && (
            <div>
              <span className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Management
              </span>
              <nav className="mt-2 space-y-1">
                {orgItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNav(item.path)}
                      className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                        isActive(item.path)
                          ? 'bg-brand-green-50 dark:bg-brand-green-900/10 text-brand-green-600 dark:text-brand-green-400 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mr-3 ${isActive(item.path) ? 'text-brand-green-500' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Admin Dashboard */}
          {currentUser && currentUser.role === 'admin' && (
            <div>
              <span className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                System
              </span>
              <nav className="mt-2 space-y-1">
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNav(item.path)}
                      className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                        isActive(item.path)
                          ? 'bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mr-3 ${isActive(item.path) ? 'text-purple-500' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* User profile bottom footer inside sidebar */}
        {currentUser && (
          <div className="p-4 border-t border-slate-50 dark:border-slate-800/50 flex flex-col space-y-2.5">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/profile')}>
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm"
              />
              <div className="text-left overflow-hidden">
                <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">
                  {currentUser.name}
                </p>
                <div className="flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-brand-green-500" />
                  <span className="text-xs font-semibold text-brand-green-600 dark:text-brand-green-400">
                    {currentUser.impactScore} pts
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-1">
              <Button variant="ghost" size="sm" onClick={toggleTheme} className="p-2 min-w-0">
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-brand-amber-500" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="p-2 min-w-0">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={logoutUser} className="p-2 min-w-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </aside>

      {/* 2. MAIN LAYOUT AND HEADER CONTAINER */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen">
        
        {/* TOP BAR HEADER */}
        <header className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/60 h-16 flex items-center justify-between px-4 md:px-8 z-10">
          <div className="flex items-center md:hidden">
            <img src={kithLogo} alt="Kith Logo" className="w-7 h-7 object-contain mr-2" />
            <span className="text-lg font-bold font-display bg-gradient-to-r from-brand-blue-500 to-brand-green-500 bg-clip-text text-transparent cursor-pointer" onClick={() => navigate('/feed')}>
              Kith
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-brand-blue-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Showing opportunities in <strong className="text-slate-700 dark:text-slate-300">{currentUser?.location || 'Downtown District'}</strong>
            </span>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center space-x-2">
            {/* Create Post FAB trigger */}
            <Button
              onClick={() => navigate('/create-post')}
              variant="primary"
              size="sm"
              className="hidden sm:inline-flex rounded-xl font-semibold cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Opportunity
            </Button>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Mobile Burger Menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl md:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* MAIN ROUTE CONTENT */}
        <main className="flex-1 p-4 md:p-8 safe-padding-bottom overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>

        {/* 3. MOBILE BOTTOM NAVIGATION */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800/80 flex justify-around items-center h-16 px-2 z-20 shadow-lg">
          {navItems.filter(item => ['Feed', 'Search & Map', 'Donations', 'Volunteer', 'Chat'].includes(item.name)).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition cursor-pointer ${
                  active ? 'text-brand-blue-500' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="w-5.5 h-5.5" />
                <span className="text-[10px] mt-0.5 font-medium">{item.name === 'Search & Map' ? 'Map' : item.name}</span>
              </button>
            );
          })}
          
          <button
            onClick={() => handleNav('/profile')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition cursor-pointer ${
              isActive('/profile') ? 'text-brand-blue-500' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <img 
              src={currentUser?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg'} 
              alt="Profile" 
              className={`w-5.5 h-5.5 rounded-full border ${isActive('/profile') ? 'border-brand-blue-500' : 'border-slate-200'}`} 
            />
            <span className="text-[10px] mt-0.5 font-medium">Profile</span>
          </button>
        </nav>
      </div>

      {/* 4. NOTIFICATION CENTER DRAWER */}
      {isNotifOpen && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setIsNotifOpen(false)} />

          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-xl flex flex-col">
              <div className="px-6 py-5 border-b border-slate-50 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex items-center space-x-2.5">
                  <Bell className="w-5 h-5 text-brand-blue-500" />
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Notification Center</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={readAllNotifications} className="text-xs">
                    Mark all read
                  </Button>
                  <button onClick={() => setIsNotifOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Notification Lists */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">All caught up!</p>
                    <p className="text-xs text-slate-400 mt-1">No new notifications at this time.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => readNotification(notif.id)}
                      className={`p-4 rounded-xl border transition-all text-left cursor-pointer ${
                        notif.read
                          ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 opacity-70'
                          : 'bg-brand-blue-50/30 dark:bg-brand-blue-900/5 border-brand-blue-100/50 dark:border-brand-blue-800/30 hover:bg-brand-blue-50/50 dark:hover:bg-brand-blue-900/10'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          notif.type === 'volunteer' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400' 
                            : notif.type === 'donation'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                              : notif.type === 'message'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {notif.type}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2">
                        {notif.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {notif.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MOBILE DRAWER MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-64 bg-white dark:bg-slate-900 shadow-xl flex flex-col p-6 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold font-display bg-gradient-to-r from-brand-blue-500 to-brand-green-500 bg-clip-text text-transparent">
                Kith Menus
              </span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <nav className="flex-1 space-y-1.5 text-left">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                      isActive(item.path)
                        ? 'bg-brand-blue-50 dark:bg-brand-blue-900/10 text-brand-blue-600 dark:text-brand-blue-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive(item.path) ? 'text-brand-blue-500' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{item.name}</span>
                  </button>
                );
              })}

              {currentUser && (currentUser.role === 'organization' || currentUser.role === 'admin') && (
                <>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />
                  {orgItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNav(item.path)}
                        className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                          isActive(item.path)
                            ? 'bg-brand-green-50 dark:bg-brand-green-900/10 text-brand-green-600 dark:text-brand-green-400 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mr-3 ${isActive(item.path) ? 'text-brand-green-500' : 'text-slate-400 dark:text-slate-500'}`} />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </>
              )}

              {currentUser && currentUser.role === 'admin' && (
                <>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />
                  {adminItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNav(item.path)}
                        className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                          isActive(item.path)
                            ? 'bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mr-3 ${isActive(item.path) ? 'text-purple-500' : 'text-slate-400 dark:text-slate-500'}`} />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </>
              )}
            </nav>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around">
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-brand-amber-500" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleNav('/settings')}>
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={logoutUser} className="text-red-500">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
