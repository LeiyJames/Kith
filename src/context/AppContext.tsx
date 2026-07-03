import React, { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { mockDb, supabase, UserProfile, Post, AppNotification, Message, VolunteerRegistration, MentorProfile, MentorBooking, CommunityProject, Report } from '../services/mockDb';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextType {
  currentUser: UserProfile | null;
  notifications: AppNotification[];
  unreadCount: number;
  messages: Message[];
  theme: 'light' | 'dark';
  loading: boolean;
  userRegistrations: string[];
  
  // Toast Operations
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;

  
  // Auth Operations
  loginUser: (email: string, password?: string, role?: 'individual' | 'kith' | 'admin', isSignUp?: boolean) => Promise<UserProfile>;
  logoutUser: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  
  // Post Operations
  posts: Post[];
  refreshPosts: () => Promise<void>;
  addNewPost: (postData: Omit<Post, 'id' | 'created_at' | 'userId' | 'authorName' | 'authorAvatar' | 'isOrganization' | 'distance'>) => Promise<Post>;
  deletePostItem: (id: string) => Promise<void>;
  savePostToggle: (id: string) => Promise<boolean>;
  claimDonation: (postId: string) => Promise<void>;
  joinVolunteerEvent: (postId: string) => Promise<VolunteerRegistration>;
  
  // Mentorship Operations
  mentors: MentorProfile[];
  bookings: MentorBooking[];
  requestSession: (bookingData: Omit<MentorBooking, 'id' | 'menteeId' | 'status'>) => Promise<MentorBooking>;
  
  // Projects Operations
  projects: CommunityProject[];
  donateToProject: (projectId: string, amount: number) => Promise<void>;
  
  // Message Operations
  chatWithUser: (receiverId: string, text: string, type?: Message['type'], metadata?: any) => Promise<Message>;
  refreshMessages: () => Promise<void>;
  markMessagesAsRead: (senderId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  deleteConversation: (partnerId: string) => Promise<void>;
  
  // Notification Operations
  refreshNotifications: () => Promise<void>;
  readNotification: (id: string) => Promise<void>;
  readAllNotifications: () => Promise<void>;
  
  // Reports
  reports: Report[];
  submitReport: (reportedId: string, reportedName: string, type: Report['type'], reason: string, contentSnippet: string) => Promise<Report>;
  resolveReport: (id: string, status: Report['status']) => Promise<void>;
  
  // Theme Toggling
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [bookings, setBookings] = useState<MentorBooking[]>([]);
  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [loading, setLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<string[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const refreshUserRegistrations = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('volunteer_registrations')
        .select('post_id')
        .eq('user_id', userId);
      if (!error && data) {
        setUserRegistrations(data.map((r: any) => r.post_id));
      } else {
        setUserRegistrations([]);
      }
    } catch (err) {
      console.error('Error refreshing registrations:', err);
      setUserRegistrations([]);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Load initial feeds
  useEffect(() => {
    const initApp = async () => {
      try {
        setLoading(true);

        // Load Posts
        const loadedPosts = await mockDb.getPosts();
        setPosts(loadedPosts);

        // Load Mentors
        const loadedMentors = await mockDb.getMentors();
        setMentors(loadedMentors);

        // Load Bookings
        const loadedBookings = await mockDb.getBookings();
        setBookings(loadedBookings);

        // Load Projects
        const loadedProjects = await mockDb.getProjects();
        setProjects(loadedProjects);

        // Load Reports
        const loadedReports = await mockDb.getReports();
        setReports(loadedReports);

        // Load theme from localStorage
        const storedTheme = localStorage.getItem('kith_theme') as 'light' | 'dark';
        if (storedTheme) {
          setTheme(storedTheme);
          if (storedTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  // Listen to auth state changes to update current profile session
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userProfile = await mockDb.getCurrentUser();
        setCurrentUser(userProfile);
        if (userProfile) {
          const notifs = await mockDb.getNotifications();
          setNotifications(notifs);
          const msgs = await mockDb.getMessages();
          setMessages(msgs);
          await refreshUserRegistrations(userProfile.id);
        }
      } else {
        setCurrentUser(null);
        setNotifications([]);
        setMessages([]);
        setUserRegistrations([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sync dark/light mode classes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('kith_theme', theme);
  }, [theme]);

  // Real-time Postgres subscriptions for reactive updates
  useEffect(() => {
    if (!currentUser) return;

    const messagesChannel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, async () => {
        const msgs = await mockDb.getMessages();
        setMessages(msgs);
      })
      .subscribe();

    const notificationsChannel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, async () => {
        const notifs = await mockDb.getNotifications();
        setNotifications(notifs);
      })
      .subscribe();

    const postsChannel = supabase
      .channel('posts-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, async () => {
        const loadedPosts = await mockDb.getPosts();
        setPosts(loadedPosts);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(postsChannel);
    };
  }, [currentUser]);

  // Auth operations
  const loginUser = async (email: string, password?: string, role?: 'individual' | 'kith' | 'admin', isSignUp = false) => {
    setLoading(true);
    const user = await mockDb.login(email, password, role, isSignUp);
    setCurrentUser(user);
    
    const notifs = await mockDb.getNotifications();
    setNotifications(notifs);
    const msgs = await mockDb.getMessages();
    setMessages(msgs);
    await refreshUserRegistrations(user.id);
    
    setLoading(false);
    return user;
  };

  const logoutUser = async () => {
    await mockDb.logout();
    setCurrentUser(null);
    setNotifications([]);
    setMessages([]);
    setUserRegistrations([]);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    let userId = currentUser?.id;
    if (!userId) {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        userId = authUser.id;
      }
    }
    if (!userId) throw new Error('Not logged in');
    
    const updated = await mockDb.updateUserProfile(userId, updates);
    setCurrentUser(updated);
    
    // Sync seeds to reflect changes if profile name/avatar changed
    const allUsers = await mockDb.getUsers();
    saveStoreUsers(allUsers);
    
    return updated;
  };

  const saveStoreUsers = (usersList: UserProfile[]) => {
    localStorage.setItem('kith_users', JSON.stringify(usersList));
  };

  // Post Operations
  const refreshPosts = async () => {
    const loaded = await mockDb.getPosts();
    setPosts(loaded);
  };

  const addNewPost = async (postData: Omit<Post, 'id' | 'created_at' | 'userId' | 'authorName' | 'authorAvatar' | 'isOrganization' | 'distance'>) => {
    const post = await mockDb.createPost(postData);
    await refreshPosts();
    // Refresh user object (since impact score increased)
    if (currentUser) {
      const refreshedUser = await mockDb.getUserById(currentUser.id);
      setCurrentUser(refreshedUser);
    }
    return post;
  };

  const deletePostItem = async (id: string) => {
    await mockDb.deletePost(id);
    await refreshPosts();
  };

  const savePostToggle = async (id: string) => {
    const result = await mockDb.toggleSavePost(id);
    await refreshPosts();
    if (currentUser) {
      const refreshedUser = await mockDb.getUserById(currentUser.id);
      setCurrentUser(refreshedUser);
    }
    return result;
  };

  const claimDonation = async (postId: string) => {
    if (!currentUser) throw new Error('Not logged in');
    
    // Update post to mark as reserved and associate it
    await mockDb.updatePostDetails(postId, {
      reservedBy: currentUser.id,
      completed: true
    });
    
    const post = await mockDb.getPostById(postId);
    
    // Notify creator
    if (post) {
      await mockDb.createNotification({
        userId: post.userId,
        title: 'Donation Accepted',
        content: `${currentUser.name} accepted your donation item: "${post.title}". Contact them to schedule coordinates.`,
        type: 'donation'
      });
      
      // Open instant chat thread
      await chatWithUser(post.userId, `Hi! I would love to accept your donation of: "${post.title}". When is a good time to pick it up?`, 'donation_status');
    }

    await refreshPosts();
    
    // Update user stats
    await updateProfile({
      itemsDonated: currentUser.itemsDonated + 1,
      impactScore: currentUser.impactScore + 30
    });
  };

  const joinVolunteerEvent = async (postId: string) => {
    const reg = await mockDb.registerForVolunteerEvent(postId);
    await refreshPosts();
    if (currentUser) {
      const refreshedUser = await mockDb.getUserById(currentUser.id);
      setCurrentUser(refreshedUser);
      await refreshUserRegistrations(currentUser.id);
    }
    return reg;
  };

  // Mentorship
  const requestSession = async (bookingData: Omit<MentorBooking, 'id' | 'menteeId' | 'status'>) => {
    const booking = await mockDb.bookMentorSession(bookingData);
    const loadedBookings = await mockDb.getBookings();
    setBookings(loadedBookings);
    return booking;
  };

  // Projects
  const donateToProject = async (projectId: string, amount: number) => {
    await mockDb.supportProjectFinancially(projectId, amount);
    const loadedProjects = await mockDb.getProjects();
    setProjects(loadedProjects);
    
    if (currentUser) {
      const refreshedUser = await mockDb.getUserById(currentUser.id);
      setCurrentUser(refreshedUser);
    }
  };

  // Chat
  const chatWithUser = async (receiverId: string, text: string, type: Message['type'] = 'text', metadata?: any) => {
    const msg = await mockDb.sendMessage(receiverId, text, type, metadata);
    const msgs = await mockDb.getMessages();
    setMessages(msgs);
    return msg;
  };

  const refreshMessages = async () => {
    const msgs = await mockDb.getMessages();
    setMessages(msgs);
  };

  const markMessagesAsRead = async (senderId: string) => {
    await mockDb.markMessagesAsRead(senderId);
    await refreshMessages();
  };

  const deleteMessage = async (messageId: string) => {
    await mockDb.deleteMessage(messageId);
    await refreshMessages();
  };

  const deleteConversation = async (partnerId: string) => {
    await mockDb.deleteConversation(partnerId);
    await refreshMessages();
  };

  // Notifications
  const refreshNotifications = async () => {
    const notifs = await mockDb.getNotifications();
    setNotifications(notifs);
  };

  const readNotification = async (id: string) => {
    await mockDb.markNotificationAsRead(id);
    await refreshNotifications();
  };

  const readAllNotifications = async () => {
    await mockDb.markAllNotificationsAsRead();
    await refreshNotifications();
  };

  // Reports
  const submitReport = async (reportedId: string, reportedName: string, type: Report['type'], reason: string, contentSnippet: string) => {
    const rep = await mockDb.createReport(reportedId, reportedName, type, reason, contentSnippet);
    const reps = await mockDb.getReports();
    setReports(reps);
    return rep;
  };

  const resolveReport = async (id: string, status: Report['status']) => {
    await mockDb.updateReportStatus(id, status);
    const reps = await mockDb.getReports();
    setReports(reps);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        notifications,
        unreadCount,
        messages,
        theme,
        loading,
        showToast,
        userRegistrations,
        loginUser,
        logoutUser,
        updateProfile,
        posts,
        refreshPosts,
        addNewPost,
        deletePostItem,
        savePostToggle,
        claimDonation,
        joinVolunteerEvent,
        mentors,
        bookings,
        requestSession,
        projects,
        donateToProject,
        chatWithUser,
        refreshMessages,
        markMessagesAsRead,
        deleteMessage,
        deleteConversation,
        refreshNotifications,
        readNotification,
        readAllNotifications,
        reports,
        submitReport,
        resolveReport,
        toggleTheme
      }}
    >
      {children}
      {/* Toast Notification Container - Upper Center of Screen */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4">
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
          />
        ))}
      </div>
    </AppContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onClose: () => void }> = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-brand-green-500 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-brand-blue-500 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-brand-amber-500 flex-shrink-0" />
  };

  const borders = {
    success: 'border-brand-green-500/20 dark:border-brand-green-500/10',
    error: 'border-red-500/20 dark:border-red-500/10',
    info: 'border-brand-blue-500/20 dark:border-brand-blue-500/10',
    warning: 'border-brand-amber-500/20 dark:border-brand-amber-500/10'
  };

  return (
    <div
      className={`animate-toast-in pointer-events-auto flex items-center gap-3 w-full max-w-sm px-4 py-3 rounded-2xl border bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg ${borders[toast.type]} transition-all duration-300`}
      role="alert"
    >
      {icons[toast.type]}
      <div className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-100 text-left leading-snug">
        {toast.message}
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
