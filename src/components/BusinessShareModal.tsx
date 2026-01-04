import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Link as LinkIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { encodeItineraryToUrl } from '../utils/sharing';

interface BusinessShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
}

export const BusinessShareModal = ({ isOpen, onClose, data }: BusinessShareModalProps) => {
    const [formData, setFormData] = useState({
        businessName: '',
        agentName: '',
        contactNumber: '',
        welcomeNote: '',
        brandColor: '#22C55E', // Default Green
        totalPrice: '',
        pricePerGuest: '',
        notes: ''
    });
    const [copied, setCopied] = useState(false);

    // Brand Color Presets
    const brandColors = [
        { name: 'Growth Green', value: '#22C55E' }, // Default
        { name: 'Trust Blue', value: '#3B82F6' },
        { name: 'Royal Gold', value: '#EAB308' },
        { name: 'Passion Red', value: '#EF4444' },
        { name: 'Creative Purple', value: '#A855F7' },
    ];

    // Load saved agent details from localStorage
    useEffect(() => {
        const savedProfile = localStorage.getItem('himato_agent_profile');
        if (savedProfile) {
            const { businessName, agentName, contactNumber, brandColor, welcomeNote } = JSON.parse(savedProfile);
            setFormData(prev => ({
                ...prev,
                businessName: businessName || '',
                agentName: agentName || '',
                contactNumber: contactNumber || '',
                brandColor: brandColor || '#22C55E',
                welcomeNote: welcomeNote || ''
            }));
        }
    }, []);

    const handleShare = async () => {
        // Save agent details for next time
        localStorage.setItem('himato_agent_profile', JSON.stringify({
            businessName: formData.businessName,
            agentName: formData.agentName,
            contactNumber: formData.contactNumber,
            brandColor: formData.brandColor,
            welcomeNote: formData.welcomeNote
        }));

        const shareData = {
            ...data,
            businessName: formData.businessName,
            agentName: formData.agentName,
            contactNumber: formData.contactNumber,
            brandColor: formData.brandColor,
            welcomeNote: formData.welcomeNote,
            pricing: {
                total: formData.totalPrice,
                perGuest: formData.pricePerGuest
            },
            notes: formData.notes
        };

        const url = encodeItineraryToUrl(shareData);
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
            onClose();
        }, 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-ai-card border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-6 sticky top-0 bg-ai-card z-10 py-2 border-b border-white/5">
                            <h3 className="text-xl font-bold text-white">Share as Business</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Business Name</label>
                                <input
                                    type="text"
                                    value={formData.businessName}
                                    onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-ai-accent/50 focus:outline-none"
                                    placeholder="e.g. Dream Travels"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Your Name</label>
                                    <input
                                        type="text"
                                        value={formData.agentName}
                                        onChange={e => setFormData({ ...formData, agentName: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-ai-accent/50 focus:outline-none"
                                        placeholder="Rahul Sharma"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">WhatsApp Number</label>
                                    <input
                                        type="text"
                                        value={formData.contactNumber}
                                        onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-ai-accent/50 focus:outline-none"
                                        placeholder="9876543210"
                                    />
                                </div>
                            </div>

                            {/* Brand Styling Section */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Brand Theme Color</label>
                                    <div className="flex flex-wrap gap-3">
                                        {brandColors.map((color) => (
                                            <button
                                                key={color.value}
                                                onClick={() => setFormData({ ...formData, brandColor: color.value })}
                                                className={`w-8 h-8 rounded-full border-2 transition-all ${formData.brandColor === color.value ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                                                style={{ backgroundColor: color.value }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Welcome Message (Optional)</label>
                                    <textarea
                                        value={formData.welcomeNote}
                                        onChange={e => setFormData({ ...formData, welcomeNote: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-ai-accent/50 focus:outline-none h-20 resize-none text-sm"
                                        placeholder="Hi Rahul, here is the itinerary we discussed..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Total Price</label>
                                    <input
                                        type="text"
                                        value={formData.totalPrice}
                                        onChange={e => setFormData({ ...formData, totalPrice: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-ai-accent/50 focus:outline-none"
                                        placeholder="₹50,000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Per Guest</label>
                                    <input
                                        type="text"
                                        value={formData.pricePerGuest}
                                        onChange={e => setFormData({ ...formData, pricePerGuest: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-ai-accent/50 focus:outline-none"
                                        placeholder="₹12,500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Notes / Terms</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-ai-accent/50 focus:outline-none h-24 resize-none"
                                    placeholder="Includes hotels, cab, and permits..."
                                />
                            </div>

                            <button
                                onClick={handleShare}
                                className="w-full mt-4 bg-ai-accent hover:bg-ai-secondary text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-5 h-5" />
                                        Link Copied!
                                    </>
                                ) : (
                                    <>
                                        <LinkIcon className="w-5 h-5" />
                                        Generate Business Link
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
