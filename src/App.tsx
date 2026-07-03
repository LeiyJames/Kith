import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';

// Pages
import { LandingPage } from './pages/LandingPage';
import { Auth } from './pages/Auth';
import { Onboarding } from './pages/Onboarding';
import { HomeFeed } from './pages/HomeFeed';
import { Search } from './pages/Search';
import { DonationModule } from './pages/DonationModule';
import { VolunteerModule } from './pages/VolunteerModule';
import { MentorshipModule } from './pages/MentorshipModule';
import { CommunityProjects } from './pages/CommunityProjects';
import { Messaging } from './pages/Messaging';
import { EmergencyMode } from './pages/EmergencyMode';
import { OrgDashboard } from './pages/OrgDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserProfile } from './pages/UserProfile';
import { Settings } from './pages/Settings';
import { CreatePost } from './pages/CreatePost';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Authentication routes */}
          <Route path="/" element={<Navigate to="/landing" replace />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Core App Shell routes */}
          <Route
            path="/feed"
            element={
              <AppShell>
                <HomeFeed />
              </AppShell>
            }
          />
          <Route
            path="/search"
            element={
              <AppShell>
                <Search />
              </AppShell>
            }
          />
          <Route
            path="/donations"
            element={
              <AppShell>
                <DonationModule />
              </AppShell>
            }
          />
          <Route
            path="/volunteer"
            element={
              <AppShell>
                <VolunteerModule />
              </AppShell>
            }
          />
          <Route
            path="/mentorship"
            element={
              <AppShell>
                <MentorshipModule />
              </AppShell>
            }
          />
          <Route
            path="/projects"
            element={
              <AppShell>
                <CommunityProjects />
              </AppShell>
            }
          />
          <Route
            path="/chat"
            element={
              <AppShell>
                <Messaging />
              </AppShell>
            }
          />
          <Route
            path="/emergency"
            element={
              <AppShell>
                <EmergencyMode />
              </AppShell>
            }
          />
          <Route
            path="/org-dashboard"
            element={
              <AppShell>
                <OrgDashboard />
              </AppShell>
            }
          />
          <Route
            path="/admin"
            element={
              <AppShell>
                <AdminDashboard />
              </AppShell>
            }
          />
          <Route
            path="/profile"
            element={
              <AppShell>
                <UserProfile />
              </AppShell>
            }
          />
          <Route
            path="/settings"
            element={
              <AppShell>
                <Settings />
              </AppShell>
            }
          />
          <Route
            path="/create-post"
            element={
              <AppShell>
                <CreatePost />
              </AppShell>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/landing" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
