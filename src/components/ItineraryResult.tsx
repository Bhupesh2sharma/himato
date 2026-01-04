
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Navigation, Copy, Check, Link as LinkIcon, Briefcase, Edit2, Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { encodeItineraryToUrl } from '../utils/sharing';
import { BusinessShareModal } from './BusinessShareModal';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Activity {
    time: string;
    title: string;
    description: string;
    location: string;
}

interface DayPlan {
    day: number;
    title: string;
    activities: Activity[];
}

interface ItineraryResultProps {
    data: {
        days: DayPlan[];
    } | null;
    itineraryId?: string | null;
}



export const ItineraryResult = ({ data, itineraryId }: ItineraryResultProps) => {
    const { isAuthenticated } = useAuth();
    const [copied, setCopied] = useState(false);
    const [shared, setShared] = useState(false);
    const [showBusinessModal, setShowBusinessModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState<{ days: DayPlan[] } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Add structured data for itinerary
    useEffect(() => {
        if (!data) return;

        const structuredData = {
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            "name": `Sikkim Travel Itinerary - ${data.days.length} Days`,
            "description": `AI-generated ${data.days.length}-day travel itinerary for Sikkim, India`,
            "touristType": "Tourist",
            "itinerary": data.days.map(day => ({
                "@type": "TouristDestination",
                "name": day.title,
                "description": day.activities.map(a => `${a.title} at ${a.location}`).join(", "),
                "containsPlace": day.activities.map(activity => ({
                    "@type": "TouristAttraction",
                    "name": activity.title,
                    "description": activity.description,
                    "address": {
                        "@type": "PostalAddress",
                        "addressLocality": activity.location,
                        "addressRegion": "Sikkim",
                        "addressCountry": "IN"
                    }
                }))
            }))
        };

        // Remove existing structured data script if any
        const existingScript = document.getElementById('itinerary-structured-data');
        if (existingScript) {
            existingScript.remove();
        }

        // Add new structured data
        const script = document.createElement('script');
        script.id = 'itinerary-structured-data';
        script.type = 'application/ld+json';
        script.text = JSON.stringify(structuredData);
        document.head.appendChild(script);

        return () => {
            const scriptToRemove = document.getElementById('itinerary-structured-data');
            if (scriptToRemove) {
                scriptToRemove.remove();
            }
        };
    }, [data]);

    // Initialize edited data when entering edit mode
    useEffect(() => {
        if (isEditing && data) {
            setEditedData(JSON.parse(JSON.stringify(data))); // Deep copy
        }
    }, [isEditing, data]);

    const handleSave = async () => {
        if (!editedData || !itineraryId) return;

        setIsSaving(true);
        try {
            await apiClient.updateItinerary(itineraryId, {
                itineraryData: editedData
            });

            // Update local data immediately
            if (data) {
                data.days = editedData.days;
            }

            setIsEditing(false);
            setEditedData(null);

            // Reload to get the latest version from server (includes updatedAt timestamp)
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (error: any) {
            console.error('Failed to update itinerary:', error);
            alert(error.message || 'Failed to update itinerary. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditedData(null);
        setIsEditing(false);
    };

    const updateDay = (dayIndex: number, updatedDay: DayPlan) => {
        if (!editedData) return;
        const newDays = [...editedData.days];
        newDays[dayIndex] = updatedDay;
        setEditedData({ ...editedData, days: newDays });
    };

    const updateActivity = (dayIndex: number, activityIndex: number, field: keyof Activity, value: string) => {
        if (!editedData) return;
        const newDays = [...editedData.days];
        const newActivities = [...newDays[dayIndex].activities];
        newActivities[activityIndex] = { ...newActivities[activityIndex], [field]: value };
        newDays[dayIndex] = { ...newDays[dayIndex], activities: newActivities };
        setEditedData({ ...editedData, days: newDays });
    };

    if (!data) return null;

    const displayData = isEditing && editedData ? editedData : data;
    const canEdit = isAuthenticated && itineraryId;

    const formatItinerary = () => {
        let text = "AI GENERATED TRAVEL ITINERARY\n";
        text += "=".repeat(50) + "\n\n";

        data.days.forEach((day) => {
            text += `DAY ${day.day}: ${day.title} \n`;
            text += "-".repeat(50) + "\n\n";

            day.activities.forEach((activity) => {
                text += `${activity.title} \n`;
                text += `Time: ${activity.time} \n`;
                text += `Location: ${activity.location} \n`;
                text += `${activity.description} \n\n`;
            });

            text += "\n";
        });

        text += "=".repeat(50) + "\n";
        text += "Generated by AI Travel Planner\n";

        return text;
    };

    const copyToClipboard = async () => {
        try {
            const formattedText = formatItinerary();
            await navigator.clipboard.writeText(formattedText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const shareLink = async () => {
        try {
            const url = encodeItineraryToUrl(data);
            await navigator.clipboard.writeText(url);
            setShared(true);
            setTimeout(() => setShared(false), 2000);
        } catch (err) {
            console.error('Failed to share:', err);
        }
    };

    return (
        <article className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6" itemScope itemType="https://schema.org/TouristTrip">
            <BusinessShareModal
                isOpen={showBusinessModal}
                onClose={() => setShowBusinessModal(false)}
                data={data}
                itineraryId={itineraryId}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-1.5 sm:w-2 h-6 sm:h-8 bg-ai-accent rounded-full animate-pulse" />
                    <h2 className="text-xl sm:text-2xl font-bold text-white">AI Generated Plan</h2>
                </div>

                <div className="flex flex-wrap gap-3">
                    {canEdit && (
                        <>
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-50"
                                    >
                                        <X className="w-4 h-4" />
                                        <span>Cancel</span>
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-4 py-2 bg-ai-accent hover:bg-ai-secondary border border-ai-accent rounded-lg text-white text-sm font-medium transition-all disabled:opacity-50"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                <span>Save Changes</span>
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-ai-accent/10 hover:bg-ai-accent/20 border border-ai-accent/30 hover:border-ai-accent rounded-lg text-ai-accent text-sm font-medium transition-all"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    <span>Edit</span>
                                </button>
                            )}
                        </>
                    )}
                    <button
                        onClick={() => setShowBusinessModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-ai-accent/10 hover:bg-ai-accent/20 border border-ai-accent/30 hover:border-ai-accent rounded-lg text-ai-accent text-sm font-medium transition-all hover:scale-105 group whitespace-nowrap"
                    >
                        <Briefcase className="w-4 h-4" />
                        <span>Share as Business</span>
                    </button>

                    <button
                        onClick={shareLink}
                        className="flex items-center gap-2 px-4 py-2 bg-ai-card hover:bg-ai-card/80 border border-ai-accent/30 hover:border-ai-accent rounded-lg text-white text-sm font-medium transition-all hover:scale-105 group whitespace-nowrap"
                    >
                        {shared ? (
                            <>
                                <Check className="w-4 h-4 text-ai-accent" />
                                <span className="text-ai-accent">Copied!</span>
                            </>
                        ) : (
                            <>
                                <LinkIcon className="w-4 h-4 group-hover:text-ai-accent transition-colors" />
                                <span>Share</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 px-4 py-2 bg-ai-card hover:bg-ai-card/80 border border-ai-accent/30 hover:border-ai-accent rounded-lg text-white text-sm font-medium transition-all hover:scale-105 group whitespace-nowrap"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 text-ai-accent" />
                                <span className="text-ai-accent">Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4 group-hover:text-ai-accent transition-colors" />
                                <span>Copy Text</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
                {displayData.days.map((day, dayIndex) => (
                    <section
                        key={day.day}
                        itemScope
                        itemType="https://schema.org/TouristDestination"
                        className="relative pl-4 sm:pl-6 md:pl-8 border-l-2 border-ai-muted/20"
                    >
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: dayIndex * 0.2 }}
                        >
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-ai-secondary border-4 border-ai-dark" />

                            <h3 className="text-lg sm:text-xl font-bold text-ai-accent mb-3 sm:mb-4 flex items-center gap-2 flex-wrap" itemProp="name">
                                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" aria-hidden="true" />
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={day.title}
                                        onChange={(e) => updateDay(dayIndex, { ...day, title: e.target.value })}
                                        className="flex-1 bg-white/5 border border-ai-accent/30 rounded px-2 py-1 text-ai-accent focus:outline-none focus:border-ai-accent"
                                    />
                                ) : (
                                    <span className="break-words">Day {day.day}: {day.title}</span>
                                )}
                            </h3>

                            <div className="space-y-3 sm:space-y-4">
                                {day.activities.map((activity, activityIndex) => (
                                    <div key={activityIndex} itemScope itemType="https://schema.org/TouristAttraction" className="glass p-3 sm:p-4 rounded-xl hover:bg-ai-card/60 transition-colors group">
                                        {isEditing ? (
                                            <div className="space-y-3">
                                                <input
                                                    type="text"
                                                    value={activity.title}
                                                    onChange={(e) => updateActivity(dayIndex, activityIndex, 'title', e.target.value)}
                                                    className="w-full bg-white/5 border border-ai-accent/30 rounded px-3 py-2 text-white font-bold focus:outline-none focus:border-ai-accent"
                                                    placeholder="Activity title"
                                                />
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <Clock className="w-4 h-4 text-ai-muted" />
                                                        <input
                                                            type="text"
                                                            value={activity.time}
                                                            onChange={(e) => updateActivity(dayIndex, activityIndex, 'time', e.target.value)}
                                                            className="flex-1 bg-white/5 border border-ai-accent/30 rounded px-3 py-2 text-sm text-ai-muted focus:outline-none focus:border-ai-accent"
                                                            placeholder="Time (e.g., 09:00 AM)"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <MapPin className="w-4 h-4 text-ai-muted" />
                                                        <input
                                                            type="text"
                                                            value={activity.location}
                                                            onChange={(e) => updateActivity(dayIndex, activityIndex, 'location', e.target.value)}
                                                            className="flex-1 bg-white/5 border border-ai-accent/30 rounded px-3 py-2 text-sm text-ai-muted focus:outline-none focus:border-ai-accent"
                                                            placeholder="Location"
                                                        />
                                                    </div>
                                                </div>
                                                <textarea
                                                    value={activity.description}
                                                    onChange={(e) => updateActivity(dayIndex, activityIndex, 'description', e.target.value)}
                                                    className="w-full bg-white/5 border border-ai-accent/30 rounded px-3 py-2 text-sm text-gray-400 focus:outline-none focus:border-ai-accent resize-y min-h-[100px]"
                                                    placeholder="Activity description"
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex flex-col gap-2 mb-2">
                                                    <h4 className="font-bold text-base sm:text-lg text-white group-hover:text-ai-accent transition-colors break-words" itemProp="name">
                                                        {activity.title}
                                                    </h4>
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-ai-muted">
                                                        <time className="flex items-center gap-1" itemProp="openingHoursSpecification">
                                                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" aria-hidden="true" />
                                                            <span className="break-words">{activity.time}</span>
                                                        </time>
                                                        <address className="flex items-center gap-1 not-italic" itemProp="address">
                                                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" aria-hidden="true" />
                                                            <span className="break-words">{activity.location}</span>
                                                        </address>
                                                    </div>
                                                </div>
                                                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed break-words" itemProp="description">{activity.description}</p>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </section>
                ))}
            </div>

            <div className="mt-6 sm:mt-8 flex justify-center px-4">
                <a
                    href="https://www.google.com/travel/flights?q=flights+to+Bagdogra"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-ai-secondary hover:bg-ai-secondary/80 rounded-full text-white text-sm sm:text-base font-bold transition-all hover:scale-105 w-full sm:w-auto justify-center"
                >
                    <Navigation className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="whitespace-nowrap">Book Flights to Bagdogra</span>
                </a>
            </div>
        </article>
    );
};
