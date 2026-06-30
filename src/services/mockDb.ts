// Kith Database Service - Live Supabase Client
// Connects to Supabase backend and supplies typescript-compliant interfaces.
import { createClient } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'organization' | 'admin';
  avatar: string;
  location: string;
  bio: string;
  skills: string[];
  interests: string[];
  languages: string[];
  availability: string;
  categories: string[];
  impactScore: number;
  volunteerHours: number;
  itemsDonated: number;
  peopleHelped: number;
  eventsJoined: number;
  badges: { id: string; name: string; icon: string; description: string }[];
  achievements: { id: string; name: string; description: string; date: string }[];
  verified: boolean;
  joinedDate: string;
  savedPosts: string[]; // array of postIds
}

export interface Post {
  id: string;
  userId: string;
  authorName: string;
  authorAvatar: string;
  isOrganization: boolean;
  type: 'need_help' | 'offer_help' | 'donation' | 'volunteer' | 'event' | 'job' | 'emergency' | 'blood';
  category: string;
  title: string;
  description: string;
  location: string;
  distance: string;
  photos: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  saved?: boolean;
  details?: {
    condition?: 'New' | 'Like New' | 'Good' | 'Fair';
    delivery?: 'Pickup Only' | 'Delivery Available';
    reservedBy?: string; // userId if reserved
    completed?: boolean;
    slotsTotal?: number;
    slotsFilled?: number;
    difficulty?: 'Easy' | 'Moderate' | 'Challenging';
    hoursRequired?: number;
    skillsNeeded?: string[];
    date?: string;
    time?: string;
    topic?: string;
    goalAmount?: number;
    currentAmount?: number;
  };
}

export interface VolunteerRegistration {
  id: string;
  postId: string;
  userId: string;
  status: 'registered' | 'completed' | 'cancelled';
  registeredAt: string;
}

export interface MentorProfile {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  role: string;
  bio: string;
  skills: string[];
  languages: string[];
  availability: string;
  rating: number;
  reviewsCount: number;
  experience: string;
}

export interface MentorBooking {
  id: string;
  mentorId: string;
  menteeId: string;
  topic: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface CommunityProject {
  id: string;
  title: string;
  description: string;
  organizer: string;
  goalAmount?: number;
  currentAmount?: number;
  volunteersGoal?: number;
  volunteersJoined: number;
  donationCount: number;
  timeline: { id: string; date: string; title: string; desc: string }[];
  updates: { id: string; date: string; content: string; author: string }[];
  status: 'active' | 'completed';
  coverPhoto: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'read';
  type: 'text' | 'image' | 'location' | 'appointment' | 'donation_status';
  metadata?: any;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: 'donation' | 'volunteer' | 'message' | 'alert' | 'system';
  timestamp: string;
  read: boolean;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  reportedName: string;
  type: 'post' | 'user';
  reason: string;
  contentSnippet: string;
  timestamp: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

// Supabase Connection initialization
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =======================================================
// DB SCHEMA MAPPERS (snake_case database -> camelCase TS)
// =======================================================

const mapProfile = (db: any): UserProfile => {
  if (!db) return null as any;
  return {
    id: db.id,
    email: db.email,
    name: db.name || '',
    role: db.role || 'user',
    avatar: db.avatar || '',
    location: db.location || '',
    bio: db.bio || '',
    skills: db.skills || [],
    interests: db.interests || [],
    languages: db.languages || [],
    availability: db.availability || '',
    categories: db.categories || [],
    impactScore: db.impact_score ?? 50,
    volunteerHours: db.volunteer_hours ?? 0,
    itemsDonated: db.items_donated ?? 0,
    peopleHelped: db.people_helped ?? 0,
    eventsJoined: db.events_joined ?? 0,
    badges: db.badges || [],
    achievements: db.achievements || [],
    verified: db.verified ?? false,
    joinedDate: db.joined_date || '',
    savedPosts: []
  };
};

const mapPost = (db: any): Post => {
  if (!db) return null as any;
  return {
    id: db.id,
    userId: db.user_id,
    authorName: db.profiles?.name || 'Community Member',
    authorAvatar: db.profiles?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg',
    isOrganization: db.profiles?.role === 'organization',
    type: db.type,
    category: db.category,
    title: db.title,
    description: db.description,
    location: db.location,
    distance: '0.5 miles away',
    photos: db.photos || [],
    urgency: db.urgency || 'medium',
    created_at: db.created_at,
    details: db.details || {}
  };
};

const mapMentor = (db: any): MentorProfile => {
  if (!db) return null as any;
  return {
    id: db.id,
    userId: db.user_id,
    name: db.name,
    avatar: db.avatar,
    role: db.role,
    bio: db.bio,
    skills: db.skills || [],
    languages: db.languages || [],
    availability: db.availability,
    rating: Number(db.rating ?? 5.0),
    reviewsCount: db.reviews_count ?? 0,
    experience: db.experience
  };
};

const mapBooking = (db: any): MentorBooking => {
  if (!db) return null as any;
  return {
    id: db.id,
    mentorId: db.mentor_id,
    menteeId: db.mentee_id,
    topic: db.topic,
    date: db.date,
    time: db.time,
    status: db.status,
    notes: db.notes
  };
};

const mapProject = (db: any): CommunityProject => {
  if (!db) return null as any;
  return {
    id: db.id,
    title: db.title,
    description: db.description,
    organizer: db.organizer,
    goalAmount: db.goal_amount ? Number(db.goal_amount) : undefined,
    currentAmount: db.current_amount ? Number(db.current_amount) : 0,
    volunteersGoal: db.volunteers_goal ? Number(db.volunteers_goal) : undefined,
    volunteersJoined: db.volunteers_joined || 0,
    donationCount: db.donation_count || 0,
    timeline: db.timeline || [],
    updates: db.updates || [],
    status: db.status,
    coverPhoto: db.cover_photo
  };
};

const mapMessage = (db: any): Message => {
  if (!db) return null as any;
  return {
    id: db.id,
    senderId: db.sender_id,
    receiverId: db.receiver_id,
    content: db.content,
    timestamp: db.timestamp,
    status: db.status,
    type: db.type,
    metadata: db.metadata
  };
};

const mapNotification = (db: any): AppNotification => {
  if (!db) return null as any;
  return {
    id: db.id,
    userId: db.user_id,
    title: db.title,
    content: db.content,
    type: db.type,
    timestamp: db.timestamp,
    read: db.read
  };
};

const mapReport = (db: any): Report => {
  if (!db) return null as any;
  return {
    id: db.id,
    reporterId: db.reporter_id,
    reportedId: db.reported_id,
    reportedName: db.reported_name,
    type: db.type,
    reason: db.reason,
    contentSnippet: db.content_snippet,
    timestamp: db.timestamp,
    status: db.status
  };
};

// =======================================================
// DB SERVICE METHODS (Replaces mocked localStorage layers)
// =======================================================

export const mockDb = {
  // --- AUTHENTICATION & USERS ---
  async getCurrentUser(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (error || !profile) return null;

    const { data: saved } = await supabase.from('saved_posts').select('post_id').eq('user_id', user.id);
    const savedIds = saved ? saved.map(s => s.post_id) : [];

    const mapped = mapProfile(profile);
    mapped.savedPosts = savedIds;
    return mapped;
  },

  async getUserById(id: string): Promise<UserProfile | null> {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
    if (!profile) return null;

    const { data: saved } = await supabase.from('saved_posts').select('post_id').eq('user_id', id);
    const savedIds = saved ? saved.map(s => s.post_id) : [];

    const mapped = mapProfile(profile);
    mapped.savedPosts = savedIds;
    return mapped;
  },

  async login(email: string, role: 'user' | 'organization' | 'admin' = 'user'): Promise<UserProfile> {
    const password = 'password123';
    
    // Attempt standard login first
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    
    if (signInError) {
      // If user does not exist, sign them up
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: email.split('@')[0],
            role: role
          }
        }
      });
      
      if (signUpError) {
        throw signUpError;
      }
      
      // Complete sign in session
      const { error: signInError2 } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError2) throw signInError2;
    }

    const user = await this.getCurrentUser();
    if (!user) throw new Error('Auth retrieval failed');
    return user;
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  async updateUserProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.skills !== undefined) dbUpdates.skills = updates.skills;
    if (updates.interests !== undefined) dbUpdates.interests = updates.interests;
    if (updates.languages !== undefined) dbUpdates.languages = updates.languages;
    if (updates.availability !== undefined) dbUpdates.availability = updates.availability;
    if (updates.categories !== undefined) dbUpdates.categories = updates.categories;
    if (updates.impactScore !== undefined) dbUpdates.impact_score = updates.impactScore;
    if (updates.volunteerHours !== undefined) dbUpdates.volunteer_hours = updates.volunteerHours;
    if (updates.itemsDonated !== undefined) dbUpdates.items_donated = updates.itemsDonated;
    if (updates.peopleHelped !== undefined) dbUpdates.people_helped = updates.peopleHelped;
    if (updates.eventsJoined !== undefined) dbUpdates.events_joined = updates.eventsJoined;
    if (updates.badges !== undefined) dbUpdates.badges = updates.badges;
    if (updates.achievements !== undefined) dbUpdates.achievements = updates.achievements;
    if (updates.verified !== undefined) dbUpdates.verified = updates.verified;

    const { data, error } = await supabase.from('profiles').update(dbUpdates).eq('id', id).select('*').single();
    if (error) throw error;
    return mapProfile(data);
  },

  async getUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return data.map(mapProfile);
  },

  // --- OPPORTUNITIES (POSTS) ---
  async getPosts(): Promise<Post[]> {
    const { data, error } = await supabase.from('posts').select('*, profiles(*)').order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(mapPost);
  },

  async createPost(postData: Omit<Post, 'id' | 'created_at' | 'userId' | 'authorName' | 'authorAvatar' | 'isOrganization' | 'distance'>): Promise<Post> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) throw new Error('Must be logged in');

    const { data, error } = await supabase.from('posts').insert({
      user_id: currentUser.id,
      type: postData.type,
      category: postData.category,
      title: postData.title,
      description: postData.description,
      location: postData.location,
      photos: postData.photos || [],
      urgency: postData.urgency || 'medium',
      details: postData.details || {}
    }).select('*, profiles(*)').single();

    if (error) throw error;
    return mapPost(data);
  },

  async savePostToggle(postId: string): Promise<boolean> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) throw new Error('Must be logged in');

    const isSaved = currentUser.savedPosts.includes(postId);
    if (isSaved) {
      const { error } = await supabase.from('saved_posts').delete().eq('user_id', currentUser.id).eq('post_id', postId);
      if (error) throw error;
      return false;
    } else {
      const { error } = await supabase.from('saved_posts').insert({ user_id: currentUser.id, post_id: postId });
      if (error) throw error;
      return true;
    }
  },

  async toggleSavePost(postId: string): Promise<boolean> {
    return this.savePostToggle(postId);
  },

  async deletePost(id: string): Promise<void> {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
  },

  async getPostById(id: string): Promise<Post | null> {
    const { data, error } = await supabase.from('posts').select('*, profiles(*)').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return mapPost(data);
  },

  async updatePostDetails(postId: string, detailsUpdates: any): Promise<void> {
    const { data: post, error: fetchErr } = await supabase.from('posts').select('*').eq('id', postId).single();
    if (fetchErr) throw fetchErr;
    const details = { ...(post.details || {}), ...detailsUpdates };
    const { error } = await supabase.from('posts').update({ details }).eq('id', postId);
    if (error) throw error;
  },

  async registerForVolunteerEvent(postId: string): Promise<VolunteerRegistration> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) throw new Error('Must be logged in');

    const { data: post, error: fetchErr } = await supabase.from('posts').select('*').eq('id', postId).single();
    if (fetchErr) throw fetchErr;

    const details = post.details || {};
    const slotsFilled = (details.slotsFilled || 0) + 1;
    details.slotsFilled = slotsFilled;

    const { data: regData, error: regErr } = await supabase.from('volunteer_registrations').insert({
      post_id: postId,
      user_id: currentUser.id
    }).select('*').single();
    if (regErr) throw regErr;

    const { error } = await supabase.from('posts').update({ details }).eq('id', postId);
    if (error) throw error;

    await this.updateUserProfile(currentUser.id, {
      eventsJoined: currentUser.eventsJoined + 1,
      volunteerHours: currentUser.volunteerHours + (details.hoursRequired || 2),
      impactScore: currentUser.impactScore + 150
    });

    return {
      id: regData.id,
      postId: regData.post_id,
      userId: regData.user_id,
      status: regData.status,
      registeredAt: regData.registered_at
    };
  },

  async claimDonation(postId: string): Promise<Post> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) throw new Error('Must be logged in');

    const { data: post, error: fetchErr } = await supabase.from('posts').select('*').eq('id', postId).single();
    if (fetchErr) throw fetchErr;

    const details = post.details || {};
    details.reservedBy = currentUser.id;
    details.completed = true;

    const { data, error } = await supabase.from('posts').update({ details }).eq('id', postId).select('*, profiles(*)').single();
    if (error) throw error;

    // Increment donor item count
    const postOwner = post.user_id;
    const ownerProfile = await this.getUserById(postOwner);
    if (ownerProfile) {
      await this.updateUserProfile(postOwner, {
        itemsDonated: ownerProfile.itemsDonated + 1,
        impactScore: ownerProfile.impactScore + 100
      });
    }

    return mapPost(data);
  },

  async joinVolunteerEvent(postId: string): Promise<Post> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) throw new Error('Must be logged in');

    const { data: post, error: fetchErr } = await supabase.from('posts').select('*').eq('id', postId).single();
    if (fetchErr) throw fetchErr;

    const details = post.details || {};
    const slotsFilled = (details.slotsFilled || 0) + 1;
    details.slotsFilled = slotsFilled;

    // Register user row
    const { error: regErr } = await supabase.from('volunteer_registrations').insert({
      post_id: postId,
      user_id: currentUser.id
    });
    if (regErr) throw regErr;

    const { data, error } = await supabase.from('posts').update({ details }).eq('id', postId).select('*, profiles(*)').single();
    if (error) throw error;

    // Update volunteer profile
    await this.updateUserProfile(currentUser.id, {
      eventsJoined: currentUser.eventsJoined + 1,
      volunteerHours: currentUser.volunteerHours + (details.hoursRequired || 2),
      impactScore: currentUser.impactScore + 150
    });

    return mapPost(data);
  },

  // --- MENTORSHIP ---
  async getMentors(): Promise<MentorProfile[]> {
    const { data, error } = await supabase.from('mentors').select('*');
    if (error) throw error;
    return data.map(mapMentor);
  },

  async bookMentorSession(bookingData: Omit<MentorBooking, 'id' | 'menteeId' | 'status'>): Promise<MentorBooking> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) throw new Error('Must be logged in');

    const { data, error } = await supabase.from('bookings').insert({
      mentor_id: bookingData.mentorId,
      mentee_id: currentUser.id,
      topic: bookingData.topic,
      date: bookingData.date,
      time: bookingData.time,
      status: 'pending',
      notes: bookingData.notes || ''
    }).select('*').single();

    if (error) throw error;

    // Send Notifications
    await this.createNotification({
      userId: currentUser.id,
      title: 'Session Request Sent',
      content: 'Your mentorship booking request is pending confirmation.',
      type: 'system'
    });

    const mentorUser = await this.getUserById(bookingData.mentorId);
    if (mentorUser) {
      await this.createNotification({
        userId: mentorUser.id,
        title: 'New Booking Request',
        content: `${currentUser.name} requested a mentorship session about "${bookingData.topic}".`,
        type: 'system'
      });
    }

    return mapBooking(data);
  },

  async getBookings(): Promise<MentorBooking[]> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) return [];

    const { data, error } = await supabase.from('bookings')
      .select('*')
      .or(`mentor_id.eq.${currentUser.id},mentee_id.eq.${currentUser.id}`);

    if (error) throw error;
    return data.map(mapBooking);
  },

  // --- PROJECTS ---
  async getProjects(): Promise<CommunityProject[]> {
    const { data, error } = await supabase.from('projects').select('*');
    if (error) throw error;
    return data.map(mapProject);
  },

  async supportProjectFinancially(projectId: string, amount: number): Promise<CommunityProject> {
    const { data: project, error: fetchErr } = await supabase.from('projects').select('*').eq('id', projectId).single();
    if (fetchErr) throw fetchErr;

    const current = Number(project.current_amount || 0) + amount;
    const donationCount = (project.donation_count || 0) + 1;

    const { data, error } = await supabase.from('projects').update({
      current_amount: current,
      donation_count: donationCount
    }).eq('id', projectId).select('*').single();

    if (error) throw error;

    const currentUser = await this.getCurrentUser();
    if (currentUser) {
      await this.updateUserProfile(currentUser.id, {
        itemsDonated: currentUser.itemsDonated + 1,
        impactScore: currentUser.impactScore + Math.floor(amount * 2)
      });
    }

    return mapProject(data);
  },

  // --- MESSAGES ---
  async getMessages(): Promise<Message[]> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) return [];

    const { data, error } = await supabase.from('messages')
      .select('*')
      .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data.map(mapMessage);
  },

  async sendMessage(receiverId: string, content: string, type: Message['type'] = 'text', metadata?: any): Promise<Message> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) throw new Error('Must be logged in');

    const { data, error } = await supabase.from('messages').insert({
      sender_id: currentUser.id,
      receiver_id: receiverId,
      content,
      type,
      metadata
    }).select('*').single();

    if (error) throw error;
    return mapMessage(data);
  },

  // --- NOTIFICATIONS ---
  async getNotifications(): Promise<AppNotification[]> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) return [];

    const { data, error } = await supabase.from('notifications')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data.map(mapNotification);
  },

  async createNotification(notifData: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): Promise<AppNotification> {
    const { data, error } = await supabase.from('notifications').insert({
      user_id: notifData.userId,
      title: notifData.title,
      content: notifData.content,
      type: notifData.type,
      read: false
    }).select('*').single();

    if (error) throw error;
    return mapNotification(data);
  },

  async markNotificationAsRead(id: string): Promise<void> {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (error) throw error;
  },

  async markAllNotificationsAsRead(): Promise<void> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) return;

    const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', currentUser.id);
    if (error) throw error;
  },

  // --- ADMIN AND REPORTS ---
  async getReports(): Promise<Report[]> {
    const { data, error } = await supabase.from('reports').select('*');
    if (error) throw error;
    return data.map(mapReport);
  },

  async createReport(reportedId: string, reportedName: string, type: Report['type'], reason: string, contentSnippet: string): Promise<Report> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) throw new Error('Must be logged in');

    const { data, error } = await supabase.from('reports').insert({
      reporter_id: currentUser.id,
      reported_id: reportedId,
      reported_name: reportedName,
      type,
      reason,
      content_snippet: contentSnippet,
      status: 'pending'
    }).select('*').single();

    if (error) throw error;
    return mapReport(data);
  },

  async updateReportStatus(id: string, status: Report['status']): Promise<Report> {
    const { data, error } = await supabase.from('reports').update({ status }).eq('id', id).select('*').single();
    if (error) throw error;
    return mapReport(data);
  }
};
