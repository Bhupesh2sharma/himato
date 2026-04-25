
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

    const totalActivities = displayData.days.reduce((sum, d) => sum + d.activities.length, 0);

    return (
        <article className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6" itemScope itemType="https://schema.org/TouristTrip">
            <BusinessShareModal
                isOpen={showBusinessModal}
                onClose={() => setShowBusinessModal(false)}
                data={data}
                itineraryId={itineraryId}
            />

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-ai-muted mb-2">Your Sikkim Itinerary</p>
                    <h2 className="text-3xl sm:text-5xl text-ai-text leading-tight" style={{ fontWeight: 600 }}>
                        {data.days.length}-Day<br />
                        <em className="not-italic" style={{ color: '#2f4a3a' }}>Himalayan Journey</em>
                    </h2>
                    {/* Trip stats */}
                    <div className="flex items-center gap-5 mt-4">
                        <div className="flex items-center gap-2 text-ai-muted text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>{data.days.length} days</span>
                        </div>
                        <div className="w-px h-4 bg-black/10" />
                        <div className="flex items-center gap-2 text-ai-muted text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>{totalActivities} activities</span>
                        </div>
                        <div className="w-px h-4 bg-black/10" />
                        <div className="flex items-center gap-2 text-ai-muted text-sm">
                            <Navigation className="w-4 h-4" />
                            <span>Sikkim, India</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 shrink-0">
                    {canEdit && !isEditing && (
                        <button onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/10 text-ai-text text-sm font-medium hover:border-ai-accent hover:text-ai-accent transition-all bg-white">
                            <Edit2 className="w-4 h-4" /><span>Edit</span>
                        </button>
                    )}
                    {isEditing && (
                        <>
                            <button onClick={handleCancel} disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/10 text-ai-text text-sm font-medium bg-white transition-all disabled:opacity-50">
                                <X className="w-4 h-4" /><span>Cancel</span>
                            </button>
                            <button onClick={handleSave} disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-50"
                                style={{ background: '#2f4a3a' }}>
                                {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                <span>{isSaving ? 'Saving…' : 'Save'}</span>
                            </button>
                        </>
                    )}
                    <button onClick={() => setShowBusinessModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/10 text-ai-text text-sm font-medium hover:border-ai-accent hover:text-ai-accent transition-all bg-white whitespace-nowrap">
                        <Briefcase className="w-4 h-4" /><span>Share as Business</span>
                    </button>
                    <button onClick={shareLink}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/10 text-sm font-medium transition-all bg-white whitespace-nowrap"
                        style={shared ? { color: '#2f4a3a', borderColor: '#2f4a3a' } : { color: '#0e1116' }}>
                        {shared ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                        <span>{shared ? 'Copied!' : 'Share'}</span>
                    </button>
                    <button onClick={copyToClipboard}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/10 text-sm font-medium transition-all bg-white whitespace-nowrap"
                        style={copied ? { color: '#2f4a3a', borderColor: '#2f4a3a' } : { color: '#0e1116' }}>
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                    </button>
                </div>
            </div>

            {/* ── Sticky Day Tabs ── */}
            <div className="sticky top-0 z-30 bg-ai-dark/90 backdrop-blur-md border-b border-black/8 -mx-4 px-4 mb-8" style={{ backdropFilter: 'blur(12px)' }}>
                <div className="flex gap-1 overflow-x-auto no-scrollbar py-3">
                    {displayData.days.map((day) => (
                        <button
                            key={day.day}
                            onClick={() => {
                                setActiveDay(day.day);
                                dayRefs.current.get(day.day)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                            className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                            style={activeDay === day.day
                                ? { background: '#2f4a3a', color: '#f6f1e7' }
                                : { background: 'transparent', color: '#6b7280', border: '1px solid rgba(0,0,0,0.1)' }
                            }
                        >
                            Day {day.day}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_420px] gap-8 relative">
                {/* ── Left: Days ── */}
                <motion.div className="space-y-16 pb-24" initial="hidden" animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
                    {displayData.days.map((day, dayIndex) => (
                        <motion.section
                            key={day.day}
                            ref={(el) => { if (el) dayRefs.current.set(day.day, el); else dayRefs.current.delete(day.day); }}
                            variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                            itemScope itemType="https://schema.org/TouristDestination"
                            onMouseEnter={() => !isEditing && setActiveDay(day.day)}
                        >
                            {/* Day header */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center justify-center w-12 h-12 rounded-2xl text-white text-sm font-bold shrink-0"
                                    style={{ background: activeDay === day.day ? '#2f4a3a' : '#e8e3da' }}>
                                    <span style={{ color: activeDay === day.day ? '#f6f1e7' : '#6b7280' }}>{day.day}</span>
                                </div>
                                <div className="flex-1">
                                    {isEditing ? (
                                        <input type="text" value={day.title}
                                            onChange={(e) => updateDay(dayIndex, { ...day, title: e.target.value })}
                                            className="w-full bg-white border border-black/10 rounded-xl px-4 py-2 text-xl text-ai-text font-semibold focus:outline-none focus:border-ai-accent" />
                                    ) : (
                                        <h3 className="text-xl sm:text-2xl text-ai-text font-semibold leading-snug" itemProp="name">{day.title}</h3>
                                    )}
                                    <p className="text-xs text-ai-muted mt-0.5">{day.activities.length} activities</p>
                                </div>
                            </div>

                            {/* Activities */}
                            <div className="space-y-4 pl-4 border-l-2 ml-6" style={{ borderColor: activeDay === day.day ? '#2f4a3a' : '#e8e3da' }}>
                                {day.activities.map((activity, activityIndex) => (
                                    <motion.div
                                        key={activityIndex}
                                        itemScope itemType="https://schema.org/TouristAttraction"
                                        className="group relative bg-white rounded-2xl border border-black/8 p-5 transition-all duration-300 hover:shadow-md hover:border-black/15 overflow-hidden"
                                        variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                                    >
                                        {/* Activity number watermark */}
                                        <span className="absolute top-3 right-4 text-5xl font-black text-black/[0.04] select-none leading-none italic">
                                            {activityIndex + 1}
                                        </span>

                                        {isEditing ? (
                                            <div className="space-y-4">
                                                <input type="text" value={activity.title}
                                                    onChange={(e) => updateActivity(dayIndex, activityIndex, 'title', e.target.value)}
                                                    className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-lg text-ai-text font-semibold focus:outline-none focus:border-ai-accent" />
                                                <div className="grid sm:grid-cols-2 gap-3">
                                                    <div className="flex items-center gap-2 bg-black/5 px-4 py-2.5 rounded-xl border border-black/10">
                                                        <Clock className="w-4 h-4 text-ai-accent shrink-0" />
                                                        <input type="text" value={activity.time}
                                                            onChange={(e) => updateActivity(dayIndex, activityIndex, 'time', e.target.value)}
                                                            className="flex-1 bg-transparent text-sm text-ai-text focus:outline-none" placeholder="09:00 AM" />
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-black/5 px-4 py-2.5 rounded-xl border border-black/10">
                                                        <MapPin className="w-4 h-4 text-ai-accent shrink-0" />
                                                        <input type="text" value={activity.location}
                                                            onChange={(e) => updateActivity(dayIndex, activityIndex, 'location', e.target.value)}
                                                            className="flex-1 bg-transparent text-sm text-ai-text focus:outline-none" placeholder="Location" />
                                                    </div>
                                                </div>
                                                <textarea value={activity.description}
                                                    onChange={(e) => updateActivity(dayIndex, activityIndex, 'description', e.target.value)}
                                                    className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-sm text-ai-text focus:outline-none focus:border-ai-accent resize-y min-h-[100px]" />
                                            </div>
                                        ) : (
                                            <div>
                                                <h4 className="text-lg font-semibold text-ai-text mb-3 leading-snug pr-8" itemProp="name">
                                                    {activity.title}
                                                </h4>
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full" style={{ background: 'rgba(47,74,58,0.1)', color: '#2f4a3a' }}>
                                                        <Clock className="w-3 h-3" />{activity.time}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-black/5 text-ai-muted">
                                                        <MapPin className="w-3 h-3" />{activity.location}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-ai-muted leading-relaxed" itemProp="description">{activity.description}</p>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    ))}

                    {/* Book flights CTA */}
                    <a href="https://www.google.com/travel/flights?q=flights+to+Bagdogra" target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-sm font-semibold text-white transition-all hover:opacity-90"
                        style={{ background: '#2f4a3a' }}>
                        <Navigation className="w-4 h-4" />
                        Book Flights to Bagdogra (NJP)
                    </a>
                </motion.div>

                {/* ── Right: Map ── */}
                <div className="lg:sticky lg:top-24 h-[420px] lg:h-[calc(100vh-130px)] rounded-2xl overflow-hidden border border-black/10">
                    <ItineraryMap routeData={routeData || { days: [] }} selectedDay={activeDay} />
                </div>
            </div>
        </article>
    );
};
