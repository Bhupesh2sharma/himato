import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Calendar,
    Plus,
    TrendingUp,
    History,
    ArrowUpRight,
    ShieldCheck,
    Trash2,
    Check,
    DollarSign,
    Sparkles
} from 'lucide-react';
import { StatsCard } from '../components/dashboard/StatsCard';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { AISocialGenerator } from '../components/dashboard/AISocialGenerator';
import { apiClient } from '../services/api';

import { RevenueChart } from '../components/dashboard/RevenueChart';
import { UpcomingBookings } from '../components/dashboard/UpcomingBookings';
import { DashboardModal } from '../components/dashboard/DashboardModal';
import { QuickActions } from '../components/dashboard/QuickActions';

// --- Types ---
interface Booking {
    id: string;
    clientName: string;
    destination: string;
    date: string;
    guests: number;
    amount: number;
    status: 'processing' | 'confirmed' | 'pending';
}

interface Payment {
    id: string;
    clientName: string;
    amount: number;
    date: string;
    status: 'success' | 'pending';
    method: string;
}

interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    totalBookings?: number;
}

export const B2BDashboard = () => {
    const { user, isAuthenticated, refreshUser } = useAuth();
    const navigate = useNavigate();
    const analyticsRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [businessData, setBusinessData] = useState<{
        bookings: Booking[];
        payments: Payment[];
        clients: Client[];
        activities: any[];
        revenueData: any[];
    }>({
        bookings: [],
        payments: [],
        clients: [],
        activities: [],
        revenueData: []
    });

    // --- Tab State ---
    const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'payments' | 'clients' | 'social'>('overview');

    // --- Modal States ---
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const response = await apiClient.getBusinessDashboard();
            if (response.status === 'success') {
                setBusinessData(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (!user?.business) {
            navigate('/');
            return;
        }

        refreshUser();
        fetchDashboardData();
    }, [isAuthenticated, user, navigate, refreshUser]);

    // --- Stats Calculation ---
    const totalRevenue = businessData.payments.reduce((acc, p) => acc + p.amount, 0);
    const totalBookingsCount = businessData.bookings.length;
    const activeClientsCount = businessData.clients.length;

    // --- Handlers ---
    const handleAddBooking = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            clientName: formData.get('clientName') as string,
            destination: formData.get('destination') as string,
            date: formData.get('date') as string,
            guests: Number(formData.get('guests')),
            amount: Number(formData.get('amount')),
        };

        try {
            await apiClient.addBooking(data);
            fetchDashboardData();
            setIsBookingModalOpen(false);
        } catch (err) {
            alert('Failed to save booking');
        }
    };

    const handleAddPayment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            clientName: formData.get('clientName') as string,
            amount: Number(formData.get('amount')),
            date: formData.get('date') as string,
            method: formData.get('method') as string,
        };

        try {
            await apiClient.addPayment(data);
            fetchDashboardData();
            setIsPaymentModalOpen(false);
        } catch (err) {
            alert('Failed to record payment');
        }
    };

    const handleAddClient = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
        };

        try {
            await apiClient.addClient(data);
            fetchDashboardData();
            setIsClientModalOpen(false);
        } catch (err) {
            alert('Failed to register client');
        }
    };

    const handleDelete = async (type: 'booking' | 'payment' | 'client', id: string) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
        try {
            await apiClient.deleteBusinessItem(type, id);
            fetchDashboardData();
        } catch (err) {
            alert('Failed to delete item');
        }
    };

    const handleUpdateStatus = async (type: 'booking' | 'payment', id: string, status: string) => {
        try {
            if (type === 'booking') {
                await apiClient.updateBooking(id, { status });
            } else {
                await apiClient.updatePayment(id, { status });
            }
            fetchDashboardData();
        } catch (err) {
            alert('Failed to update status');
        }
    };


    if (isLoading) {
        return (
            <div className="min-h-screen bg-ai-dark flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-ai-accent/20 border-t-ai-accent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-ai-muted">Fetching your business empire...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-ai-dark pt-32 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-ai-text to-ai-accent">
                                {user?.businessName || user?.name} Admin Panel
                            </h1>
                            <p className="text-ai-muted mt-2">Manage your bookings, payments, and generated itineraries.</p>
                        </div>

                        <div className="flex gap-3 flex-wrap">
                            {user?.role === 'admin' && (
                                <button
                                    onClick={() => navigate('/admin')}
                                    className="px-4 py-2 bg-ai-accent text-ai-dark font-bold rounded-xl hover:bg-ai-accent/90 transition-all flex items-center gap-2 text-sm shadow-lg shadow-ai-accent/20"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    System Admin
                                </button>
                            )}
                            <button
                                onClick={() => navigate('/chat')}
                                className="px-4 py-2 glass hover:bg-ai-accent/10 border border-ai-accent/20 text-ai-accent rounded-xl transition-all flex items-center gap-2 text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                New AI Itinerary
                            </button>
                            <button
                                onClick={() => navigate('/history')}
                                className="px-4 py-2 glass hover:bg-white/5 border border-white/10 text-white rounded-xl transition-all flex items-center gap-2 text-sm"
                            >
                                <History className="w-4 h-4" />
                                History
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs Navigation */}
                <div className="flex overflow-x-auto gap-2 mb-8 p-1 bg-white/5 rounded-2xl border border-white/5 no-scrollbar">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-ai-accent text-ai-dark' : 'text-ai-muted hover:text-white hover:bg-white/5'}`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'bookings' ? 'bg-ai-accent text-ai-dark' : 'text-ai-muted hover:text-white hover:bg-white/5'}`}
                    >
                        <Calendar className="w-4 h-4" />
                        Bookings
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'payments' ? 'bg-ai-accent text-ai-dark' : 'text-ai-muted hover:text-white hover:bg-white/5'}`}
                    >
                        <DollarSign className="w-4 h-4" />
                        Payments
                    </button>
                    <button
                        onClick={() => setActiveTab('clients')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'clients' ? 'bg-ai-accent text-ai-dark' : 'text-ai-muted hover:text-white hover:bg-white/5'}`}
                    >
                        <Users className="w-4 h-4" />
                        Clients
                    </button>
                    <button
                        onClick={() => setActiveTab('social')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'social' ? 'bg-ai-accent text-ai-dark' : 'text-ai-muted hover:text-white hover:bg-white/5'}`}
                    >
                        <Sparkles className="w-4 h-4" />
                        AI Social
                    </button>
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatsCard
                                    title="Total Bookings"
                                    value={totalBookingsCount.toString()}
                                    change="+100%"
                                    trend="up"
                                    icon={Calendar}
                                    delay={0.1}
                                />
                                <StatsCard
                                    title="Active Clients"
                                    value={activeClientsCount.toString()}
                                    change="+100%"
                                    trend="up"
                                    icon={Users}
                                    delay={0.2}
                                />
                                <StatsCard
                                    title="Total Revenue"
                                    value={`₹${(totalRevenue / 1000).toFixed(1)}K`}
                                    change="+100%"
                                    trend="up"
                                    icon={DollarSign}
                                    delay={0.3}
                                />
                                <StatsCard
                                    title="Monthly Growth"
                                    value="84%"
                                    change="+12%"
                                    trend="up"
                                    icon={TrendingUp}
                                    delay={0.4}
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-8">
                                    <div ref={analyticsRef}>
                                        <RevenueChart data={businessData.revenueData} />
                                    </div>
                                    <UpcomingBookings data={businessData.bookings.slice(0, 5)} />
                                </div>
                                <div className="space-y-8">
                                    <QuickActions
                                        onAddBooking={() => setIsBookingModalOpen(true)}
                                        onRecordPayment={() => setIsPaymentModalOpen(true)}
                                        onAddClient={() => setIsClientModalOpen(true)}
                                        onUpgrade={() => setIsUpgradeModalOpen(true)}
                                        onViewSocial={() => setActiveTab('social')}
                                        isPro={user?.subscriptionStatus === 'active'}
                                    />
                                    <RecentActivity activities={businessData.activities} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'bookings' && (
                        <motion.div
                            key="bookings"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-white">Booking Management</h2>
                                <button
                                    onClick={() => setIsBookingModalOpen(true)}
                                    className="px-4 py-2 bg-ai-accent text-ai-dark font-bold rounded-xl text-sm flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Add Booking
                                </button>
                            </div>

                            <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
                                <div className="overflow-x-auto text-nowrap">
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5 border-b border-white/10">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold text-ai-muted uppercase">Client</th>
                                                <th className="px-6 py-4 text-xs font-bold text-ai-muted uppercase">Destination</th>
                                                <th className="px-6 py-4 text-xs font-bold text-ai-muted uppercase">Date</th>
                                                <th className="px-6 py-4 text-xs font-bold text-ai-muted uppercase">Amount</th>
                                                <th className="px-6 py-4 text-xs font-bold text-ai-muted uppercase">Status</th>
                                                <th className="px-6 py-4 text-xs font-bold text-ai-muted uppercase text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {businessData.bookings.map(booking => (
                                                <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-white">{booking.clientName}</div>
                                                        <div className="text-xs text-ai-muted">{booking.guests} Guests</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-white font-medium">{booking.destination}</td>
                                                    <td className="px-6 py-4 text-ai-muted text-sm">{new Date(booking.date).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-ai-accent font-bold">₹{booking.amount.toLocaleString()}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' :
                                                            booking.status === 'processing' ? 'bg-ai-accent/10 text-ai-accent' :
                                                                'bg-white/5 text-ai-muted'
                                                            }`}>
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {booking.status !== 'confirmed' && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus('booking', booking.id, 'confirmed')}
                                                                    className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-all"
                                                                    title="Confirm Booking"
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDelete('booking', booking.id)}
                                                                className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {businessData.bookings.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-12 text-center text-ai-muted italic">
                                                        No bookings found. Start by adding one!
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'payments' && (
                        <motion.div
                            key="payments"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-white">Payment Ledger</h2>
                                <button
                                    onClick={() => setIsPaymentModalOpen(true)}
                                    className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl text-sm flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Record Payment
                                </button>
                            </div>

                            <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
                                <div className="overflow-x-auto text-nowrap">
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5 border-b border-white/10">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold text-ai-muted uppercase">Client</th>
                                                <th className="px-6 py-4 text-xs font-bold text-ai-muted uppercase">Date</th>
                                                <th className="px-6 py-4 text-xs font-bold text-ai-muted uppercase">Method</th>
                                                <th className="px-6 py-4 text-xs font-bold text-ai-muted uppercase">Amount</th>
                                                <th className="px-6 py-4 text-xs font-bold text-ai-muted uppercase">Status</th>
                                                <th className="px-6 py-4 text-xs font-bold text-ai-muted uppercase text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {businessData.payments.map(payment => (
                                                <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-white">{payment.clientName}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-ai-muted text-sm">{new Date(payment.date).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-white font-medium">{payment.method}</td>
                                                    <td className="px-6 py-4 text-emerald-400 font-bold">₹{payment.amount.toLocaleString()}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${payment.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                                                            'bg-white/5 text-ai-muted'
                                                            }`}>
                                                            {payment.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleDelete('payment', payment.id)}
                                                            className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {businessData.payments.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-12 text-center text-ai-muted italic">
                                                        No payments found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'clients' && (
                        <motion.div
                            key="clients"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-white">Client Database</h2>
                                <button
                                    onClick={() => setIsClientModalOpen(true)}
                                    className="px-4 py-2 bg-purple-500 text-white font-bold rounded-xl text-sm flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> New Client
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {businessData.clients.map(client => (
                                    <div key={client.id} className="glass-card p-6 border-white/10 hover:border-ai-accent/30 transition-all group">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center font-bold text-purple-400">
                                                {client.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold">{client.name}</h4>
                                                <p className="text-xs text-ai-muted">{client.email}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 mb-6 text-sm">
                                            <div className="flex items-center justify-between text-ai-muted">
                                                <span>Phone</span>
                                                <span className="text-white">{client.phone}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-ai-muted">
                                                <span>Bookings</span>
                                                <span className="text-white">{client.totalBookings || 0}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-all">
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete('client', client.id)}
                                                className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {businessData.clients.length === 0 && (
                                    <div className="col-span-full py-12 text-center text-ai-muted italic bg-white/5 rounded-2xl border border-dashed border-white/10">
                                        No clients registered yet.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'social' && (
                        <motion.div
                            key="social"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <AISocialGenerator />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* AI Itinerary Overview Section (Only on Overview) */}
                {activeTab === 'overview' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card rounded-2xl p-8 bg-gradient-to-br from-ai-accent/5 to-transparent border-ai-accent/10 mt-12"
                    >
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-lg bg-ai-accent/10">
                                        <Plus className="w-6 h-6 text-ai-accent" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">AI Itinerary Generator</h2>
                                </div>
                                <p className="text-ai-muted text-lg mb-6 max-w-2xl">
                                    Ready to create a custom trip for a client? Use our AI travel planner to generate professional itineraries in seconds.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <button
                                        onClick={() => navigate('/chat')}
                                        className="px-8 py-3 bg-ai-accent text-ai-dark font-bold rounded-xl hover:bg-ai-accent/90 transition-all flex items-center gap-3"
                                    >
                                        Start Planner
                                        <ArrowUpRight className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => navigate('/history')}
                                        className="px-8 py-3 glass text-white font-medium rounded-xl hover:bg-white/5 transition-all"
                                    >
                                        Saved History
                                    </button>
                                </div>
                            </div>
                            <div className="w-full md:w-1/3 aspect-square glass rounded-2xl flex items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-ai-accent/20 to-transparent animate-pulse" />
                                <TrendingUp className="w-24 h-24 text-ai-accent/40 group-hover:scale-110 transition-transform" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* --- Modals --- */}

            <DashboardModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                title="Add New Booking"
            >
                <form onSubmit={handleAddBooking} className="space-y-4">
                    <div>
                        <label className="block text-sm text-ai-muted mb-2">Client Name</label>
                        <input name="clientName" required className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-ai-accent/30" placeholder="e.g. Rahul Sharma" />
                    </div>
                    <div>
                        <label className="block text-sm text-ai-muted mb-2">Destination</label>
                        <input name="destination" required className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-ai-accent/30" placeholder="e.g. North Sikkim Tour" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-ai-muted mb-2">Travel Date</label>
                            <input name="date" type="date" required className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-ai-accent/30" />
                        </div>
                        <div>
                            <label className="block text-sm text-ai-muted mb-2">Guests</label>
                            <input name="guests" type="number" required className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-ai-accent/30" placeholder="0" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-ai-muted mb-2">Total Package Amount (₹)</label>
                        <input name="amount" type="number" required className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-ai-accent/30" placeholder="0" />
                    </div>
                    <button type="submit" className="w-full py-3 bg-ai-accent text-ai-dark font-bold rounded-xl mt-4">Save Booking</button>
                </form>
            </DashboardModal>

            <DashboardModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="Record Payment"
            >
                <form onSubmit={handleAddPayment} className="space-y-4">
                    <div>
                        <label className="block text-sm text-ai-muted mb-2">Client Name</label>
                        <input name="clientName" required className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-ai-accent/30" placeholder="e.g. Rahul Sharma" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-ai-muted mb-2">Amount Paid (₹)</label>
                            <input name="amount" type="number" required className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-ai-accent/30" placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-sm text-ai-muted mb-2">Date</label>
                            <input name="date" type="date" required className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-ai-accent/30" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-ai-muted mb-2">Payment Method</label>
                        <select name="method" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-ai-accent/30 appearance-none">
                            <option value="UPI">UPI / Google Pay</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Cash">Cash</option>
                            <option value="Credit Card">Credit Card</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl mt-4">Record Receipt</button>
                </form>
            </DashboardModal>

            <DashboardModal
                isOpen={isClientModalOpen}
                onClose={() => setIsClientModalOpen(false)}
                title="Register New Client"
            >
                <form onSubmit={handleAddClient} className="space-y-4">
                    <div>
                        <label className="block text-sm text-ai-muted mb-2">Full Name</label>
                        <input name="name" required className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-ai-accent/30" placeholder="e.g. Sneha Reddy" />
                    </div>
                    <div>
                        <label className="block text-sm text-ai-muted mb-2">Email Address</label>
                        <input name="email" type="email" required className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-ai-accent/30" placeholder="sneha@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm text-ai-muted mb-2">Phone Number</label>
                        <input name="phone" required className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-ai-accent/30" placeholder="+91 9876543210" />
                    </div>
                    <button type="submit" className="w-full py-3 bg-purple-500 text-white font-bold rounded-xl mt-4">Add to Database</button>
                </form>
            </DashboardModal>

            {isUpgradeModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-ai-dark/80 backdrop-blur-sm"
                        onClick={() => setIsUpgradeModalOpen(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative w-full max-w-md glass-card rounded-3xl p-8 text-center border-ai-accent/20 overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-ai-accent to-ai-secondary" />
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-ai-accent/10 blur-[80px] rounded-full" />
                        <div className="relative z-10">
                            <div className="w-20 h-20 rounded-full bg-ai-accent/10 flex items-center justify-center mx-auto mb-6 border border-ai-accent/20">
                                <ShieldCheck className="w-10 h-10 text-ai-accent" />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-2">Request Received!</h2>
                            <p className="text-ai-accent text-xs font-bold uppercase tracking-widest mb-6">Verification Process Initiated</p>
                            <div className="space-y-4 mb-8">
                                <p className="text-ai-muted text-sm leading-relaxed">
                                    Our dedicated partner team will contact you shortly to verify your business credentials and help you unlock the full Pro Agent potential.
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsUpgradeModalOpen(false);
                                    window.location.reload();
                                }}
                                className="w-full py-4 bg-ai-accent text-ai-dark font-black rounded-2xl hover:bg-ai-accent/90 transition-all uppercase tracking-widest text-xs"
                            >
                                Understood, Thank You
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

