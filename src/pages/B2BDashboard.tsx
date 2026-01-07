import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    Users,
    Calendar,
    DollarSign,
    Plus,
    ArrowUpRight,
    History,
    FileText,
    CreditCard,
    UserPlus
} from 'lucide-react';
import { StatsCard } from '../components/dashboard/StatsCard';
import { RecentActivity } from '../components/dashboard/RecentActivity';

import { RevenueChart } from '../components/dashboard/RevenueChart';
import { PopularDestinations } from '../components/dashboard/PopularDestinations';
import { UpcomingBookings } from '../components/dashboard/UpcomingBookings';
import { DashboardModal } from '../components/dashboard/DashboardModal';

// --- Types ---
interface Booking {
    id: string;
    clientName: string;
    destination: string;
    date: string;
    guests: number;
    status: 'confirmed' | 'pending' | 'processing';
    amount: number;
}

interface Payment {
    id: string;
    clientName: string;
    amount: number;
    date: string;
    method: string;
    status: 'success' | 'pending' | 'failed';
}

interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    totalBookings: number;
}

export const B2BDashboard = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    // --- State for Manual Data ---
    const [bookings, setBookings] = useState<Booking[]>(() => {
        const saved = localStorage.getItem('b2b_bookings');
        return saved ? JSON.parse(saved) : [];
    });

    const [payments, setPayments] = useState<Payment[]>(() => {
        const saved = localStorage.getItem('b2b_payments');
        return saved ? JSON.parse(saved) : [];
    });

    const [clients, setClients] = useState<Client[]>(() => {
        const saved = localStorage.getItem('b2b_clients');
        return saved ? JSON.parse(saved) : [];
    });

    // --- Modal States ---
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (!user?.business) {
            navigate('/');
            return;
        }

        // Simulate loading dashboard data
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    }, [isAuthenticated, user, navigate]);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('b2b_bookings', JSON.stringify(bookings));
    }, [bookings]);

    useEffect(() => {
        localStorage.setItem('b2b_payments', JSON.stringify(payments));
    }, [payments]);

    useEffect(() => {
        localStorage.setItem('b2b_clients', JSON.stringify(clients));
    }, [clients]);

    // --- Stats Calculation ---
    const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
    const totalBookingsCount = bookings.length;
    const activeClientsCount = clients.length;

    // --- Handlers ---
    const handleAddBooking = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newBooking: Booking = {
            id: Math.random().toString(36).substr(2, 9),
            clientName: formData.get('clientName') as string,
            destination: formData.get('destination') as string,
            date: formData.get('date') as string,
            guests: Number(formData.get('guests')),
            status: 'pending',
            amount: Number(formData.get('amount')),
        };
        setBookings([newBooking, ...bookings]);
        setIsBookingModalOpen(false);
    };

    const handleAddPayment = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newPayment: Payment = {
            id: Math.random().toString(36).substr(2, 9),
            clientName: formData.get('clientName') as string,
            amount: Number(formData.get('amount')),
            date: formData.get('date') as string,
            method: formData.get('method') as string,
            status: 'success',
        };
        setPayments([newPayment, ...payments]);
        setIsPaymentModalOpen(false);
    };

    const handleAddClient = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newClient: Client = {
            id: Math.random().toString(36).substr(2, 9),
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            totalBookings: 0,
        };
        setClients([newClient, ...clients]);
        setIsClientModalOpen(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-ai-dark flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-ai-accent/20 border-t-ai-accent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-ai-muted">Loading your business controls...</p>
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

                        <div className="flex gap-3">
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

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                        title="Pending Actions"
                        value={bookings.filter(b => b.status === 'pending').length.toString()}
                        change="Action Needed"
                        trend="down"
                        icon={TrendingUp}
                        delay={0.4}
                    />
                </div>

                {/* Management Buttons Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <button
                        onClick={() => setIsBookingModalOpen(true)}
                        className="flex items-center justify-between p-6 glass-card hover:bg-ai-card/50 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <p className="text-white font-bold">Add Booking</p>
                                <p className="text-ai-muted text-xs">Record a new manual booking</p>
                            </div>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-ai-muted group-hover:text-white transition-colors" />
                    </button>

                    <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="flex items-center justify-between p-6 glass-card hover:bg-ai-card/50 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <p className="text-white font-bold">Record Payment</p>
                                <p className="text-ai-muted text-xs">Log client payments manually</p>
                            </div>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-ai-muted group-hover:text-white transition-colors" />
                    </button>

                    <button
                        onClick={() => setIsClientModalOpen(true)}
                        className="flex items-center justify-between p-6 glass-card hover:bg-ai-card/50 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                                <UserPlus className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <p className="text-white font-bold">New Client</p>
                                <p className="text-ai-muted text-xs">Store client preferences and details</p>
                            </div>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-ai-muted group-hover:text-white transition-colors" />
                    </button>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Revenue Chart - Takes 2 columns */}
                    <div className="lg:col-span-2">
                        <RevenueChart />
                    </div>

                    {/* Popular Destinations */}
                    <div className="lg:col-span-1">
                        <PopularDestinations />
                    </div>
                </div>

                {/* Bottom Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Upcoming Bookings using dynamic data */}
                    <UpcomingBookings data={bookings} />

                    {/* Recent Activity */}
                    <RecentActivity />
                </div>

                {/* AI Itinerary Overview Section */}
                <div className="glass-card rounded-2xl p-8 bg-gradient-to-br from-ai-accent/5 to-transparent border-ai-accent/10">
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
                </div>
            </div>

            {/* --- Modals --- */}

            {/* Add Booking Modal */}
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

            {/* Record Payment Modal */}
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

            {/* Add Client Modal */}
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
        </div>
    );
};
