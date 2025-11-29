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
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 mt-8 sm:mt-12">
            <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                <div className="w-1.5 sm:w-2 h-6 sm:h-8 bg-ai-accent rounded-full animate-pulse" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">Book Your Trip</h2>
            </div>

            <p className="text-ai-muted mb-6 sm:mb-8 text-sm sm:text-base">
                Ready to go? Explore packages from these trusted travel partners.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {bookingSites.map((site, index) => (
                    <motion.a
                        key={site.name}
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="group relative overflow-hidden rounded-xl bg-ai-card border border-white/5 hover:border-white/20 transition-all duration-300"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-r ${site.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                        <div className="p-4 sm:p-6 relative z-10 flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base sm:text-xl font-bold text-white mb-1 sm:mb-2 group-hover:text-ai-accent transition-colors flex items-center gap-2 flex-wrap">
                                    <span className="break-words">{site.name}</span>
                                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-400 break-words">{site.description}</p>
                            </div>
                            <div className="p-2 sm:p-3 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors flex-shrink-0">
                                <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-ai-muted group-hover:text-white transition-colors" />
                            </div>
                        </div>
                    </motion.a>
                ))}
            </div>
        </div>
    );
};
