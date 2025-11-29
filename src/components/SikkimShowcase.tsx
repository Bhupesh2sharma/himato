
import { motion } from 'framer-motion';
import { MapPin, Star } from 'lucide-react';

const destinations = [
    {
        name: "Gurudongmar Lake",
        height: "17,800 ft",
        rating: "4.9",
        image: "/gurudungmar.jpg",
        tags: ["Adventure", "Lake"]
    },
    {
        name: "Yumthang Valley",
        height: "11,693 ft",
        rating: "4.8",
        image: "/yumgthang.jpeg",
        tags: ["Nature", "Flowers"]
    },
    {
        name: "Ravangla Buddha Park",
        height: "7,000 ft",
        rating: "4.7",
        image: "/ravangla.jpg",
        tags: ["Spiritual", "Peace"]
    }
];

export const SikkimShowcase = () => {
    return (
        <div className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold mb-12 text-center">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-ai-accent to-ai-secondary">
                        Trending Destinations
                    </span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {destinations.map((dest, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group relative h-96 rounded-2xl overflow-hidden cursor-pointer"
                        >
                            <img
                                src={dest.image}
                                alt={dest.name}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-ai-dark via-ai-dark/50 to-transparent opacity-80" />

                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <div className="flex justify-between items-end mb-2">
                                    <h3 className="text-xl font-bold text-white">{dest.name}</h3>
                                    <div className="flex items-center gap-1 text-yellow-400">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="text-sm font-bold">{dest.rating}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-300 mb-4">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4 text-ai-accent" />
                                        {dest.height}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    {dest.tags.map(tag => (
                                        <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};
