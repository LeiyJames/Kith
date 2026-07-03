import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  Users, BarChart3, HelpCircle, FileText, Calendar, PlusCircle, 
  ArrowUpRight, Download, Check, X, ShieldAlert 
} from 'lucide-react';

export const OrgDashboard: React.FC = () => {
  const { posts, currentUser, showToast } = useApp();
  const navigate = useNavigate();
  
  // Filter opportunities managed by this organization
  const myCampaigns = posts.filter(p => p.userId === currentUser?.id);

  // Volunteer registrations seed
  const mockVolunteers = [
    { name: 'Elena Chen', email: 'elena@kindlink.org', campaign: 'Food Sorting Friday', status: 'Registered' },
    { name: 'Marcus Sterling', email: 'marcus@gmail.com', campaign: 'Food Sorting Friday', status: 'Checked In' },
    { name: 'Dr. Jane Patel', email: 'j.patel@health.org', campaign: 'Tree Planting Drive', status: 'Registered' },
    { name: 'Chloe Vance', email: 'chloe@vance.net', campaign: 'Food Sorting Friday', status: 'Registered' }
  ];

  const handleExportCSV = () => {
    // Generate CSV representing mock volunteers
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Name,Email,Campaign,Status\n';
    
    mockVolunteers.forEach(v => {
      csvContent += `"${v.name}","${v.email}","${v.campaign}","${v.status}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'volunteer_roster.csv');
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
    showToast('Volunteer roster exported as volunteer_roster.csv successfully!', 'success');
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-855 dark:text-white flex items-center">
            <BarChart3 className="w-6 h-6 text-brand-green-500 mr-2" />
            Kith Console
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Coordinate volunteering slots, campaign statistics, and export rosters.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/create-post')}>
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Volunteers Enrolled', count: '48', desc: '+12 this week', icon: Users, color: 'text-brand-blue-500 bg-brand-blue-50/20' },
          { label: 'Total Hours Provided', count: '192 hrs', desc: 'Average 4 hrs/slot', icon: Calendar, color: 'text-brand-green-500 bg-brand-green-50/20' },
          { label: 'Active Campaigns', count: myCampaigns.length.toString(), desc: '1 emergency alert', icon: BarChart3, color: 'text-brand-amber-500 bg-brand-amber-50/20' },
          { label: 'Pending Approvals', count: '3', desc: 'Volunteer claims', icon: HelpCircle, color: 'text-purple-500 bg-purple-50/20' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="space-y-1">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</span>
                <span className="block text-xl font-bold text-slate-800 dark:text-slate-100">{stat.count}</span>
                <span className="block text-[10px] text-slate-400 font-medium">{stat.desc}</span>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Roster & Pending Coordinator table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Volunteer List */}
        <Card className="lg:col-span-2 p-5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150 font-display">Active Roster</h3>
              <span className="text-[10px] text-slate-400 font-bold">{mockVolunteers.length} members</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                    <th className="py-2">Volunteer</th>
                    <th className="py-2">Campaign</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {mockVolunteers.map((vol, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/20">
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-205">
                        <div className="font-bold">{vol.name}</div>
                        <div className="text-[9px] font-normal text-slate-400">{vol.email}</div>
                      </td>
                      <td className="py-3 text-slate-500 font-medium">{vol.campaign}</td>
                      <td className="py-3">
                        <Badge variant={vol.status === 'Checked In' ? 'success' : 'info'}>{vol.status}</Badge>
                      </td>
                      <td className="py-3 text-right">
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 inline-flex items-center cursor-pointer">
                          <Check className="w-4 h-4 text-brand-green-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Live campaigns coordination list */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">My Active Posts</h3>
          
          {myCampaigns.length === 0 ? (
            <Card className="p-8 text-center bg-slate-50/50 dark:bg-slate-900/50 border border-dashed rounded-2xl flex flex-col items-center justify-center">
              <FileText className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-500">No active posts</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Use the floating action button or dashboard trigger to create one.</p>
            </Card>
          ) : (
            myCampaigns.map((camp) => (
              <Card key={camp.id} className="p-4 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <Badge variant={camp.urgency === 'critical' ? 'emergency' : 'neutral'}>{camp.urgency} urgency</Badge>
                  <span className="text-[9px] text-slate-400 font-bold">{camp.category}</span>
                </div>
                <h4 className="font-bold text-slate-850 dark:text-slate-200 line-clamp-1">{camp.title}</h4>
                
                {camp.details?.slotsTotal !== undefined && (
                  <div className="flex justify-between pt-2 border-t text-[10px] text-slate-500">
                    <span>Enrolled: <strong>{camp.details.slotsFilled} / {camp.details.slotsTotal}</strong></span>
                    <span className="text-brand-blue-500 hover:underline font-bold flex items-center cursor-pointer">
                      Manage <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
