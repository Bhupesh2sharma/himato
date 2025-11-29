import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';
import { encodeItineraryToUrl } from '../utils/sharing';

interface BusinessShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
}

export const BusinessShareModal = ({ isOpen, onClose, data }: BusinessShareModalProps) => {
    const [formData, setFormData] = useState({
        businessName: '',
        totalPrice: '',
        pricePerGuest: '',
        notes: ''
    });
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const shareData = {
            ...data,
            businessName: formData.businessName,
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
                        className="bg-ai-card border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-xl"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Share as Business</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
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
