
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Copy, Check, Link as LinkIcon, Edit2, Save, X, Phone, Sun, Backpack, ShieldCheck, Sparkles, Send, Loader2, BedDouble, Mountain, CheckCircle2, Landmark, Waves, Car, UtensilsCrossed, ShoppingBag, Footprints } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { encodeItineraryToUrl } from '../utils/sharing';
import { SendToAgentModal } from './SendToAgentModal';
import { DownloadItineraryButton } from './DownloadItineraryButton';
import { Highlighted } from './Highlighted';
import { stripHighlights } from '../utils/highlights';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { track } from "../utils/analytics"
interface Activity {
    time: string;
    title: string;
    description: string;
    location: string;
}

interface DayPlan {
    day: number;
    title: string;
    overnightStay?: string;
    altitude?: string;
    activities: Activity[];
}

interface ItineraryResultProps {
    data: {
        days: DayPlan[];
        tripSummary?: string;
        bestTime?: string;
        permits?: string[];
        packingList?: string[];
    } | null;
    itineraryId?: string | null;
    onItineraryChange?: (data: any) => void;
}



// Small icon per stop so the timeline scans at a glance.
const ACTIVITY_ICONS: Array<[RegExp, LucideIcon]> = [
    [/drive|transfer|depart|arriv|airport|bagdogra|njp|road trip|en route/i, Car],
    [/monaster|gompa|temple|mandir|stupa|chorten|buddha|dham|church|shrine/i, Landmark],
    [/lake|falls|waterfall|river|hot spring|confluence/i, Waves],
    [/lunch|dinner|breakfast|caf[eé]|food|momo|thukpa|eat|tea garden|tasting/i, UtensilsCrossed],
    [/check.?in|hotel|homestay|overnight|acclimati|rest\b/i, BedDouble],
    [/pass|peak|view ?point|sunrise|sunset|summit|snow|zero point/i, Mountain],
    [/market|shopping|bazaar|marg\b/i, ShoppingBag],
    [/trek|hike|walk|stroll|skywalk|ropeway|trail/i, Footprints],
];

const activityIcon = (activity: Activity): LucideIcon =>
    ACTIVITY_ICONS.find(([re]) => re.test(`${activity.title} ${activity.location}`))?.[1] ?? MapPin;

export const ItineraryResult = ({ data, itineraryId, onItineraryChange }: ItineraryResultProps) => {
    const { isAuthenticated } = useAuth();
    const [refineText, setRefineText] = useState('');
    const [refining, setRefining] = useState(false);
    const [refineNote, setRefineNote] = useState('');
    const [refineError, setRefineError] = useState('');
    const [copied, setCopied] = useState(false);
    const [shared, setShared] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [showSendModal, setShowSendModal] = useState(false);
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
                text += `${stripHighlights(activity.description)} \n\n`;
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

    // Short link (himato.in/<code>) for saved itineraries; long ?plan= link otherwise.
    const buildShareUrl = async (): Promise<string> => {
        if (!itineraryId) return encodeItineraryToUrl(data);
        const res = await apiClient.createShortLink(itineraryId, data);
        return `${window.location.origin}/${res.data.slug}`;
    };

    const shareLink = async () => {
        if (sharing) return;
        setSharing(true);
        try {
            // Hand the clipboard a pending promise so Safari keeps the user gesture
            // while we wait for the server; fall back to writeText elsewhere.
            if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
                const blob = buildShareUrl().then((url) => new Blob([url], { type: 'text/plain' }));
                await navigator.clipboard.write([new ClipboardItem({ 'text/plain': blob })]);
            } else {
                await navigator.clipboard.writeText(await buildShareUrl());
            }
            setShared(true);
            track('share_link_copied', { itinerary_id: itineraryId ?? 'guest' });
            setTimeout(() => setShared(false), 2000);
        } catch (err) {
            console.error('Failed to share:', err);
        } finally {
            setSharing(false);
        }
    };

    const totalActivities = displayData.days.reduce((sum, d) => sum + d.activities.length, 0);

    const handleRefine = async () => {
        const instruction = refineText.trim();
        if (!instruction || refining || !data) return;
        setRefining(true);
        setRefineError('');
        setRefineNote('');
        try {
            const res = await apiClient.editItinerary({ itineraryData: data, instruction });
            if (res.status === 'success') {
                onItineraryChange?.(res.data.itinerary);
                setRefineNote(res.data.note || 'Updated your itinerary.');
                setRefineText('');
            }
        } catch (err: any) {
            setRefineError(err.message || "Couldn't apply that change. Try rephrasing.");
        } finally {
            setRefining(false);
        }
    };

    // Overnight stops in order, collapsing repeats — e.g. Gangtok → Lachung → Gangtok
    const stays = displayData.days
        .map((d) => d.overnightStay?.trim())
        .filter((s): s is string => !!s)
        .filter((s, i, arr) => i === 0 || s !== arr[i - 1]);

    const hasEssentials = !!(data.bestTime || data.permits?.length || data.packingList?.length);

    const toolbarBtn = 'flex items-center gap-2 px-3.5 py-2 text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-60';

    const essentials = hasEssentials && (
        <div className="bg-white rounded-2xl border border-black/[0.07] divide-y divide-black/[0.06]">
            {data.bestTime && (
                <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <Sun className="w-4 h-4 text-ai-accent" />
                        <p className="text-[11px] font-bold uppercase tracking-wider text-ai-muted">Best time to go</p>
                    </div>
                    <p className="text-sm text-ai-text leading-relaxed"><Highlighted text={data.bestTime} auto={false} /></p>
                </div>
            )}
            {data.permits && data.permits.length > 0 && (
                <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-4 h-4 text-ai-accent" />
                        <p className="text-[11px] font-bold uppercase tracking-wider text-ai-muted">Permits needed</p>
                    </div>
                    <ul className="space-y-2">
                        {data.permits.map((p, i) => (
                            <li key={i} className="text-sm text-ai-text leading-relaxed"><Highlighted text={p} /></li>
                        ))}
                    </ul>
                </div>
            )}
            {data.packingList && data.packingList.length > 0 && (
                <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Backpack className="w-4 h-4 text-ai-accent" />
                        <p className="text-[11px] font-bold uppercase tracking-wider text-ai-muted">Pack this</p>
                    </div>
                    <ul className="space-y-2">
                        {data.packingList.map((item, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-ai-text leading-snug">
                                <CheckCircle2 className="w-4 h-4 text-ai-accent/70 shrink-0 mt-px" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );

    return (
        <article className="w-full" itemScope itemType="https://schema.org/TouristTrip">
            {/* ── Header ── */}
            <header className="mb-8 sm:mb-10">
                <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-ai-accent mb-3">Your Sikkim itinerary</p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl text-ai-text leading-[1.1] tracking-tight" style={{ fontWeight: 600 }}>
                    {data.days.length}-Day <span className="text-ai-accent">Himalayan Journey</span>
                </h2>
                {data.tripSummary && (
                    <p className="mt-3 text-base sm:text-lg text-ai-muted leading-relaxed max-w-3xl">{data.tripSummary}</p>
                )}

                <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Trip stats */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ai-muted">
                        <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-ai-accent" />{data.days.length} days</span>
                        <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-ai-accent" />{totalActivities} stops</span>
                        {stays.length > 0 && (
                            <span className="flex items-center gap-2 min-w-0">
                                <BedDouble className="w-4 h-4 text-ai-accent shrink-0" />
                                <span className="truncate">{stays.length === 1 ? `Based in ${stays[0]}` : stays.join(' → ')}</span>
                            </span>
                        )}
                    </div>

                    {/* Actions — one grouped toolbar */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
                        {canEdit && !isEditing && (
                            <button onClick={() => setIsEditing(true)}
                                className={`${toolbarBtn} rounded-xl border border-black/10 bg-white text-ai-text hover:border-ai-accent hover:text-ai-accent`}>
                                <Edit2 className="w-4 h-4" />Edit
                            </button>
                        )}
                        {isEditing && (
                            <>
                                <button onClick={handleCancel} disabled={isSaving}
                                    className={`${toolbarBtn} rounded-xl border border-black/10 bg-white text-ai-text hover:bg-black/5`}>
                                    <X className="w-4 h-4" />Cancel
                                </button>
                                <button onClick={handleSave} disabled={isSaving}
                                    className={`${toolbarBtn} rounded-xl bg-ai-accent text-white hover:bg-ai-secondary`}>
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {isSaving ? 'Saving…' : 'Save changes'}
                                </button>
                            </>
                        )}
                        <div className="flex items-center rounded-xl border border-black/10 bg-white divide-x divide-black/10 overflow-hidden shrink-0">
                            <button onClick={shareLink} disabled={sharing}
                                className={`${toolbarBtn} ${shared ? 'text-ai-accent' : 'text-ai-text hover:bg-black/[0.03]'}`}>
                                {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : shared ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                                {sharing ? 'Creating link…' : shared ? 'Link copied' : 'Share'}
                            </button>
                            <button onClick={copyToClipboard}
                                className={`${toolbarBtn} ${copied ? 'text-ai-accent' : 'text-ai-text hover:bg-black/[0.03]'}`}>
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                            <DownloadItineraryButton
                                data={data}
                                label="PDF"
                                className={`${toolbarBtn} text-ai-text hover:bg-black/[0.03]`}
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Essentials first on small screens; they live in the sidebar on desktop */}
            {essentials && <div className="lg:hidden mb-8">{essentials}</div>}

            <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-8 lg:gap-10">
                {/* ── Main column: day tabs + timeline ── */}
                <div className="min-w-0">
                    <div className="sticky top-0 z-30 -mx-4 px-4 sm:mx-0 sm:px-0 bg-ai-dark/90 backdrop-blur-md border-b border-black/[0.08] mb-6">
                        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-3">
                            {displayData.days.map((day) => (
                                <button
                                    key={day.day}
                                    onClick={() => {
                                        setActiveDay(day.day);
                                        dayRefs.current.get(day.day)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors border ${activeDay === day.day
                                        ? 'bg-ai-accent text-ai-dark border-ai-accent'
                                        : 'bg-white/60 text-ai-muted border-black/10 hover:text-ai-text'}`}
                                >
                                    Day {day.day}
                                    {day.overnightStay && <span className={`font-normal ${activeDay === day.day ? 'text-ai-dark/70' : 'text-ai-muted/80'}`}> · {day.overnightStay}</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {displayData.days.map((day, dayIndex) => (
                            <motion.section
                                key={day.day}
                                ref={(el) => { if (el) dayRefs.current.set(day.day, el); else dayRefs.current.delete(day.day); }}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="scroll-mt-20 bg-white rounded-3xl border border-black/[0.07] overflow-hidden"
                                itemScope itemType="https://schema.org/TouristDestination"
                                onMouseEnter={() => !isEditing && setActiveDay(day.day)}
                            >
                                {/* Day header */}
                                <div className="flex items-start gap-4 px-5 sm:px-7 pt-6 pb-5 border-b border-black/[0.06]">
                                    <div className={`w-12 h-12 shrink-0 rounded-2xl flex flex-col items-center justify-center transition-colors ${activeDay === day.day ? 'bg-ai-accent text-ai-dark' : 'bg-ai-accent/10 text-ai-accent'}`}>
                                        <span className="text-[9px] font-bold uppercase tracking-wider leading-none opacity-80">Day</span>
                                        <span className="text-lg font-bold leading-tight">{day.day}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {isEditing ? (
                                            <input type="text" value={day.title}
                                                onChange={(e) => updateDay(dayIndex, { ...day, title: e.target.value })}
                                                className="w-full bg-ai-dark/60 border border-black/10 rounded-xl px-4 py-2 text-lg text-ai-text font-semibold focus:outline-none focus:border-ai-accent" />
                                        ) : (
                                            <h3 className="text-lg sm:text-xl text-ai-text font-semibold leading-snug" itemProp="name">{day.title}</h3>
                                        )}
                                        {(day.overnightStay || day.altitude) && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {day.overnightStay && (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ai-muted">
                                                        <BedDouble className="w-3.5 h-3.5 text-ai-accent" />Overnight in {day.overnightStay}
                                                    </span>
                                                )}
                                                {day.altitude && (
                                                    <span className="inline-flex items-start gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-ai-saffron/10 text-[#8a4a12] leading-snug">
                                                        <Mountain className="w-3.5 h-3.5 shrink-0 mt-px" />{day.altitude}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Timeline */}
                                <ol className="px-5 sm:px-7 py-2">
                                    {day.activities.map((activity, activityIndex) => {
                                        const isLast = activityIndex === day.activities.length - 1;
                                        const Icon = activityIcon(activity);
                                        return (
                                            <li key={activityIndex} className="relative flex gap-4 py-4"
                                                itemScope itemType="https://schema.org/TouristAttraction">
                                                {/* Rail + icon */}
                                                <div className="relative flex flex-col items-center shrink-0">
                                                    <span className="w-9 h-9 rounded-full bg-ai-dark text-ai-accent flex items-center justify-center">
                                                        <Icon className="w-4 h-4" />
                                                    </span>
                                                    {!isLast && <span className="absolute top-10 -bottom-4 w-px bg-black/10" />}
                                                </div>

                                                <div className="flex-1 min-w-0 pt-0.5">
                                                    {isEditing ? (
                                                        <div className="space-y-3">
                                                            <input type="text" value={activity.title}
                                                                onChange={(e) => updateActivity(dayIndex, activityIndex, 'title', e.target.value)}
                                                                className="w-full bg-ai-dark/60 border border-black/10 rounded-xl px-4 py-2.5 text-base text-ai-text font-semibold focus:outline-none focus:border-ai-accent" />
                                                            <div className="grid sm:grid-cols-2 gap-3">
                                                                <div className="flex items-center gap-2 bg-ai-dark/60 px-4 py-2.5 rounded-xl border border-black/10">
                                                                    <Clock className="w-4 h-4 text-ai-accent shrink-0" />
                                                                    <input type="text" value={activity.time}
                                                                        onChange={(e) => updateActivity(dayIndex, activityIndex, 'time', e.target.value)}
                                                                        className="flex-1 min-w-0 bg-transparent text-sm text-ai-text focus:outline-none" placeholder="09:00 AM" />
                                                                </div>
                                                                <div className="flex items-center gap-2 bg-ai-dark/60 px-4 py-2.5 rounded-xl border border-black/10">
                                                                    <MapPin className="w-4 h-4 text-ai-accent shrink-0" />
                                                                    <input type="text" value={activity.location}
                                                                        onChange={(e) => updateActivity(dayIndex, activityIndex, 'location', e.target.value)}
                                                                        className="flex-1 min-w-0 bg-transparent text-sm text-ai-text focus:outline-none" placeholder="Location" />
                                                                </div>
                                                            </div>
                                                            <textarea value={activity.description}
                                                                onChange={(e) => updateActivity(dayIndex, activityIndex, 'description', e.target.value)}
                                                                className="w-full bg-ai-dark/60 border border-black/10 rounded-xl px-4 py-3 text-sm text-ai-text focus:outline-none focus:border-ai-accent resize-y min-h-[90px]" />
                                                            <p className="text-[11px] text-ai-muted">Tip: wrap a key detail in ==double equals== to highlight it.</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="flex flex-wrap items-center gap-x-2 text-xs">
                                                                <span className="font-semibold text-ai-accent tabular-nums">{activity.time}</span>
                                                                {activity.location && (
                                                                    <>
                                                                        <span className="text-black/20">•</span>
                                                                        <span className="text-ai-muted truncate">{activity.location}</span>
                                                                    </>
                                                                )}
                                                            </p>
                                                            <h4 className="mt-1 text-[15px] sm:text-base font-semibold text-ai-text leading-snug" itemProp="name">{activity.title}</h4>
                                                            <p className="mt-1.5 text-sm text-ai-muted leading-relaxed" itemProp="description">
                                                                <Highlighted text={activity.description} />
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ol>
                            </motion.section>
                        ))}
                    </div>
                </div>

                {/* ── Sidebar: essentials + tools ── */}
                <aside className="space-y-4">
                    {essentials && <div className="hidden lg:block">{essentials}</div>}

                    {/* Trip tools stay in view while scrolling the days */}
                    <div className="space-y-4 lg:sticky lg:top-6">
                        {/* Refine with AI */}
                        <div className="rounded-2xl border border-ai-accent/20 bg-ai-accent/[0.04] p-5">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Sparkles className="w-4 h-4 text-ai-accent" />
                                <h3 className="text-sm font-bold text-ai-text">Tweak this trip</h3>
                            </div>
                            <p className="text-xs text-ai-muted leading-relaxed mb-3">e.g. "make day 2 more relaxed" or "add a monastery on day 3".</p>
                            <textarea
                                value={refineText}
                                onChange={(e) => setRefineText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleRefine(); } }}
                                rows={2}
                                placeholder="What should change?"
                                disabled={refining}
                                className="w-full bg-white border border-black/10 rounded-xl px-3.5 py-2.5 text-sm text-ai-text placeholder:text-ai-muted/70 focus:outline-none focus:border-ai-accent resize-none disabled:opacity-60"
                            />
                            <button
                                onClick={handleRefine}
                                disabled={refining || !refineText.trim()}
                                className="mt-2 w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-ai-accent text-white text-sm font-semibold hover:bg-ai-secondary transition-colors disabled:opacity-50"
                            >
                                {refining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                {refining ? 'Updating…' : 'Update itinerary'}
                            </button>
                            {refineNote && <p className="mt-3 text-sm font-medium text-ai-accent flex items-start gap-1.5"><Check className="w-4 h-4 shrink-0 mt-0.5" />{refineNote}</p>}
                            {refineError && <p className="mt-3 text-sm text-red-600">{refineError}</p>}
                        </div>

                        {/* Send to a travel agent */}
                        <div className="rounded-2xl bg-ai-accent text-ai-dark p-5">
                            <h3 className="text-sm font-bold">Want this booked?</h3>
                            <p className="text-xs text-ai-dark/75 leading-relaxed mt-1 mb-4">Send it to local Sikkim agents and get a callback with quotes.</p>
                            <button onClick={() => setShowSendModal(true)}
                                className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-ai-dark text-ai-accent text-sm font-semibold hover:bg-white transition-colors">
                                <Phone className="w-4 h-4" />
                                Send to a travel agent
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

            <SendToAgentModal isOpen={showSendModal} onClose={() => setShowSendModal(false)} data={data} />
        </article>
    );
};
