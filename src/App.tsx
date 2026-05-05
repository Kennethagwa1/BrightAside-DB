/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Users, 
  PiggyBank, 
  HandCoins, 
  Heart, 
  AlertCircle, 
  Settings as SettingsIcon,
  Globe,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  History,
  Menu,
  X,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import API, { getApiUrl, setApiUrl } from './lib/api';
import { 
  Member, 
  DashboardStats, 
  SavingsRow, 
  Loan, 
  WelfareEntry, 
  Fine, 
  ChangeLogEntry,
  Settings
} from './types';

// Utility for class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- VIEWS ---

type ViewState = 'landing' | 'admin-login' | 'member-login' | 'admin-dashboard' | 'member-portal';
type SubView = 'overview' | 'members' | 'savings' | 'loans' | 'welfare' | 'fines' | 'changelog' | 'settings';

export default function App() {
  const [view, setView] = useState<ViewState>('landing');
  const [subView, setSubView] = useState<SubView>('overview');
  const [apiUrl, setUrl] = useState(getApiUrl());
  const [showSetup, setShowSetup] = useState(!getApiUrl());
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [toasts, setToasts] = useState<{id: string, msg: string, type: 'success' | 'error' | 'warning'}[]>([]);
  const [loanRequests, setLoanRequests] = useState<any[]>([]);
  const [memberLoans, setMemberLoans] = useState<any[]>([]);

  // Auth & Session
  useEffect(() => {
    const savedUser = sessionStorage.getItem('SACCO_USER');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setView(parsedUser.role === 'admin' ? 'admin-dashboard' : 'member-portal');
    }
  }, []);

  const addToast = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('SACCO_USER');
    setUser(null);
    setView('landing');
  };

  const refreshStats = async () => {
    if (!apiUrl) return;
    try {
      setIsLoading(true);
      const data = await API.get('getDashboard');
      setStats(data);
      const membersData = await API.get('getMembers');
      setMembers(membersData);
      
      if (view === 'admin-dashboard') {
        const requests = await API.get('getLoanRequests');
        setLoanRequests(requests || []);
      }
      
      if (view === 'member-portal' && user?.member?.id) {
        const myLoans = await API.get('getLoans', { memberId: user.member.id });
        setMemberLoans(myLoans || []);
      }
    } catch (err) {
      addToast(String(err), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (apiUrl && (view === 'admin-dashboard' || view === 'member-portal')) {
      refreshStats();
    }
  }, [apiUrl, view]);

  // --- SUB-COMPONENTS ---

  const Sidebar = () => (
    <aside className="w-64 bg-primary text-white h-screen fixed left-0 top-0 overflow-y-auto hidden md:flex flex-col border-r border-slate-700">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-accent rounded flex items-center justify-center font-bold text-primary">B</div>
        <h1 className="font-bold text-lg tracking-tight uppercase">Bright Aside</h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        <SidebarLink icon={<LayoutDashboard size={20} />} label="Dashboard" active={subView === 'overview'} onClick={() => setSubView('overview')} />
        <SidebarLink icon={<Users size={20} />} label="Members" active={subView === 'members'} onClick={() => setSubView('members')} />
        <SidebarLink icon={<PiggyBank size={20} />} label="Savings" active={subView === 'savings'} onClick={() => setSubView('savings')} />
        <SidebarLink icon={<HandCoins size={20} />} label="Loans" active={subView === 'loans'} onClick={() => setSubView('loans')} />
        <SidebarLink icon={<Heart size={20} />} label="Welfare" active={subView === 'welfare'} onClick={() => setSubView('welfare')} />
        <SidebarLink icon={<AlertCircle size={20} />} label="Fines" active={subView === 'fines'} onClick={() => setSubView('fines')} />
        <div className="pt-4 border-t border-slate-700 mt-4 space-y-1">
          <SidebarLink icon={<History size={20} />} label="Change Log" active={subView === 'changelog'} onClick={() => setSubView('changelog')} />
          <SidebarLink icon={<SettingsIcon size={20} />} label="Settings" active={subView === 'settings'} onClick={() => setSubView('settings')} />
        </div>
      </nav>
      <div className="p-6 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-600 border-2 border-accent overflow-hidden flex items-center justify-center text-[10px] font-bold">
            {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'AD'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold truncate">{user?.name || 'Administrator'}</p>
            <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-accent transition-colors flex items-center gap-1">
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  );

  const SidebarLink = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border border-transparent",
        active ? "bg-slate-800 text-accent border-slate-700 shadow-inner" : "text-slate-400 hover:bg-slate-800 hover:text-white"
      )}
    >
      <span className={cn(active ? "text-accent" : "text-slate-500")}>{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );

  // --- RENDER HELPERS ---

  const renderLanding = () => (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-primary">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-accent rounded-full blur-[120px]" />
          <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-blue-500 rounded-full blur-[120px]" />
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1 bg-white/10 text-accent font-semibold rounded-full text-xs uppercase tracking-widest mb-6 border border-white/10">
              Kenyan Savings & Credit Co-operative
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              Bright Aside <br/> <span className="text-accent">Self Help Group</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Empowering our community through collective savings and affordable credit. Build your future with us.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => setView('member-login')}
                className="px-8 py-4 bg-accent text-white font-bold rounded-xl hover:bg-accent-dark transition-all transform hover:-translate-y-1 shadow-lg shadow-accent/20"
              >
                Access My Portal
              </button>
              <button 
                onClick={() => setView('admin-login')}
                className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/20 backdrop-blur-sm"
              >
                Admin Login
              </button>
            </div>
            
            <button 
              onClick={() => setShowSetup(true)}
              className="mt-12 mx-auto text-slate-500 hover:text-accent text-[10px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2"
            >
              <SettingsIcon size={12} />
              Configure System Connection
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-white border-y border-border py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem label="Active Members" value="22+" icon={<Users className="text-accent" />} />
            <StatItem label="Est. Since" value="2022" icon={<Building2 className="text-accent" />} />
            <StatItem label="Community Led" value="100%" icon={<Heart className="text-accent" />} />
            <StatItem label="Loan Eligibility" value="80%" icon={<HandCoins className="text-accent" />} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-border py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg">Bright Aside SACCO</span>
          </div>
          <p className="text-muted text-sm max-w-md mx-auto mb-8">
            A registered self-help group dedicated to the economic empowerment of its members.
          </p>
          <div className="text-[10px] text-muted uppercase tracking-widest font-bold">
            &copy; {new Date().getFullYear()} Bright Aside SHG • Built with Google AI Studio
          </div>
        </div>
      </footer>
    </div>
  );

  const StatItem = ({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) => (
    <div className="text-center">
      <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-3xl font-bold mb-1">{value}</h3>
      <p className="text-muted text-sm">{label}</p>
    </div>
  );

  const Dashboard = () => (
    <div className="flex bg-bg min-h-screen pl-64">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
            <span className="opacity-50">Pages</span>
            <span className="opacity-20">/</span>
            <span className="text-primary font-bold capitalize">{subView.replace('-', ' ')}</span>
            {isLoading && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: 'linear' }} className="ml-2"><Clock className="text-muted w-4 h-4" /></motion.div>}
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">System Active</span>
            </div>
            <button className="btn btn-primary px-6">Export Report</button>
          </div>
        </header>

        <div className="p-8 h-[calc(100vh-64px)] overflow-y-auto">
          {subView === 'overview' && renderAdminOverview()}
          {subView === 'members' && renderAdminMembers()}
          {subView === 'savings' && renderAdminSavings()}
          {subView === 'loans' && renderAdminLoans()}
          {subView === 'settings' && renderAdminSettings()}
          {/* Add more subviews as needed */}
          {['welfare', 'fines', 'changelog'].includes(subView) && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="text-muted w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-2">Module Under Construction</h3>
              <p className="text-muted max-w-sm">This module is coming soon in the next update. All data logic exists in Code.gs.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );

  const renderAdminOverview = () => (
    <div className="grid grid-cols-4 grid-rows-3 gap-6 h-full min-h-[700px]">
      {/* KPI Cards */}
      <BentoKPICard 
        label="Total Savings" 
        value={(stats?.totalSavings || 0).toLocaleString('en-KE', { style: 'currency', currency: 'KSh' })} 
        trend="+12.4% from last month" 
        trendColor="text-emerald-500"
      />
      <BentoKPICard 
        label="Active Loans" 
        value={stats?.activeLoansCount || 0} 
        trend={`${stats?.activeLoansCount || 0} active members`} 
        trendColor="text-slate-500"
      />
      <BentoKPICard 
        label="Arrears" 
        value={(stats?.totalArrears || 0).toLocaleString('en-KE', { style: 'currency', currency: 'KSh' })} 
        trend="3 payments overdue" 
        trendColor="text-red-500"
        valueColor="text-red-500"
      />
      <BentoKPICard 
        label="Pending Fines" 
        value={(stats?.totalPendingFines || 0).toLocaleString('en-KE', { style: 'currency', currency: 'KSh' })} 
        trend="Savings & Welfare" 
        trendColor="text-slate-500"
        valueColor="text-amber-500"
      />

      {/* Main Chart Card */}
      <div className="col-span-2 row-span-2 card flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">Savings Growth Trend</h3>
          <select className="text-xs font-bold bg-slate-50 border-none p-2 rounded-lg outline-none"> 
            <option>Last 6 Months</option>
            <option>This Year</option>
          </select>
        </div>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" axisLine={false} tickLine={false} />
              <YAxis fontSize={10} stroke="#94a3b8" axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="val" fill="#0f172a" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions / Live Log */}
      <div className="col-span-2 row-span-2 bg-primary rounded-2xl border-2 border-slate-700 shadow-sm p-6 text-white overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-accent text-lg">Recent Transactions</h3>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Live Log</span>
        </div>
        <div className="space-y-5 overflow-y-auto pr-2 custom-scrollbar flex-1">
          <TransactionItem title="Michael B. Savings" subtitle="Recorded by Kenneth O." amount="+ KSh 2,400" time="2 mins ago" type="savings" />
          <TransactionItem title="Rose M. Loan Payment" subtitle="Weekly installment" amount="+ KSh 8,500" time="1 hour ago" type="loan" />
          <TransactionItem title="Fine Issued: Faith A." subtitle="Savings missing (Wk 24)" amount="KSh 50" time="3 hours ago" type="fine" />
          <TransactionItem title="Joanes A. Savings" subtitle="Bulk Entry (4 Weeks)" amount="+ KSh 2,400" time="4 hours ago" type="savings" />
          <TransactionItem title="Victor K. Loan Approved" subtitle="Principal: KSh 45,000" amount="KSh 45,000" time="5 hours ago" type="loan" />
        </div>
      </div>

      {/* Mini Footer Strip inside layout */}
      <div className="col-span-4 flex justify-between items-center px-2 py-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        <p>© {new Date().getFullYear()} Bright Aside SACCO • All Rights Reserved</p>
        <div className="flex gap-6">
          <span>System v2.4.1</span>
          <span>Connected to Google Sheets DB</span>
        </div>
      </div>
    </div>
  );

  const BentoKPICard = ({ label, value, trend, trendColor, valueColor }: { label: string, value: string | number, trend: string, trendColor: string, valueColor?: string }) => (
    <div className="card flex flex-col justify-between">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={cn("text-2xl font-bold mt-1", valueColor)}>{value}</p>
      <p className={cn("text-[10px] mt-2 font-bold", trendColor)}>{trend}</p>
    </div>
  );

  const TransactionItem = ({ title, subtitle, amount, time, type }: { title: string, subtitle: string, amount: string, time: string, type: 'savings' | 'loan' | 'fine' }) => (
    <div className="flex items-center gap-4 border-b border-slate-700/50 pb-4 last:border-0">
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
        type === 'savings' ? "bg-emerald-500/20 text-emerald-400" :
        type === 'loan' ? "bg-blue-500/20 text-blue-400" :
        "bg-red-500/20 text-red-500"
      )}>
        {type === 'savings' ? '+' : type === 'loan' ? 'L' : '!'}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold">{title}</p>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
      <div className="text-right">
        <p className={cn(
          "text-sm font-bold",
          type === 'savings' ? "text-emerald-400" :
          type === 'loan' ? "text-blue-400" :
          "text-red-400"
        )}>{amount}</p>
        <p className="text-[10px] text-slate-500">{time}</p>
      </div>
    </div>
  );

  const renderAdminMembers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
          <input type="text" placeholder="Search members..." className="input pl-10" />
        </div>
        <button className="btn btn-primary gap-2">
          <Plus size={18} />
          Add Member
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-widest">Designation</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.slice(0, 10).map(m => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-[10px] font-bold">
                        {m.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted">{m.designation}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("badge", m.active ? "bg-success/10 text-success" : "bg-muted/10 text-muted")}>
                      {m.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                    <button 
                      onClick={() => {
                        const newName = prompt('Enter new name', m.name);
                        if (newName) {
                          API.post('updateMember', { id: m.id, data: { name: newName } }).then(() => refreshStats());
                        }
                      }}
                      className="text-blue-500 hover:text-blue-700 font-bold text-[10px] uppercase tracking-widest"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Delete this member?')) {
                          API.post('deleteMember', { id: m.id }).then(() => refreshStats());
                        }
                      }}
                      className="text-red-500 hover:text-red-700 font-bold text-[10px] uppercase tracking-widest"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAdminSavings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select className="input w-48">
            <option>Week of 04 May 2026</option>
            <option>Week of 27 Apr 2026</option>
          </select>
          <button className="btn btn-secondary">Mark All Paid (KSh 600)</button>
        </div>
        <button className="btn btn-primary">Save All Changes</button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-widest">Member</th>
              <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-widest">Expected</th>
              <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-widest">Paid</th>
              <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-widest">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map(m => (
              <tr key={m.id}>
                <td className="px-6 py-4 font-medium">{m.name}</td>
                <td className="px-6 py-4 text-slate-400">KSh 600</td>
                <td className="px-6 py-4">
                  <input type="number" className="input w-24 h-8 text-sm" placeholder="600" />
                </td>
                <td className="px-6 py-4">
                  <select className="input w-24 h-8 text-xs bg-slate-50 border-transparent">
                    <option>Paid</option>
                    <option>Partial</option>
                    <option>Unpaid</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <input type="text" className="input text-xs h-8" placeholder="..." />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAdminLoans = () => {
    const pendingRequests = loanRequests.filter(r => r.status === 'pending');
    
    return (
      <div className="space-y-8">
        {/* Loan Requests Section */}
        <div className="card p-0 overflow-hidden border-2 border-amber-100 shadow-sm">
          <div className="p-6 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold flex items-center gap-2">
                <Clock className="text-amber-500" size={20} />
                Pending Loan Requests
              </h3>
              <p className="text-xs text-slate-500">Review and approve new credit applications</p>
            </div>
            <span className="badge bg-amber-500 text-white border-none">{pendingRequests.length} New</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-muted uppercase">Member</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted uppercase">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted uppercase">Term</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted uppercase">Total Repayment</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingRequests.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No pending requests</td></tr>
                ) : (
                  pendingRequests.map(req => (
                    <tr key={req.id}>
                      <td className="px-6 py-4 font-medium text-slate-700">{members.find(m => m.id == req.memberId)?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 font-bold">KSh {Number(req.principal).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">{req.termYears} Year{req.termYears > 1 ? 's' : ''}</td>
                      <td className="px-6 py-4 text-emerald-600 font-bold">KSh {Number(req.totalDue).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <button 
                          onClick={async () => {
                            if (confirm('Approve this loan?')) {
                              await API.post('approveLoan', { requestId: req.id });
                              addToast('Loan Approved!');
                              refreshStats();
                            }
                          }}
                          className="btn py-1 px-3 bg-emerald-500 text-white text-[10px] uppercase font-bold"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={async () => {
                            if (confirm('Reject this request?')) {
                              await API.post('updateLoanRequest', { id: req.id, data: { status: 'rejected' } });
                              addToast('Request Rejected', 'warning');
                              refreshStats();
                            }
                          }}
                          className="btn py-1 px-3 bg-red-500 text-white text-[10px] uppercase font-bold"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card space-y-4">
            <h3 className="font-bold border-b border-border pb-2">Manual Loan Issuance</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted uppercase">Select Member</label>
                <select className="input">
                  <option>---</option>
                  {members.map(m => <option key={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase">Amount (KSh)</label>
                  <input type="number" className="input" placeholder="0" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase">Term</label>
                  <select className="input">
                    <option>1 Year (20%)</option>
                    <option>2 Years (10%)</option>
                  </select>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-border">
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Interest</span>
                  <span className="font-bold">KSh 0</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Insurance (1%)</span>
                  <span className="font-bold">KSh 0</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                  <span className="font-bold">Total Due</span>
                  <span className="font-bold text-accent">KSh 0</span>
                </div>
              </div>
              <button className="btn btn-primary w-full">Issue Loan Now</button>
            </div>
          </div>

          <div className="card h-full flex flex-col justify-center items-center text-center p-12">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-4">
              <ShieldCheck size={32} />
            </div>
            <h4 className="font-bold mb-2">Rule Check</h4>
            <ul className="text-xs text-slate-500 text-left space-y-2">
              <li className="flex gap-2"><span>•</span> Issue up to 80% of total savings</li>
              <li className="flex gap-2"><span>•</span> 1 yr @ 20% | 2 yrs @ 10%</li>
              <li className="flex gap-2"><span>•</span> 1% Insurance fee applies</li>
              <li className="flex gap-2"><span>•</span> 2 Week Grace Period automatically applied</li>
            </ul>
          </div>
        </div>

        <div className="card p-0 overflow-hidden">
          <h3 className="p-6 font-bold border-b border-border">Active Loans Management</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-muted uppercase">Member</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted uppercase">Principal</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted uppercase">Outstanding</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="text-sm text-muted">
                  <td colSpan={5} className="px-6 py-12 text-center italic">Loading active loan data...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderMemberPortal = () => {
    const [loanPrincipal, setLoanPrincipal] = useState(0);
    const [loanTerm, setLoanTerm] = useState(1);
    
    const interestRate = loanTerm === 1 ? 0.20 : 0.10;
    const interest = loanPrincipal * interestRate;
    const insurance = loanPrincipal * 0.01;
    const totalDue = loanPrincipal + interest + insurance;
    const weeklyInstallment = totalDue / (loanTerm * 52);

    return (
      <div className="min-h-screen bg-bg">
        <nav className="bg-primary text-white sticky top-0 z-50 border-b border-slate-700">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent rounded flex items-center justify-center font-bold text-primary">B</div>
              <span className="font-bold tracking-tight uppercase">Bright Aside SACCO</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-600 border border-accent flex items-center justify-center text-[10px] font-bold">
                  {user?.name?.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <span className="text-xs font-bold">{user?.name}</span>
              </div>
              <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors"><LogOut size={20} /></button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Member Portal</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{user?.member?.designation || 'Member'} • Batch 2022</p>
            </div>
            <button className="btn btn-secondary ml-auto hidden sm:flex gap-2">
              <ExternalLink size={16} />
              Statement
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <BentoKPICard label="My Total Savings" value="KSh 15,600" trend="Confirmed status" trendColor="text-emerald-500" />
                <BentoKPICard 
                  label="Active Loan Balance" 
                  value={memberLoans.length > 0 ? `KSh ${memberLoans[0].balance.toLocaleString()}` : "KSh 0"} 
                  trend={memberLoans.length > 0 ? "Next due Sunday" : "No active loans"} 
                  trendColor="text-blue-500" 
                />
              </div>

              {/* My Loan Details Section */}
              {memberLoans.length > 0 && (
                <div className="card space-y-6 border-l-4 border-blue-500 bg-blue-50/10">
                  <h3 className="font-bold flex items-center gap-2">
                    <HandCoins size={20} className="text-blue-500" />
                    Active Loan Details
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Principal</p>
                      <p className="text-sm font-bold">KSh {Number(memberLoans[0].principal).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Repayment Date</p>
                      <p className="text-sm font-bold">{format(new Date(memberLoans[0].repaymentStartDate), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Weekly Installment</p>
                      <p className="text-sm font-bold">KSh {Number(memberLoans[0].installment).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Status</p>
                      <span className="badge bg-blue-100 text-blue-700 border-none">{memberLoans[0].status}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-500">Grace period ends in {Math.max(0, Math.ceil((new Date(memberLoans[0].repaymentStartDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days.</p>
                    <button className="text-xs font-bold text-accent hover:underline">View Full History</button>
                  </div>
                </div>
              )}

              <div className="card space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">Recent Savings History</h3>
                  <button className="text-accent text-[10px] font-bold uppercase tracking-widest hover:underline">View All</button>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="val" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                          <PiggyBank size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold">May 2026 - Week {i}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Savings Contribution</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600">KSh 600</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Confirmed</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Loan Calculator & Request Form */}
              <div className="card bg-white border-2 border-slate-100 shadow-sm relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-accent" />
                    Loan Request
                  </h3>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Estimated Savings (KSh)</label>
                    <input 
                      type="number" 
                      className="input py-2 text-sm" 
                      placeholder="Enter principal..."
                      value={loanPrincipal || ''}
                      onChange={(e) => setLoanPrincipal(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Loan Period</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setLoanTerm(1)}
                        className={cn("px-4 py-2 text-xs font-bold rounded-lg border transition-all", loanTerm === 1 ? "bg-primary text-white border-primary" : "bg-white text-slate-500 border-slate-200")}
                      >
                        1 Year (20%)
                      </button>
                      <button 
                        onClick={() => setLoanTerm(2)}
                        className={cn("px-4 py-2 text-xs font-bold rounded-lg border transition-all", loanTerm === 2 ? "bg-primary text-white border-primary" : "bg-white text-slate-500 border-slate-200")}
                      >
                        2 Years (10%)
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Interest ({interestRate * 100}%)</span>
                      <span className="font-bold">KSh {interest.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Insurance (1%)</span>
                      <span className="font-bold">KSh {insurance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                      <span className="font-bold">Total Payable</span>
                      <span className="font-bold text-primary">KSh {totalDue.toLocaleString()}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 text-center pt-1 font-medium italic">
                      KSh {Math.round(weeklyInstallment).toLocaleString()} per week for {loanTerm * 52} weeks
                    </div>
                  </div>

                  <button 
                    onClick={async () => {
                      if (!loanPrincipal) return addToast('Please enter an amount', 'error');
                      try {
                        setIsLoading(true);
                        await API.post('submitLoanRequest', {
                          id: 'REQ' + Date.now(),
                          memberId: user.member.id,
                          principal: loanPrincipal,
                          termYears: loanTerm,
                          interestRate: interestRate,
                          interest: interest,
                          insurance: insurance,
                          totalDue: totalDue,
                          requestDate: new Date().toISOString(),
                          status: 'pending',
                          notes: ''
                        });
                        addToast('Loan request submitted!');
                        setLoanPrincipal(0);
                      } catch (err) {
                        addToast('Failed to submit: ' + String(err), 'error');
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    className="btn w-full bg-accent text-white hover:opacity-90 font-bold"
                  >
                    Submit for Approval
                  </button>
                </div>
              </div>

              <div className="card space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">Upcoming Dues</h3>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                </div>
                <div className="space-y-4">
                  <ObligationItem icon={<PiggyBank size={16} />} label="Weekly Savings" date="May 08" amount="KSh 600" />
                  <ObligationItem icon={<Heart size={16} />} label="Monthly Welfare" date="May 31" amount="KSh 300" />
                  {memberLoans.length > 0 && (
                    <ObligationItem icon={<HandCoins size={16} />} label="Loan Repayment" date={format(new Date(memberLoans[0].repaymentStartDate), 'MMM dd')} amount={`KSh ${memberLoans[0].installment.toLocaleString()}`} />
                  )}
                </div>
                <button className="btn btn-secondary w-full border-slate-100 bg-slate-50 text-[10px] uppercase tracking-widest">Mark Reminders</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ObligationItem = ({ icon, label, date, amount }: { icon: React.ReactNode, label: string, date: string, amount: string }) => (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-muted group-hover:bg-accent/10 group-hover:text-accent transition-colors">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-[10px] text-muted uppercase tracking-widest">Due {date}</p>
        </div>
      </div>
      <span className="font-bold text-sm">{amount}</span>
    </div>
  );

  const renderAdminSettings = () => (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="card space-y-6">
        <h3 className="font-bold text-xl border-b border-border pb-4">Global SACCO Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted">Weekly Min Savings (KSh)</label>
            <input type="number" defaultValue={600} className="input" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted">Welfare Monthly (KSh)</label>
            <input type="number" defaultValue={300} className="input" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted">Savings Fine (KSh)</label>
            <input type="number" defaultValue={50} className="input" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted">Loan Max %</label>
            <input type="number" defaultValue={80} className="input" />
          </div>
        </div>
        <button className="btn btn-primary w-full" onClick={() => addToast('Settings saved successfully')}>
          Save Changes
        </button>
      </div>
      
      <div className="card bg-slate-900 border-none">
        <p className="text-slate-400 text-xs mb-4">API Configuration</p>
        <div className="flex bg-white/10 rounded-lg overflow-hidden border border-white/10">
          <input 
            type="text" 
            value={apiUrl} 
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 bg-transparent px-4 py-2 border-none outline-none text-white text-sm"
            placeholder="Apps Script URL..."
          />
          <button 
            onClick={() => {
              setApiUrl(apiUrl);
              addToast('API URL Updated');
              refreshStats();
            }}
            className="bg-white/20 text-white px-4 hover:bg-white/30 transition-colors"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );

  const SetupGuide = () => (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
      className="fixed inset-0 z-[100] bg-primary/95 flex items-center justify-center p-6 backdrop-blur-md overflow-y-auto"
    >
      <div className="max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-accent p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">First Time Setup</h2>
              <p className="opacity-80 text-sm">Welcome to Bright Aside SACCO Management System</p>
            </div>
          </div>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <SetupStep num="1" text="Create a new Google Sheet named 'BrightAside DB'." />
            <SetupStep num="2" text="Open Extensions > Apps Script in the Sheet." />
            <SetupStep num="3" text="Paste the contents of 'Code.gs' and Save." />
            <SetupStep num="4" text="Deploy as Web App, Execute as: Me, Access: Anyone." />
            <SetupStep num="5" text="Copy the Deployment URL and paste it below." />
          </div>
          
          <div className="pt-6 border-t border-border">
            <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Paste Apps Script Web App URL</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={apiUrl} 
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/..." 
                className="input"
              />
              <button 
                onClick={async () => {
                  if (apiUrl.startsWith('https')) {
                    try {
                      setIsLoading(true);
                      setApiUrl(apiUrl);
                      // Force initialization on backend
                      await API.get('initSheet');
                      setShowSetup(false);
                      addToast('System Initialized & Connected!');
                      refreshStats();
                    } catch (err) {
                      addToast('Connection failed: ' + String(err), 'error');
                    } finally {
                      setIsLoading(false);
                    }
                  } else {
                    addToast('Invalid URL format', 'error');
                  }
                }}
                className="btn btn-primary whitespace-nowrap"
              >
                {isLoading ? 'Connecting...' : 'Connect System'}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-muted text-xs bg-slate-50 p-4 rounded-xl border border-border">
            <AlertCircle size={14} />
            <p>You can find the Code.gs file in the project's root directory.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const SetupStep = ({ num, text }: { num: string, text: string }) => (
    <div className="flex items-start gap-4">
      <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
        {num}
      </div>
      <p className="text-slate-600 leading-relaxed">{text}</p>
    </div>
  );

  const ToastContainer = () => (
    <div className="fixed bottom-6 right-6 z-[200] space-y-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div 
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
            className={cn(
              "px-5 py-3 rounded-xl shadow-lg border pointer-events-auto flex items-center gap-3 min-w-[200px]",
              toast.type === 'success' ? "bg-success/5 border-success/20 text-success" :
              toast.type === 'error' ? "bg-danger/5 border-danger/20 text-danger" :
              "bg-warning/5 border-warning/20 text-warning"
            )}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="font-semibold text-sm">{toast.msg}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  const LoginView = ({ role }: { role: 'admin' | 'member' }) => {
    const [uname, setUname] = useState('');
    const [pass, setPass] = useState('');
    const [mId, setMId] = useState('');
    const [pin, setPin] = useState('');

    const handleLogin = async () => {
      if (!apiUrl) {
        addToast('Please set API URL in settings/setup first', 'error');
        return;
      }
      try {
        setIsLoading(true);
        const data = await API.get('login', role === 'admin' 
          ? { username: uname, password: pass } 
          : { username: mId, password: pin }
        );
        if (data) {
          const userObj = { 
            role: data.role, 
            name: data.name, 
            member: data.member 
          };
          sessionStorage.setItem('SACCO_USER', JSON.stringify(userObj));
          setUser(userObj);
          setView(data.role === 'admin' ? 'admin-dashboard' : 'member-portal');
          addToast(`Welcome back, ${data.name}!`);
        } else {
          addToast('Invalid credentials', 'error');
        }
      } catch (err) {
        addToast(String(err), 'error');
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-xl">
              {role === 'admin' ? <ShieldCheck size={32} /> : <Users size={32} />}
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Bright Aside SACCO</h2>
            <p className="text-muted uppercase text-[10px] tracking-widest font-bold mt-1">
              {role === 'admin' ? 'Administrative Access' : 'Member Portal Access'}
            </p>
          </div>
          
          <div className="card space-y-4">
            {role === 'admin' ? (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Username</label>
                  <input type="text" value={uname} onChange={e => setUname(e.target.value)} className="input" placeholder="admin" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Password</label>
                  <input type="password" value={pass} onChange={e => setPass(e.target.value)} className="input" placeholder="••••••••" />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Select Member</label>
                  <select value={mId} onChange={e => setMId(e.target.value)} className="input appearance-none bg-no-repeat bg-[right_1rem_center]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")' }}>
                    <option value="">-- Choose Name --</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">PIN (4 digits)</label>
                  <input type="password" maxLength={4} value={pin} onChange={e => setPin(e.target.value)} className="input text-center text-xl tracking-[1em]" placeholder="0000" />
                </div>
              </>
            )}
            
            <button 
              onClick={handleLogin}
              disabled={isLoading}
              className="btn btn-primary w-full h-12 gap-2 mt-4"
            >
              {isLoading ? 'Authenticating...' : 'Sign In Now'}
              {!isLoading && <ChevronRight size={18} />}
            </button>
            <button onClick={() => setView('landing')} className="w-full text-center text-muted text-xs hover:text-primary mt-4">
              Back to Landing
            </button>
            <div className="pt-4 border-t border-slate-100">
              <button 
                onClick={() => setShowSetup(true)}
                className="w-full flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 hover:text-accent uppercase tracking-widest"
              >
                <Globe size={12} />
                Update Backend Link
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  // --- FINAL RENDER ---

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {view === 'landing' && <motion.div key="landing" exit={{ opacity: 0 }}>{renderLanding()}</motion.div>}
        {view === 'admin-login' && <motion.div key="admin-login" exit={{ opacity: 0 }}><LoginView role="admin" /></motion.div>}
        {view === 'member-login' && <motion.div key="member-login" exit={{ opacity: 0 }}><LoginView role="member" /></motion.div>}
        {view === 'admin-dashboard' && <motion.div key="admin-dashboard">{Dashboard()}</motion.div>}
        {view === 'member-portal' && <motion.div key="member-portal">{renderMemberPortal()}</motion.div>}
      </AnimatePresence>
      
      {showSetup && <SetupGuide />}
      <ToastContainer />
    </div>
  );
}

// --- MOCK DATA ---
const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];
const mockChartData = [
  { name: 'Wk 1', val: 12000 },
  { name: 'Wk 2', val: 15400 },
  { name: 'Wk 3', val: 9800 },
  { name: 'Wk 4', val: 21000 },
  { name: 'Wk 5', val: 18000 },
];
const mockPieData = [
  { name: 'Loans & Interest', value: 450000 },
  { name: 'Welfare Fines', value: 12000 },
  { name: 'Missed Savings', value: 8500 },
];
