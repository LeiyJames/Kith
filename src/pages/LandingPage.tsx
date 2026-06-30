import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  Heart, Gift, Users, Award, ShieldCheck, ArrowRight, 
  ChevronRight, Smile, MapPin, AlertTriangle, Play 
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const statistics = [
    { label: 'Deeds Completed', count: '14,820', icon: Heart, color: 'text-red-500 bg-red-50/20' },
    { label: 'Active Volunteers', count: '2,450', icon: Users, color: 'text-brand-green-500 bg-brand-green-50/20' },
    { label: 'Donated Items', count: '8,900', icon: Gift, color: 'text-brand-amber-500 bg-brand-amber-50/20' },
    { label: 'NGO Partners', count: '124', icon: Award, color: 'text-brand-blue-500 bg-brand-blue-50/20' },
  ];

  const partners = [
    { name: 'Red Cross City', logo: 'https://cdn-icons-png.flaticon.com/512/3771/3771518.png' },
    { name: 'City Green Foundation', logo: 'https://cdn-icons-png.flaticon.com/512/3771/3771518.png' },
    { name: 'Youth Mentors Coalition', logo: 'https://cdn-icons-png.flaticon.com/512/3771/3771518.png' },
    { name: 'Food Harvest Shelter', logo: 'https://cdn-icons-png.flaticon.com/512/3771/3771518.png' }
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 min-h-screen text-left">
      
      {/* 1. Header logo */}
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg bg-brand-blue-500 flex items-center justify-center text-white font-extrabold text-lg mr-2 shadow-md">
            K
          </div>
          <span className="text-xl font-bold font-display bg-gradient-to-r from-brand-blue-500 to-brand-green-500 bg-clip-text text-transparent">
            Kith
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/auth')} className="font-semibold bg-white dark:bg-slate-900 border-slate-200">
          Sign In
        </Button>
      </header>

      {/* 2. Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <Badge variant="info" className="px-3 py-1 font-bold text-xs uppercase tracking-wide">
            A positive community network
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-extrabold font-display leading-tight text-slate-850 dark:text-white">
            Helping Communities,<br />One Good Deed at a Time.
          </h1>
          
          <p className="text-sm text-slate-550 dark:text-slate-400 leading-relaxed max-w-lg">
            Donate items, volunteer, mentor, request help, and build stronger neighborhoods. Unlike traditional social networks, our feed focuses entirely on real community impact.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button variant="primary" size="lg" onClick={() => navigate('/auth')}>
              Get Started <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/feed')} className="bg-white dark:bg-slate-900 font-bold border-slate-200">
              Explore Feed
            </Button>
          </div>
        </div>

        {/* Hero image showcase */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue-500/10 to-brand-green-500/20 dark:from-brand-blue-500/5 dark:to-brand-green-500/5 rounded-3xl transform rotate-3" />
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600"
            alt="Community impact collaboration"
            className="w-full h-80 object-cover rounded-3xl border border-slate-200/50 shadow-lg relative z-10 hover-scale"
          />
        </div>
      </section>

      {/* 3. Community Stats */}
      <section className="bg-white dark:bg-slate-900 py-12 border-y border-slate-100 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {statistics.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="flex items-center space-x-3.5">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-2xl font-bold font-display text-slate-850 dark:text-white leading-none">
                    {stat.count}
                  </span>
                  <span className="block text-xs text-slate-400 font-semibold mt-1">
                    {stat.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. How it Works */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 space-y-12">
        <div className="text-center max-w-lg mx-auto space-y-3">
          <h2 className="text-2xl font-bold font-display text-slate-850 dark:text-white">How Kith Works</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Four simple paths to connecting and improving your city.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Find Opportunities', desc: 'Browse volunteer drives, donations, and local tutor requests nearby.', label: 'Search & Map' },
            { step: '2', title: 'Participate & Donate', desc: 'Claim unwanted electronics, sort fresh foods, or give online feedback.', label: 'Take Action' },
            { step: '3', title: 'Share & Coordinate', desc: 'Message members in real-time. Schedule pickup locations or meetings.', label: 'Chat Portal' },
            { step: '4', title: 'Earn Impact Score', desc: 'Gain badges for helping. Follow your contribution history calendar.', label: 'Level Up' }
          ].map((item, idx) => (
            <Card key={idx} className="p-5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between h-56 hover-scale">
              <span className="w-8 h-8 rounded-full bg-brand-blue-500/10 text-brand-blue-600 dark:text-brand-blue-400 font-bold flex items-center justify-center text-sm shadow-inner">
                {item.step}
              </span>
              <div className="space-y-1.5 mt-4">
                <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200">{item.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed">{item.desc}</p>
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-2 block">{item.label}</span>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. Featured Volunteer Projects */}
      <section className="bg-slate-100/50 dark:bg-slate-950/20 py-16 md:py-24 border-t">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-display text-slate-850 dark:text-white">Active Volunteer Drives</h2>
              <p className="text-xs text-slate-500">Urgent opportunities in need of hands today.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/feed')} className="bg-white dark:bg-slate-900 border-slate-200 font-semibold">
              Explore Active Board
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Tree Planting Restoration', org: 'Greenwood Park Alliance', desc: 'Planting native saplings in Central Sector C. Refreshments and tools supplied.', date: 'July 4th, 2026', img: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=500' },
              { title: 'Food Packing volunteers', org: 'City Harvest Food Bank', desc: 'Sort donated produce and package them into family supply crates.', date: 'July 3rd, 2026', img: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500' }
            ].map((proj, idx) => (
              <Card key={idx} className="overflow-hidden border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row h-52 hover:shadow-md transition">
                <img src={proj.img} alt={proj.title} className="w-full sm:w-40 h-32 sm:h-full object-cover" />
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold">{proj.org}</span>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{proj.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{proj.desc}</p>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-3 border-t">
                    <span>Date: {proj.date}</span>
                    <span className="text-brand-blue-500 font-bold flex items-center cursor-pointer" onClick={() => navigate('/auth')}>
                      Join Drive <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Success Story / Testimonial */}
      <section className="max-w-4xl mx-auto px-6 py-16 md:py-24 text-center space-y-6">
        <div className="w-12 h-12 rounded-full bg-brand-green-500/10 flex items-center justify-center mx-auto">
          <Smile className="w-6 h-6 text-brand-green-500" />
        </div>
        
        <blockquote className="text-lg md:text-xl font-medium font-display text-slate-750 dark:text-slate-200 italic leading-relaxed">
          "Using Kith, I was able to donate my old coding laptop to a local high school student in less than 24 hours. The messaging was immediate, and coordinating pickup at the library was incredibly simple."
        </blockquote>
        
        <div>
          <cite className="not-italic font-bold text-slate-850 dark:text-white block text-sm">Elena Chen</cite>
          <span className="text-xs text-slate-400">Software Engineer & Kith Helper</span>
        </div>
      </section>

      {/* 7. Partner Organizations */}
      <section className="bg-slate-100/50 dark:bg-slate-900/40 py-12 border-t text-center">
        <div className="max-w-6xl mx-auto px-6 space-y-6">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Partnered with Local Charities
          </span>
          <div className="flex flex-wrap justify-center items-center gap-10 opacity-70">
            {partners.map((part, idx) => (
              <div key={idx} className="flex items-center space-x-2 grayscale hover:grayscale-0 transition cursor-pointer">
                <img src={part.logo} alt={part.name} className="w-5 h-5 rounded" />
                <span className="text-xs font-bold text-slate-500">{part.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-850 text-xs">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center text-white">
              <div className="w-6 h-6 rounded bg-brand-blue-500 flex items-center justify-center text-white font-extrabold text-sm mr-2 shadow">
                K
              </div>
              <span className="text-base font-bold font-display">Kith</span>
            </div>
            <p className="leading-relaxed opacity-85">
              Connecting local community members for donations, volunteering, and mutual support.
            </p>
          </div>

          <div className="space-y-2 text-left">
            <h4 className="font-bold text-white text-xs">Quick Links</h4>
            <ul className="space-y-1.5 opacity-85">
              <li><button onClick={() => navigate('/feed')} className="hover:underline hover:text-white cursor-pointer">Explore Opportunity Feed</button></li>
              <li><button onClick={() => navigate('/auth')} className="hover:underline hover:text-white cursor-pointer">Register Account</button></li>
              <li><button onClick={() => navigate('/emergency')} className="hover:underline hover:text-white cursor-pointer text-red-400">Emergency Center</button></li>
            </ul>
          </div>

          <div className="space-y-1.5 text-left opacity-85">
            <h4 className="font-bold text-white text-xs">Platform Policy</h4>
            <p>100% free of charge. No advertising, no monetization of private data. Dedicated to local neighborhoods.</p>
            <p className="text-[10px] text-slate-500 pt-2">© 2026 Kith. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
