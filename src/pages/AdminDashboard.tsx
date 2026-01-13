import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Map,
    Activity,
    CreditCard,
    ShieldCheck,
    Search,
    Filter,
    ArrowUpRight,
    CheckCircle2,
    XCircle,
    Calendar,
    Mail,
    Phone,
    User as UserIcon,
    AlertCircle,
    LayoutDashboard
} from 'lucide-react';
import { apiClient } from '../services/api';

type Tab = 'overview' | 'users' | 'itineraries' | 'activities' | 'subscriptions';

export const AdminDashboard = () => {
    const { user, isAuthenticated, refreshUser, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [isVerifying, setIsVerifying] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [itineraries, setItineraries] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAdminData = useCallback(async () => {
        try {
            const [statsRes, usersRes, itinerariesRes, activitiesRes, subsRes] = await Promise.all([
                apiClient.getAdminStats(),
                apiClient.getAllUsers(),
                apiClient.getAllItineraries(),
                apiClient.getAllActivities(),
                apiClient.getAdminSubscriptions()
            ]);

            setStats(statsRes.data?.stats || null);
            setUsers(usersRes.data?.users || []);
            setItineraries(itinerariesRes.data?.itineraries || []);
            setActivities(activitiesRes.data?.logs || []);
            setSubscriptions(subsRes.data?.requests || []);
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
        }
    }, []);

    const handleProcessSubscription = useCallback(async (requestId: string, status: 'approved' | 'rejected') => {
        try {
            await apiClient.processSubscriptionRequest({ requestId, status });
            // Refresh data
            fetchAdminData();
        } catch (error) {
            console.error('Failed to process subscription:', error);
        }
    }, [fetchAdminData]);

    const [hasRefreshed, setHasRefreshed] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const initDashboard = async () => {
            if (authLoading) return;

            if (!isAuthenticated) {
                if (isMounted) navigate('/login');
                return;
            }

            // If we are logged in but don't have admin role yet, try to refresh once
            if (user?.role !== 'admin' && !hasRefreshed) {
                await refreshUser();
                if (isMounted) setHasRefreshed(true);
                return;
            }

            // Final check: if still not admin, redirect away
            if (user?.role !== 'admin') {
                if (isMounted) navigate('/');
                return;
            }

            // If we are admin, fetch the data
            if (isMounted) {
                try {
                    await fetchAdminData();
                } finally {
                    if (isMounted) setIsVerifying(false);
                }
            }
        };

        initDashboard();

        return () => { isMounted = false; };
    }, [isAuthenticated, authLoading, hasRefreshed, refreshUser, navigate, user?.role, fetchAdminData]);

    if (isVerifying || authLoading) {
        return (
            <div className="min-h-screen bg-ai-dark flex items-center justify-center">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-12 h-12 border-4 border-ai-accent border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <p className="text-ai-muted text-sm font-medium animate-pulse uppercase tracking-widest">
                        Authenticating System Admin...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-ai-dark pt-36 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-ai-accent/10 border border-ai-accent/20">
                            <ShieldCheck className="w-6 h-6 text-ai-accent" />
                        </div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">System Administration</h1>
                    </div>
                    <p className="text-ai-muted">Full oversight of Himato ecosystem and business operations.</p>
                </header>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard label="Total Travelers" value={stats?.totalUsers} icon={Users} color="blue" />
                    <StatCard label="Itineraries Built" value={stats?.totalItineraries} icon={Map} color="purple" />
                    <StatCard label="B2B Subscription" value={stats?.totalSubscriptionRequests} icon={CreditCard} color="emerald" />
                    <StatCard label="Manual Bookings" value={stats?.totalBookings} icon={Calendar} color="orange" />
                </div>

                {/* Tabs Navigation */}
                <div className="flex overflow-x-auto gap-2 mb-8 p-1 bg-white/5 rounded-2xl border border-white/5 no-scrollbar">
                    <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" icon={LayoutDashboard} />
                    <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="User Base" icon={Users} />
                    <TabButton active={activeTab === 'itineraries'} onClick={() => setActiveTab('itineraries')} label="Itineraries" icon={Map} />
                    <TabButton active={activeTab === 'activities'} onClick={() => setActiveTab('activities')} label="Live Activity" icon={Activity} />
                    <TabButton active={activeTab === 'subscriptions'} onClick={() => setActiveTab('subscriptions')} label="B2B Pending" icon={AlertCircle} badge={stats?.pendingSubscriptions} />
                </div>

                {/* Tab Content */}
                <div className="glass-card rounded-3xl p-6 sm:p-8 min-h-[500px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-ai-accent/5 blur-[80px] rounded-full -mr-20 -mt-20" />

                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-ai-accent" />
                                            Urgent: Pending Approvals
                                        </h3>
                                        <div className="space-y-4">
                                            {subscriptions.filter(s => s.status === 'pending').slice(0, 3).map(sub => (
                                                <div key={sub._id} className="flex items-center justify-between p-4 bg-ai-dark/50 rounded-xl border border-white/5">
                                                    <div>
                                                        <p className="text-white font-bold">{sub.user?.name}</p>
                                                        <p className="text-ai-muted text-xs uppercase tracking-wider">{sub.plan}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setActiveTab('subscriptions')}
                                                        className="p-2 rounded-lg bg-ai-accent/10 hover:bg-ai-accent/20 text-ai-accent transition-all"
                                                    >
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            {subscriptions.filter(s => s.status === 'pending').length === 0 && (
                                                <p className="text-ai-muted text-center py-4 italic">No pending B2B approvals.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                                            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Systems Operational</h3>
                                        <p className="text-ai-muted text-sm max-w-xs">All database connections and AI services are running optimally.</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'users' && (
                            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ai-muted" />
                                        <input
                                            type="text"
                                            placeholder="Search by name, email or business..."
                                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-ai-accent outline-none transition-all"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all">
                                        <Filter className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="overflow-x-auto rounded-2xl border border-white/10">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-white/5">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold text-ai-muted uppercase tracking-wider">User</th>
                                                <th className="px-6 py-4 text-xs font-bold text-ai-muted uppercase tracking-wider">Type</th>
                                                <th className="px-6 py-4 text-xs font-bold text-ai-muted uppercase tracking-wider">Subscription</th>
                                                <th className="px-6 py-4 text-xs font-bold text-ai-muted uppercase tracking-wider">Joined</th>
                                                <th className="px-6 py-4 text-xs font-bold text-ai-muted uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {users.filter(u =>
                                                u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                u.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
                                            ).map(user => (
                                                <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-ai-accent/10 flex items-center justify-center font-bold text-ai-accent">
                                                                {user.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-bold">{user.name}</p>
                                                                <p className="text-ai-muted text-xs">{user.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'}`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${user.subscriptionStatus === 'active' ? 'bg-emerald-500' : 'bg-ai-muted'}`} />
                                                            <span className="text-xs text-white capitalize">{user.subscriptionStatus || 'none'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-ai-muted font-medium">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button className="text-ai-muted hover:text-white transition-colors">
                                                            <ArrowUpRight className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'subscriptions' && (
                            <motion.div key="subs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <h3 className="text-xl font-bold text-white mb-6">B2B Agent Verification Requests</h3>

                                <div className="grid grid-cols-1 gap-6">
                                    {subscriptions.length > 0 ? subscriptions.map(sub => (
                                        <div key={sub._id} className="glass-card p-6 border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-ai-accent/30 transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-2xl bg-ai-accent/10 flex items-center justify-center">
                                                    <UserIcon className="w-8 h-8 text-ai-accent" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="text-xl font-bold text-white">{sub.user?.name}</h4>
                                                        {sub.user?.business && <span className="px-2 py-0.5 bg-ai-accent/10 text-ai-accent text-[10px] font-black rounded italic">AGENT</span>}
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-ai-muted text-sm font-medium">
                                                        <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {sub.user?.email}</span>
                                                        <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {sub.user?.phoneNo}</span>
                                                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Requested {new Date(sub.requestedAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 w-full md:w-auto">
                                                {sub.status === 'pending' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleProcessSubscription(sub._id, 'rejected')}
                                                            className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <XCircle className="w-4 h-4 text-red-400" />
                                                            Reject
                                                        </button>
                                                        <button
                                                            onClick={() => handleProcessSubscription(sub._id, 'approved')}
                                                            className="flex-1 md:flex-none px-8 py-2.5 rounded-xl bg-ai-accent text-ai-dark font-black hover:bg-ai-accent/90 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            Verify & Activate
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold ${sub.status === 'approved' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-red-500/20 text-red-400 bg-red-500/5'}`}>
                                                        {sub.status === 'approved' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                                        {sub.status === 'approved' ? 'Approved' : 'Rejected'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-20 text-center glass-card border-dashed">
                                            <p className="text-ai-muted">No subscription requests found in history.</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'itineraries' && (
                            <motion.div key="itineraries" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {itineraries.map(it => (
                                        <div key={it._id} className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-ai-accent/30 transition-all group">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h4 className="text-white font-bold mb-1 line-clamp-1">{it.prompt}</h4>
                                                    <p className="text-ai-muted text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5">
                                                        <Calendar className="w-3 h-3" /> {new Date(it.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <button className="w-full py-2 rounded-lg bg-ai-accent/5 group-hover:bg-ai-accent/10 text-ai-accent text-xs font-black uppercase transition-all">
                                                Inspect Output
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'activities' && (
                            <motion.div key="activities" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                <div className="space-y-3">
                                    {activities.map(log => (
                                        <div key={log._id} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all">
                                            <div className={`p-2 rounded-lg ${log.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                <Activity className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-white font-bold text-sm uppercase">{log.action}</p>
                                                    <span className="text-[10px] text-ai-muted font-medium italic">{new Date(log.createdAt).toLocaleString()}</span>
                                                </div>
                                                <p className="text-ai-muted text-xs font-medium">{log.email} · {log.ipAddress} · <span className="text-[10px]">{log.message}</span></p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="glass-card p-6 border-white/5 hover:border-white/10 transition-all group overflow-hidden relative">
        <div className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity ${color === 'blue' ? 'text-blue-500' : color === 'purple' ? 'text-purple-500' : color === 'emerald' ? 'text-emerald-500' : 'text-orange-500'
            }`}>
            <Icon className="w-full h-full" />
        </div>
        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${color === 'blue' ? 'bg-blue-500/10 text-blue-400' : color === 'purple' ? 'bg-purple-500/10 text-purple-400' : color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-500'
                }`}>
                <Icon className="w-6 h-6" />
            </div>
            <p className="text-ai-muted text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-black text-white tracking-tighter">{value || 0}</p>
        </div>
    </div>
);

const TabButton = ({ active, onClick, label, icon: Icon, badge }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap relative ${active ? 'bg-ai-accent text-ai-dark' : 'text-ai-muted hover:text-white hover:bg-white/5'
            }`}
    >
        <Icon className={`w-4 h-4 ${active ? 'text-ai-dark' : 'text-ai-muted group-hover:text-white'}`} />
        {label}
        {badge > 0 && (
            <span className={`flex items-center justify-center min-w-[18px] h-[18px] text-[10px] rounded-full px-1 ${active ? 'bg-ai-dark text-ai-accent' : 'bg-ai-accent text-ai-dark'
                }`}>
                {badge}
            </span>
        )}
    </button>
);
