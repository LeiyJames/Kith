import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CommunityProject } from '../services/mockDb';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Award, Users, DollarSign, Calendar, RefreshCw, PlusCircle, ArrowRight } from 'lucide-react';

export const CommunityProjects: React.FC = () => {
  const { projects, donateToProject, showToast } = useApp();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<CommunityProject | null>(null);
  const [donateAmount, setDonateAmount] = useState('25');
  const [isDonating, setIsDonating] = useState(false);

  const handleDonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    const amountVal = parseFloat(donateAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      showToast('Please enter a valid amount.', 'warning');
      return;
    }

    setIsDonating(true);
    try {
      await donateToProject(selectedProject.id, amountVal);
      showToast(`Thank you for donating $${amountVal} to "${selectedProject.title}"! Your impact score has increased.`, 'success');
      setSelectedProject(null);
      setDonateAmount('25');
    } catch (err) {
      console.error(err);
    } finally {
      setIsDonating(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl font-bold font-display text-slate-850 dark:text-white flex items-center">
          <Award className="w-6 h-6 text-brand-blue-500 mr-2" />
          Community Projects
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Join forces with local organizations to fund and construct impactful community initiatives.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => {
          const goalAmount = project.goalAmount || 1;
          const currentAmount = project.currentAmount || 0;
          const financialProgress = Math.min((currentAmount / goalAmount) * 100, 100);
          
          const volunteersGoal = project.volunteersGoal || 1;
          const volunteerProgress = Math.min((project.volunteersJoined / volunteersGoal) * 100, 100);

          return (
            <Card
              key={project.id}
              hoverEffect
              className="overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <img src={project.coverPhoto} alt={project.title} className="w-full h-44 object-cover" />
                
                <div className="p-5 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-base font-bold text-slate-850 dark:text-slate-150 font-display">
                        {project.title}
                      </h3>
                      <Badge variant={project.status === 'active' ? 'info' : 'success'}>
                        {project.status}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">Organizer: {project.organizer}</span>
                  </div>

                  <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {project.description}
                  </p>

                  {/* Financial Goal Progress Bar */}
                  {project.goalAmount && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-400 flex items-center"><DollarSign className="w-3.5 h-3.5 mr-0.5 text-brand-amber-500" /> Raised</span>
                        <span className="text-slate-700 dark:text-slate-300">
                          ${project.currentAmount} / ${project.goalAmount} ({Math.round(financialProgress)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-amber-500 rounded-full" style={{ width: `${financialProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Volunteer Goal Progress Bar */}
                  {project.volunteersGoal && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-400 flex items-center"><Users className="w-3.5 h-3.5 mr-1 text-brand-green-500" /> Volunteers Joined</span>
                        <span className="text-slate-700 dark:text-slate-300">
                          {project.volunteersJoined} / {project.volunteersGoal} ({Math.round(volunteerProgress)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-green-500 rounded-full" style={{ width: `${volunteerProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Timeline updates summary if available */}
                  {project.timeline && project.timeline.length > 0 && (
                    <div className="pt-3 border-t border-slate-50 dark:border-slate-800 text-xs">
                      <strong className="text-slate-400 uppercase tracking-wider text-[9px] block mb-2">Upcoming Milestone</strong>
                      <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 font-medium">
                        <Calendar className="w-4 h-4 text-brand-blue-500" />
                        <span className="font-bold">{project.timeline[project.timeline.length - 1].title}</span>
                        <span>•</span>
                        <span>{project.timeline[project.timeline.length - 1].date}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {project.status === 'active' && (
                <div className="p-5 pt-0 flex gap-2">
                  <Button variant="outline" size="sm" fullWidth onClick={() => navigate('/feed')}>
                    Join Volunteering
                  </Button>
                  <Button variant="secondary" size="sm" fullWidth onClick={() => setSelectedProject(project)}>
                    Support Project
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* DONATE MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedProject(null)} />
          
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl relative text-left">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-amber-500" />
              
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-150 font-display">Support Financial Campaign</h3>
                  <p className="text-xs text-slate-450 mt-0.5">Contributing to {selectedProject.title}</p>
                </div>
                <button onClick={() => setSelectedProject(null)} className="p-1 text-slate-400 text-lg hover:text-slate-650 cursor-pointer">×</button>
              </div>

              <form onSubmit={handleDonateSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-2">Select Donation Amount</label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {['10', '25', '50', '100'].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setDonateAmount(val)}
                        className={`py-2 rounded-xl border text-xs font-bold text-center transition cursor-pointer active-scale ${
                          donateAmount === val
                            ? 'border-brand-amber-500 bg-brand-amber-50/20 text-brand-amber-600'
                            : 'border-slate-150 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        ${val}
                      </button>
                    ))}
                  </div>
                  
                  <Input
                    type="number"
                    placeholder="Other amount"
                    value={donateAmount}
                    onChange={(e) => setDonateAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-850 border p-3 rounded-xl text-[10px] text-slate-500">
                  * Note: All donations are processed as mock transactions for demonstration. 100% of simulated proceeds go to the Greenwood Gardens.
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="outline" size="sm" type="button" onClick={() => setSelectedProject(null)}>
                    Cancel
                  </Button>
                  <Button variant="warning" size="sm" type="submit" disabled={isDonating}>
                    {isDonating ? 'Contributing...' : (
                      <span className="flex items-center font-bold">
                        Confirm Contribution <ArrowRight className="w-4 h-4 ml-1.5" />
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
