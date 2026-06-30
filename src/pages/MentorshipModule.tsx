import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MentorProfile } from '../services/mockDb';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { BookOpen, Star, Calendar, Languages, Award, Clock, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';

export const MentorshipModule: React.FC = () => {
  const { mentors, requestSession, bookings, currentUser } = useApp();
  
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('06:00 PM');
  const [bookingLoading, setBookingLoading] = useState(false);

  const myBookings = bookings.filter(b => b.menteeId === currentUser?.id);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) return;

    setBookingLoading(true);
    try {
      await requestSession({
        mentorId: selectedMentor.userId, // mentor's user ID
        topic,
        date,
        time
      });
      alert('Mentorship session requested! The mentor has been notified and you will receive a chat confirmation shortly.');
      setSelectedMentor(null);
      setTopic('');
      setDate('');
    } catch (err) {
      console.error(err);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl font-bold font-display text-slate-850 dark:text-white flex items-center">
          <BookOpen className="w-6 h-6 text-brand-blue-500 mr-2" />
          Mentorship & Learning
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Book free 1-on-1 virtual sessions with skilled community mentors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Mentors List Panel */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Available Mentors</h2>
          
          {mentors.map((mentor) => (
            <Card
              key={mentor.id}
              hoverEffect
              className="p-5 border border-slate-100 dark:border-slate-800/80"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-start space-x-3.5">
                  <img
                    src={mentor.avatar}
                    alt={mentor.name}
                    className="w-14 h-14 rounded-2xl object-cover border"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-display flex items-center">
                      {mentor.name}
                      <ShieldCheck className="w-4 h-4 ml-1.5 text-brand-green-500 fill-brand-green-500/10" />
                    </h3>
                    <p className="text-xs font-semibold text-brand-blue-600 dark:text-brand-blue-400 mt-0.5">
                      {mentor.role}
                    </p>
                    <div className="flex items-center space-x-1.5 text-xs text-brand-amber-500 font-bold mt-1.5">
                      <Star className="w-3.5 h-3.5 fill-brand-amber-500" />
                      <span>{mentor.rating}</span>
                      <span className="text-slate-400 font-normal">({mentor.reviewsCount} sessions)</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedMentor(mentor)}
                  className="font-bold cursor-pointer self-stretch sm:self-auto text-xs py-2 px-4 rounded-xl"
                >
                  Book Free Session
                </Button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed italic">
                "{mentor.bio}"
              </p>

              {/* Skills and languages shelf */}
              <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800 flex flex-wrap gap-4 text-xs font-semibold">
                <div className="flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  <div className="flex flex-wrap gap-1">
                    {mentor.skills.map(s => (
                      <Badge key={s} variant="info">{s}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <Languages className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500">Langs:</span>
                  <span className="text-slate-700 dark:text-slate-300">{mentor.languages.join(', ')}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500">Hours:</span>
                  <span className="text-slate-750">{mentor.availability}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* My Bookings Panel Sidebar */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">My Sessions</h2>
          
          {myBookings.length === 0 ? (
            <Card className="p-8 text-center bg-slate-50/50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl flex flex-col items-center justify-center">
              <BookOpen className="w-8 h-8 text-slate-350 mb-2" />
              <p className="text-xs font-semibold text-slate-500">No scheduled sessions</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Click "Book Free Session" to schedule coordinates with a mentor.</p>
            </Card>
          ) : (
            myBookings.map((book) => (
              <Card key={book.id} className="p-4 border border-slate-100 dark:border-slate-800 text-xs text-left space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                    book.status === 'confirmed' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400' 
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/20'
                  }`}>
                    {book.status}
                  </span>
                  <div className="flex items-center space-x-1 text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>{book.date}</span>
                  </div>
                </div>

                <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate">
                  Topic: {book.topic}
                </h4>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  Time: {book.time}
                </p>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* BOOKING MODAL */}
      {selectedMentor && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedMentor(null)} />
          
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl relative text-left">
              <div className="absolute top-0 inset-x-0 h-1 bg-brand-blue-500" />
              
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-150 font-display">Book Mentorship Session</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Booking with {selectedMentor.name}</p>
                </div>
                <button onClick={() => setSelectedMentor(null)} className="p-1 text-slate-400 text-lg hover:text-slate-650 cursor-pointer">×</button>
              </div>

              <form onSubmit={handleBooking} className="space-y-4">
                <Input
                  label="Mentorship Topic / Goal"
                  type="text"
                  placeholder="e.g. Help reviewing python array loops / review resume"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Preferred Date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />

                  <div className="text-left">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Available Slot
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    >
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                      <option value="06:00 PM">06:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl text-[10px] text-slate-500 border leading-relaxed">
                  * Note: KindLink mentorship sessions are completely free of charge. Your mentor will receive your request and message you to send a meeting link.
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="outline" size="sm" type="button" onClick={() => setSelectedMentor(null)}>
                    Cancel
                  </Button>
                  <Button variant="secondary" size="sm" type="submit" disabled={bookingLoading}>
                    {bookingLoading ? 'Requesting...' : (
                      <span className="flex items-center font-bold">
                        Confirm Request <ArrowRight className="w-4 h-4 ml-1.5" />
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
