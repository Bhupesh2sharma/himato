import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users, Map, BookOpen, LogIn, TrendingUp, TrendingDown,
    ShieldCheck, Building2, UserCheck, Globe, Lock, Search, ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';

interface AnalyticsData {
    users: { total: number; today: number; week: number; business: number; admins: number };
    itineraries: { total: number; today: number; week: number; business: number; guest: number };
    guides: { total: number; published: number };
    logins: { total: number; week: number; failedWeek: number };
    chart: { date: string; total: number; business: number }[];
    recentUsers: any[];
}

function StatCard({ label, value, sub, icon: Icon, accent = '#2f4a3a', trend }: {
    label: string; value: number | string; sub?: string;
    icon: any; accent?: string; trend?: 'up' | 'down' | null;
}) {
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-black/8 p-6 flex items-start justify-between">
            <div>
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-ai-muted mb-1">{label}</p>
                <p className="text-3xl font-bold text-ai-text" style={{ letterSpacing: '-0.02em' }}>{value}</p>
                {sub && (
                    <p className="text-xs text-ai-muted mt-1 flex items-center gap-1">
                        {trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                        {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
                        {sub}
                    </p>
                )}
            </div>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${accent}18` }}>
                <Icon className="w-5 h-5" style={{ color: accent }} />
            </div>
        </motion.div>
    );
}

function MiniBar({ data }: { data: { date: string; total: number; business: number }[] }) {
    const max = Math.max(...data.map(d => d.total), 1);
    return (
        <div className="flex items-end gap-1 h-20">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-ai-text text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10">
                        {d.date.slice(5)}: {d.total}
                    </div>
                    <div className="w-full rounded-t-sm transition-all"
                        style={{ height: `${(d.total / max) * 100}%`, background: '#2f4a3a', minHeight: d.total > 0 ? 4 : 1, opacity: 0.15 + (i / data.length) * 0.85 }} />
                </div>
            ))}
        </div>
    );
}

export function AdminDashboard() {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');
    const [users, setUsers] = useState<any[]>([]);
    const [usersTotal, setUsersTotal] = useState(0);
    const [usersPage, setUsersPage] = useState(1);
    const [usersPages, setUsersPages] = useState(1);
    const [search, setSearch] = useState('');
    const [usersLoading, setUsersLoading] = useState(false);

    useEffect(() => {
        if (!isLoading && (!user || !user.isAdmin)) navigate('/');
    }, [user, isLoading, navigate]);

    useEffect(() => {
        if (user?.isAdmin) fetchAnalytics();
    }, [user]);

    useEffect(() => {
        if (activeTab === 'users' && user?.isAdmin) fetchUsers();
    }, [activeTab, usersPage, search, user]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await apiClient.getAdminAnalytics();
            setAnalytics(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const res = await apiClient.getAdminUsers(usersPage, search);
            setUsers(res.data.users);
            setUsersTotal(res.data.total);
            setUsersPages(res.data.pages);
        } catch (err) {
            console.error(err);
        } finally {
            setUsersLoading(false);
        }
    };

    const handleToggleAdmin = async (id: string) => {
        try {
            await apiClient.toggleAdminUser(id);
            fetchUsers();
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (isLoading || !user?.isAdmin) return null;

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'users', label: 'Users' },
    ] as const;

    return (
        <div className="min-h-screen bg-ai-dark pt-28 pb-16 px-4">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-ai-muted mb-1">Super Admin</p>
                        <h1 className="text-3xl text-ai-text" style={{ fontWeight: 600 }}>Platform Analytics</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/admin/guides"
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/10 text-sm font-medium text-ai-muted hover:border-ai-accent hover:text-ai-accent transition-all bg-white">
                            <BookOpen className="w-4 h-4" />
                            Manage Guides
                        </Link>
                        <button onClick={fetchAnalytics}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/10 text-sm font-medium text-ai-muted hover:bg-black/5 transition-all bg-white">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-black/5 rounded-xl w-fit mb-8">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
                            style={activeTab === t.id ? { background: '#fff', color: '#0e1116', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' } : { color: '#6b7280' }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ── Overview Tab ── */}
                {activeTab === 'overview' && (
                    loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-8 h-8 border-2 border-black/10 border-t-ai-accent rounded-full animate-spin" />
                        </div>
                    ) : analytics ? (
                        <div className="space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard label="Total Users" value={analytics.users.total}
                                    sub={`+${analytics.users.week} this week`} trend="up"
                                    icon={Users} accent="#2f4a3a" />
                                <StatCard label="Itineraries" value={analytics.itineraries.total}
                                    sub={`${analytics.itineraries.today} today`} trend="up"
                                    icon={Map} accent="#c9a961" />
                                <StatCard label="Business Users" value={analytics.users.business}
                                    sub={`${analytics.itineraries.business} B2B trips`}
                                    icon={Building2} accent="#b73f25" />
                                <StatCard label="Logins (7d)" value={analytics.logins.week}
                                    sub={`${analytics.logins.failedWeek} failed`} trend={analytics.logins.failedWeek > 10 ? 'down' : null}
                                    icon={LogIn} accent="#5a7a2a" />
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard label="Guest Trips" value={analytics.itineraries.guest}
                                    sub="No account needed" icon={UserCheck} accent="#6b7280" />
                                <StatCard label="Guides Published" value={analytics.guides.published}
                                    sub={`${analytics.guides.total} total`} icon={BookOpen} accent="#2f6b8a" />
                                <StatCard label="New Users Today" value={analytics.users.today}
                                    icon={TrendingUp} accent="#7c6f9f" />
                                <StatCard label="Admins" value={analytics.users.admins}
                                    icon={ShieldCheck} accent="#2f4a3a" />
                            </div>

                            {/* Chart */}
                            <div className="bg-white rounded-2xl border border-black/8 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="font-bold text-ai-text">Itineraries Generated</h3>
                                        <p className="text-xs text-ai-muted mt-0.5">Last 14 days</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-ai-muted">
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#2f4a3a' }} />
                                            Total
                                        </span>
                                    </div>
                                </div>
                                <MiniBar data={analytics.chart} />
                                <div className="flex justify-between mt-2">
                                    <span className="text-[10px] text-ai-muted">{analytics.chart[0]?.date.slice(5)}</span>
                                    <span className="text-[10px] text-ai-muted">{analytics.chart[analytics.chart.length - 1]?.date.slice(5)}</span>
                                </div>
                            </div>

                            {/* Recent Signups */}
                            <div className="bg-white rounded-2xl border border-black/8 p-6">
                                <h3 className="font-bold text-ai-text mb-5">Recent Signups</h3>
                                <div className="space-y-3">
                                    {analytics.recentUsers.map((u: any) => (
                                        <div key={u._id} className="flex items-center gap-3 py-2 border-b border-black/5 last:border-0">
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                                                style={{ background: u.isAdmin ? '#2f4a3a' : u.business ? '#b73f25' : '#c9a961' }}>
                                                {u.name[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-ai-text truncate">{u.name}</p>
                                                <p className="text-xs text-ai-muted truncate">{u.email}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {u.isAdmin && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-ai-accent/10 text-ai-accent">Admin</span>}
                                                {u.business && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">B2B</span>}
                                                <span className="text-[10px] text-ai-muted">{new Date(u.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : null
                )}

                {/* ── Users Tab ── */}
                {activeTab === 'users' && (
                    <div className="space-y-4">
                        {/* Search */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 flex items-center gap-2 bg-white border border-black/10 rounded-xl px-4 py-2.5">
                                <Search className="w-4 h-4 text-ai-muted shrink-0" />
                                <input value={search} onChange={e => { setSearch(e.target.value); setUsersPage(1); }}
                                    placeholder="Search by name or email…"
                                    className="flex-1 bg-transparent text-sm text-ai-text outline-none placeholder-ai-muted" />
                            </div>
                            <p className="text-sm text-ai-muted shrink-0">{usersTotal} users</p>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-2xl border border-black/8 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-black/8 bg-black/[0.02]">
                                        <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ai-muted">User</th>
                                        <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ai-muted hidden md:table-cell">Email</th>
                                        <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ai-muted">Type</th>
                                        <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ai-muted hidden lg:table-cell">Joined</th>
                                        <th className="px-5 py-3" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {usersLoading ? (
                                        <tr><td colSpan={5} className="py-12 text-center text-ai-muted text-sm">Loading…</td></tr>
                                    ) : users.map(u => (
                                        <tr key={u._id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.015] transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                                                        style={{ background: u.isAdmin ? '#2f4a3a' : u.business ? '#b73f25' : '#c9a961' }}>
                                                        {u.name[0]}
                                                    </div>
                                                    <span className="font-medium text-ai-text truncate max-w-[120px]">{u.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-ai-muted hidden md:table-cell truncate max-w-[180px]">{u.email}</td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {u.isAdmin && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-ai-accent/10 text-ai-accent">Admin</span>}
                                                    {u.business && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">B2B</span>}
                                                    {!u.isAdmin && !u.business && <span className="text-[10px] text-ai-muted">User</span>}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-xs text-ai-muted hidden lg:table-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td className="px-5 py-3.5 text-right">
                                                <button onClick={() => handleToggleAdmin(u._id)}
                                                    className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-all ${u.isAdmin ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-black/10 text-ai-muted hover:border-ai-accent hover:text-ai-accent'}`}>
                                                    {u.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {usersPages > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                <button onClick={() => setUsersPage(p => Math.max(1, p - 1))} disabled={usersPage === 1}
                                    className="p-2 rounded-xl border border-black/10 text-ai-muted hover:border-ai-accent disabled:opacity-40 transition-all bg-white">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-sm text-ai-muted px-2">Page {usersPage} of {usersPages}</span>
                                <button onClick={() => setUsersPage(p => Math.min(usersPages, p + 1))} disabled={usersPage === usersPages}
                                    className="p-2 rounded-xl border border-black/10 text-ai-muted hover:border-ai-accent disabled:opacity-40 transition-all bg-white">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
