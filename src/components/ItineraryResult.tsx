
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Navigation, Copy, Check, Link as LinkIcon, Briefcase, Edit2, Save, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { encodeItineraryToUrl } from '../utils/sharing';
import { BusinessShareModal } from './BusinessShareModal';
import { ItineraryMap } from './ItineraryMap';
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

interface RouteData {
    days: Array<{
        day: number;
        polyline: string | null;
        stops: Array<{ lat: number; lng: number; label: string; place_id?: string }>;
        eta_minutes: number | null;
        total_distance_km: number | null;
    }>;
}

interface ItineraryResultProps {
    data: {
        days: DayPlan[];
    } | null;
    routeData?: RouteData | null;
    itineraryId?: string | null;
}



export const ItineraryResult = ({ data, routeData, itineraryId }: ItineraryResultProps) => {
    const { isAuthenticated } = useAuth();
    const [copied, setCopied] = useState(false);
    const [shared, setShared] = useState(false);
    const [showBusinessModal, setShowBusinessModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState<{ days: DayPlan[] } | null>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [activeDay, setActiveDay] = useState<number>(1);
    const dayRefs = useRef<Map<number, HTMLElement>>(new Map());

    // Scroll-based active day detection using IntersectionObserver
    useEffect(() => {
        if (!data || !data.days || isEditing) return;

        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px', // Trigger when section is in the top 20-40% of viewport
            threshold: [0, 0.25, 0.5, 0.75, 1],
        };

        const observers: IntersectionObserver[] = [];
        let activeSection: number | null = null;
        let updateTimer: ReturnType<typeof setTimeout> | null = null;

        const updateActiveDay = (dayNumber: number) => {
            if (activeSection !== dayNumber) {
                activeSection = dayNumber;
                setActiveDay((prevDay) => {
                    return prevDay !== dayNumber ? dayNumber : prevDay;
                });
            }
        };

        // Wait for refs to be populated before creating observers
        const timeoutId = setTimeout(() => {
            data.days.forEach((day) => {
                const element = dayRefs.current.get(day.day);
                if (!element) return;

                const observer = new IntersectionObserver((entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
                            if (updateTimer) {
                                clearTimeout(updateTimer);
                            }

                            // Debounce updates to avoid rapid changes
                            updateTimer = setTimeout(() => {
                                let maxRatio = 0;
                                let maxDay = day.day;

                                data.days.forEach((checkDay) => {
                                    const checkElement = dayRefs.current.get(checkDay.day);
                                    if (checkElement) {
                                        const checkRect = checkElement.getBoundingClientRect();
                                        const viewportHeight = window.innerHeight;
                                        const checkTop = checkRect.top;

                                        const visibleTop = Math.max(0, -checkTop);
                                        const visibleBottom = Math.min(checkRect.height, viewportHeight - checkTop);
                                        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
                                        const ratio = visibleHeight / checkRect.height;

                                        if (ratio > maxRatio && checkTop < viewportHeight * 0.5) {
                                            maxRatio = ratio;
                                            maxDay = checkDay.day;
                                        }
                                    }
                                });

                                updateActiveDay(maxDay);
                            }, 100);
                        }
                    });
                }, observerOptions);

                observer.observe(element);
                observers.push(observer);
            });
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            if (updateTimer) {
                clearTimeout(updateTimer);
            }
            observers.forEach((observer) => observer.disconnect());
        };
    }, [data, isEditing]);

    // Add structured data for itinerary
    useEffect(() => {
        if (!data || !data.days) return;

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

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 sm:mb-16">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-2 h-10 bg-ai-accent rounded-full" />
                        <div className="absolute inset-0 w-2 h-10 bg-ai-accent rounded-full blur-md opacity-50" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">AI Generated Plan</h2>
                        <p className="text-xs text-ai-muted uppercase tracking-[0.3em] mt-1">Curated Himalayan Experience</p>
                    </div>
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

            <div className="grid lg:grid-cols-2 gap-8 relative">
                {/* Left Column: Itinerary Details */}
                {/* Left Column: Itinerary Details */}
                <motion.div
                    className="space-y-6 sm:space-y-12 order-1 lg:order-1 pb-20"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: {
                            transition: {
                                staggerChildren: 0.15
                            }
                        }
                    }}
                >
                    {displayData.days.map((day, dayIndex) => (
                        <motion.section
                            key={day.day}
                            ref={(el) => {
                                if (el) {
                                    dayRefs.current.set(day.day, el);
                                } else {
                                    dayRefs.current.delete(day.day);
                                }
                            }}
                            variants={{
                                hidden: { opacity: 0, y: 30 },
                                visible: { opacity: 1, y: 0 }
                            }}
                            itemScope
                            itemType="https://schema.org/TouristDestination"
                            className={`relative pl-8 sm:pl-12 md:pl-16 border-l transition-all duration-700 ${activeDay === day.day ? 'border-ai-accent' : 'border-white/10'}`}
                            onMouseEnter={() => !isEditing && setActiveDay(day.day)}
                            onClick={() => !isEditing && setActiveDay(day.day)}
                        >
                            {/* Animated Timeline Point */}
                            <div className="absolute -left-[1px] top-0 h-full w-[2px] overflow-hidden">
                                <motion.div
                                    className="w-full h-full bg-ai-accent"
                                    initial={{ y: "-100%" }}
                                    animate={{ y: activeDay === day.day ? "0%" : "-100%" }}
                                    transition={{ duration: 0.8, ease: "circOut" }}
                                />
                            </div>

                            <div className={`absolute -left-[6px] top-0 w-3 h-3 rounded-full transition-all duration-500 z-10 ${activeDay === day.day ? 'bg-ai-accent scale-150 shadow-[0_0_20px_#00f2ff]' : 'bg-white/20'}`} />

                            <div className="mb-8">
                                <h3 className="text-2xl sm:text-4xl font-black text-white mb-3 flex items-center gap-6" itemProp="name">
                                    <div className={`flex items-center gap-2 px-5 py-2 rounded-xl transition-all duration-500 ${activeDay === day.day ? 'bg-ai-accent text-ai-dark shadow-[0_10px_30px_rgba(0,242,255,0.2)]' : 'bg-white/5 text-ai-muted grayscale'}`}>
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Day {day.day}</span>
                                    </div>
                                    <span className={`transition-all duration-500 flex-1 ${activeDay === day.day ? 'opacity-100 translate-x-0' : 'opacity-40 -translate-x-4'}`}>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={day.title}
                                                onChange={(e) => updateDay(dayIndex, { ...day, title: e.target.value })}
                                                className="w-full bg-white/5 border-b border-white/20 rounded-none px-0 py-2 text-white focus:outline-none focus:border-ai-accent"
                                            />
                                        ) : (
                                            day.title
                                        )}
                                    </span>
                                </h3>
                            </div>

                            <motion.div
                                className="space-y-4"
                                variants={{
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.1
                                        }
                                    }
                                }}
                            >
                                {day.activities.map((activity, activityIndex) => (
                                    <motion.div
                                        key={activityIndex}
                                        itemScope
                                        itemType="https://schema.org/TouristAttraction"
                                        className={`group relative p-6 sm:p-10 rounded-[2.5rem] transition-all duration-700 overflow-hidden ${activeDay === day.day ? 'bg-white/[0.03] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]' : 'bg-transparent border border-transparent opacity-30 scale-[0.98]'}`}
                                        variants={{
                                            hidden: { opacity: 0, scale: 0.95 },
                                            visible: { opacity: 1, scale: 1 }
                                        }}
                                        whileHover={activeDay === day.day ? { y: -8, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)' } : {}}
                                    >
                                        {/* Stylized Badge for Activity Index */}
                                        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                                            <span className="text-[6rem] font-black leading-none select-none italic text-white">{activityIndex + 1}</span>
                                        </div>

                                        {isEditing ? (
                                            <div className="space-y-6 relative z-10">
                                                <input
                                                    type="text"
                                                    value={activity.title}
                                                    onChange={(e) => updateActivity(dayIndex, activityIndex, 'title', e.target.value)}
                                                    className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 text-2xl text-white font-black focus:outline-none focus:border-ai-accent"
                                                    placeholder="Activity title"
                                                />
                                                <div className="grid sm:grid-cols-2 gap-4">
                                                    <div className="flex items-center gap-3 bg-black/40 p-4 rounded-2xl border border-white/5">
                                                        <Clock className="w-5 h-5 text-ai-accent" />
                                                        <input
                                                            type="text"
                                                            value={activity.time}
                                                            onChange={(e) => updateActivity(dayIndex, activityIndex, 'time', e.target.value)}
                                                            className="flex-1 bg-transparent text-sm text-gray-200 focus:outline-none"
                                                            placeholder="09:00 AM"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-3 bg-black/40 p-4 rounded-2xl border border-white/5">
                                                        <MapPin className="w-5 h-5 text-ai-accent" />
                                                        <input
                                                            type="text"
                                                            value={activity.location}
                                                            onChange={(e) => updateActivity(dayIndex, activityIndex, 'location', e.target.value)}
                                                            className="flex-1 bg-transparent text-sm text-gray-200 focus:outline-none"
                                                            placeholder="Location"
                                                        />
                                                    </div>
                                                </div>
                                                <textarea
                                                    value={activity.description}
                                                    onChange={(e) => updateActivity(dayIndex, activityIndex, 'description', e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-6 py-6 text-base text-gray-400 focus:outline-none focus:border-ai-accent resize-y min-h-[160px]"
                                                    placeholder="Describe the magical experience..."
                                                />
                                            </div>
                                        ) : (
                                            <div className="relative z-10">
                                                <div className="flex flex-col gap-6 mb-8">
                                                    <h4 className="font-black text-2xl sm:text-4xl text-white group-hover:text-ai-accent transition-all duration-500 leading-[1.1]" itemProp="name">
                                                        {activity.title}
                                                    </h4>

                                                    <div className="flex flex-wrap items-center gap-4">
                                                        <div className="flex items-center gap-3 bg-ai-accent/10 px-4 py-2 rounded-full border border-ai-accent/20 backdrop-blur-md">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-ai-accent animate-pulse" />
                                                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-ai-accent">{activity.time}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                                                            <MapPin className="w-3.5 h-3.5 text-white/40" aria-hidden="true" />
                                                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">{activity.location}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-gray-400 text-lg sm:text-xl leading-relaxed font-medium max-w-2xl" itemProp="description">
                                                    {activity.description}
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.section>
                    ))}
                </motion.div>

                {/* Right Column: Interactive Map */}
                <div className="lg:order-2 lg:h-[calc(100vh-120px)] lg:sticky lg:top-24 h-[400px] sm:h-[500px]">
                    <ItineraryMap routeData={routeData || { days: [] }} selectedDay={activeDay} />
                </div>
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
        </article >
    );
};
