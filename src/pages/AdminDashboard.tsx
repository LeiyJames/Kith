import React from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Shield, Users, FileText, AlertOctagon, Check, X, Ban } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { reports, resolveReport } = useApp();

  const handleAction = async (id: string, action: 'resolved' | 'dismissed') => {
    try {
      await resolveReport(id, action);
      alert(`Report marked as ${action}! Moderation queue updated.`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl font-bold font-display text-slate-850 dark:text-white flex items-center">
          <Shield className="w-6 h-6 text-purple-600 mr-2" />
          Admin Moderation Console
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Moderate user reports, review campaign listings, and manage verification badges.
        </p>
      </div>

      {/* Grid stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Accounts', count: '1,280', desc: '+15 today', icon: Users },
          { label: 'Reported Flags', count: reports.filter(r => r.status === 'pending').length.toString(), desc: 'Needs review', icon: AlertOctagon },
          { label: 'Featured Campaigns', count: '2', desc: 'Main home slider', icon: FileText },
          { label: 'Verification Requests', count: '8', desc: 'NGO validations', icon: Shield },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="space-y-1">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</span>
                <span className="block text-xl font-bold text-slate-800 dark:text-slate-100">{stat.count}</span>
                <span className="block text-[9px] text-slate-400">{stat.desc}</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-purple-600 flex items-center justify-center">
                <Icon className="w-4 h-4" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Moderation table */}
      <Card className="p-5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
        <div>
          <div className="pb-3 border-b mb-4 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150 font-display">Moderation Queue</h3>
            <span className="text-[10px] text-slate-400 font-bold">Pending user flags</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b text-slate-400 font-bold">
                  <th className="py-2">Reported Item</th>
                  <th className="py-2">Reason</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/20">
                    <td className="py-3 font-semibold text-slate-850 dark:text-slate-200">
                      <div className="font-bold">{rep.reportedName}</div>
                      <div className="text-[9px] text-slate-400 truncate max-w-40 font-normal">"{rep.contentSnippet}"</div>
                    </td>
                    <td className="py-3 text-slate-500 font-medium">{rep.reason}</td>
                    <td className="py-3">
                      <Badge variant={rep.status === 'pending' ? 'warning' : 'success'}>{rep.status}</Badge>
                    </td>
                    <td className="py-3 text-right">
                      {rep.status === 'pending' ? (
                        <div className="flex justify-end space-x-1.5">
                          <button
                            onClick={() => handleAction(rep.id, 'resolved')}
                            className="p-1.5 bg-brand-green-50 text-brand-green-600 rounded-lg hover:bg-brand-green-100 cursor-pointer"
                            title="Confirm report and take action"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleAction(rep.id, 'dismissed')}
                            className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 cursor-pointer"
                            title="Dismiss report / mark safe"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium italic">Action Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-450 italic">Moderation queue is empty! No active flags.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};
