import { motion } from 'framer-motion';
import { ExternalLink, Globe } from 'lucide-react';

const bookingSites = [
    {
        name: "Sikkim Tourism",
        description: "Official government tourism portal for permits and packages.",
        url: "https://www.sikkimtourism.gov.in/",
        color: "from-blue-500 to-cyan-500"
    },
    {
        name: "Thrillophilia",
        description: "Curated adventure tours and trekking packages in Sikkim.",
        url: "https://www.thrillophilia.com/states/sikkim",
        color: "from-orange-500 to-red-500"
    },
    {
        name: "MakeMyTrip",
        description: "Flight + Hotel combos and holiday packages.",
        url: "https://www.makemytrip.com/holidays-india/sikkim-travel-packages.html",
        color: "from-red-600 to-pink-600"
    },
    {
        name: "Thomas Cook",
        description: "Premium guided tours and family vacation packages.",
        url: "https://www.thomascook.in/holidays/india-tour-packages/sikkim-tour-packages",
        color: "from-yellow-500 to-amber-600"
    }
];

export const BookingOptions = () => {
    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 mt-12 sm:mt-20 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 sm:mb-16">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-2 h-10 bg-[#FF5733] rounded-full" />
                        <div className="absolute inset-0 w-2 h-10 bg-[#FF5733] rounded-full blur-md opacity-50" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Book Your Trip</h2>
                        <p className="text-xs text-ai-muted uppercase tracking-[0.3em] mt-1">Ready for your Adventure?</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {bookingSites.map((site, index) => (
                    <motion.a
                        key={site.name}
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.6 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -10 }}
                        className="group relative overflow-hidden rounded-[2.5rem] bg-white/[0.03] border border-white/10 p-8 sm:p-10 transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:bg-white/[0.05] hover:border-white/20"
                    >
                        <div className={`absolute -right-10 -bottom-10 w-40 h-40 bg-gradient-to-br ${site.color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500`} />

                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-6">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all duration-500">
                                    <Globe className="w-8 h-8 text-white/40 group-hover:text-white transition-colors" />
                                </div>
                                <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10 group-hover:border-white/20 transition-all duration-500">
                                    <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white" />
                                </div>
                            </div>

                            <h3 className="text-2xl sm:text-3xl font-black text-white mb-4 tracking-tight group-hover:text-ai-accent transition-colors">
                                {site.name}
                            </h3>
                            <p className="text-gray-400 text-base sm:text-lg leading-relaxed font-medium">
                                {site.description}
                            </p>
                        </div>
                    </motion.a>
                ))}
            </div>
        </div>
    );
};
