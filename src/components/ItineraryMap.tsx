import { useEffect, useState, useMemo } from 'react';
import { GoogleMap, LoadScript, Polyline, Marker, InfoWindow } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Libraries array must be defined outside component to prevent recreation
const MAP_LIBRARIES: ('geometry' | 'drawing' | 'places' | 'visualization')[] = ['geometry'];

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

interface RouteStop {
    lat: number;
    lng: number;
    label: string;
    place_id?: string;
}

interface RouteDay {
    day: number;
    polyline: string | null;
    stops: RouteStop[];
    eta_minutes: number | null;
    total_distance_km: number | null;
}

interface RouteData {
    days: RouteDay[];
}

interface ItineraryMapProps {
    routeData?: RouteData;
    days: DayPlan[];
    selectedDay?: number;
}

// Dark theme map styles
const darkMapStyles = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
    },
    {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
    },
    {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#263c3f' }]
    },
    {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#6b9a76' }]
    },
    {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#38414e' }]
    },
    {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#212a37' }]
    },
    {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9ca5b3' }]
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#746855' }]
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#1f2835' }]
    },
    {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#f3d19c' }]
    },
    {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{ color: '#2f3948' }]
    },
    {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
    },
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#17263c' }]
    },
    {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#515c6d' }]
    },
    {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#17263c' }]
    }
];

// Decode polyline string to LatLngLiteral array
function decodePolyline(encoded: string): google.maps.LatLngLiteral[] {
    const poly: google.maps.LatLngLiteral[] = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
        let b;
        let shift = 0;
        let result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        poly.push({ lat: lat * 1e-5, lng: lng * 1e-5 });
    }
    return poly;
}

// Create custom marker icon
function createMarkerIcon(index: number): google.maps.Icon {
    return {
        url: `data:image/svg+xml;base64,${btoa(`
            <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="#00f2ff" stroke="#000" stroke-width="2"/>
                <text x="16" y="20" font-family="Arial" font-size="12" font-weight="bold" fill="#000" text-anchor="middle">${index + 1}</text>
            </svg>
        `)}`,
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 16),
    };
}

export const ItineraryMap = ({ routeData, days, selectedDay }: ItineraryMapProps) => {
    const [selectedMarker, setSelectedMarker] = useState<{ day: number; index: number } | null>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Calculate map center and bounds
    const { center, bounds } = useMemo(() => {
        if (!routeData || !routeData.days || routeData.days.length === 0) {
            return {
                center: { lat: 27.3314, lng: 88.6138 }, // Default to Gangtok
                bounds: null
            };
        }

        // Filter by selected day if provided
        const daysToShow = selectedDay
            ? routeData.days.filter(d => d.day === selectedDay)
            : routeData.days;

        if (daysToShow.length === 0) {
            return {
                center: { lat: 27.3314, lng: 88.6138 },
                bounds: null
            };
        }

        // Collect all stops from visible days
        const allStops: RouteStop[] = [];
        daysToShow.forEach(day => {
            allStops.push(...day.stops);
        });

        if (allStops.length === 0) {
            return {
                center: { lat: 27.3314, lng: 88.6138 },
                bounds: null
            };
        }

        // Calculate bounds
        const lats = allStops.map(s => s.lat);
        const lngs = allStops.map(s => s.lng);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        const center = {
            lat: (minLat + maxLat) / 2,
            lng: (minLng + maxLng) / 2
        };

        let bounds: google.maps.LatLngBounds | null = null;
        if (typeof google !== 'undefined' && google.maps && google.maps.LatLngBounds) {
            bounds = new google.maps.LatLngBounds(
                { lat: minLat, lng: minLng },
                { lat: maxLat, lng: maxLng }
            );
        }

        return { center, bounds };
    }, [routeData, selectedDay]);

    // Fit bounds when map or bounds change
    useEffect(() => {
        if (map && bounds) {
            map.fitBounds(bounds, 50);
        } else if (map && center) {
            map.setCenter(center);
            map.setZoom(10);
        }
    }, [map, bounds, center]);

    // Get visible days
    const visibleDays = useMemo(() => {
        if (!routeData || !routeData.days) return [];
        return selectedDay
            ? routeData.days.filter(d => d.day === selectedDay)
            : routeData.days;
    }, [routeData, selectedDay]);

    // Monitor console.error calls for ApiTargetBlockedMapError - MUST be before early returns
    useEffect(() => {
        // Monitor console.error calls
        const originalConsoleError = console.error;
        console.error = (...args) => {
            const errorMsg = args.map(a => String(a)).join(' ');
            if (errorMsg.includes('ApiTargetBlockedMapError')) {
                // Set error state to show user-friendly message
                // Use setTimeout to defer state update to avoid calling setState during render
                setTimeout(() => {
                    setLoadError('API_KEY_RESTRICTED');
                }, 0);
            }
            originalConsoleError.apply(console, args);
        };

        return () => {
            console.error = originalConsoleError;
        };
    }, []);

    // Handle script load success
    const handleScriptLoad = () => {
        if (!isScriptLoaded) {
            setIsScriptLoaded(true);
            setLoadError(null);
        }
    };

    // Handle script load error
    const handleScriptError = (error: Error) => {
        const errorMessage = error.message || 'Unknown error';
        setIsScriptLoaded(false);
        if (errorMessage.includes('ApiTargetBlockedMapError') || errorMessage.includes('API_KEY_INVALID')) {
            setLoadError('Google Maps API key is invalid or restricted. Please check your API key configuration.');
        } else {
            setLoadError('Failed to load Google Maps. Please check your API key and network connection.');
        }
        console.error('Google Maps script load error:', error);
    };

    if (!GOOGLE_MAPS_API_KEY) {
        return (
            <div className="h-[400px] sm:h-[500px] w-full rounded-2xl overflow-hidden border border-ai-accent/30 shadow-2xl flex items-center justify-center bg-ai-card">
                <p className="text-ai-muted">Google Maps API key not configured</p>
            </div>
        );
    }

    if (loadError) {
        const isApiKeyRestricted = loadError === 'API_KEY_RESTRICTED';
        return (
            <div className="h-[400px] sm:h-[500px] w-full rounded-2xl overflow-hidden border border-ai-accent/30 shadow-2xl flex items-center justify-center bg-ai-card">
                <div className="text-center max-w-md px-4">
                    <p className="text-red-400 mb-2 font-bold">Google Maps API Key Restricted</p>
                    {isApiKeyRestricted ? (
                        <div className="text-ai-muted text-sm space-y-2">
                            <p>The API key has HTTP referrer restrictions that don't include this domain.</p>
                            <p className="mt-3 font-semibold text-white">To fix:</p>
                            <ol className="list-decimal list-inside text-left space-y-1 mt-2">
                                <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-ai-accent underline">Google Cloud Console</a></li>
                                <li>Select your API key</li>
                                <li>Under "Application restrictions" → "HTTP referrers"</li>
                                <li>Add: <code className="bg-black/50 px-1 rounded">localhost:5173/*</code> or <code className="bg-black/50 px-1 rounded">localhost:*</code></li>
                                <li>Save and wait 1-2 minutes for changes to propagate</li>
                            </ol>
                            <p className="mt-3 text-xs">Current URL: <code className="bg-black/50 px-1 rounded">{typeof window !== 'undefined' ? window.location.href : 'N/A'}</code></p>
                        </div>
                    ) : (
                        <p className="text-ai-muted text-sm">{loadError}</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-[400px] sm:h-[500px] w-full rounded-2xl overflow-hidden border border-ai-accent/30 shadow-2xl relative group">
            <LoadScript
                googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                libraries={MAP_LIBRARIES}
                onLoad={handleScriptLoad}
                onError={handleScriptError}
                loadingElement={
                    <div className="h-full w-full flex items-center justify-center bg-ai-card">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-ai-accent/20 border-t-ai-accent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-ai-muted">Loading map...</p>
                        </div>
                    </div>
                }
            >
                {isScriptLoaded && !loadError ? (
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={center}
                        zoom={10}
                        options={{
                            styles: darkMapStyles,
                            disableDefaultUI: false,
                            zoomControl: true,
                            streetViewControl: false,
                            mapTypeControl: false,
                            fullscreenControl: true,
                        }}
                        onLoad={(mapInstance) => {
                            setMap(mapInstance);
                        }}
                    >
                        {visibleDays.map((routeDay) => {
                            // Decode polyline if available
                            let path: google.maps.LatLngLiteral[] = [];
                            if (routeDay.polyline) {
                                try {
                                    path = decodePolyline(routeDay.polyline);
                                } catch (error) {
                                    console.error('Error decoding polyline:', error);
                                }
                            }

                            return (
                                <div key={routeDay.day}>
                                    {/* Render route polyline */}
                                    {path.length > 0 && (
                                        <Polyline
                                            path={path}
                                            options={{
                                                strokeColor: '#00f2ff',
                                                strokeWeight: 4,
                                                strokeOpacity: 0.8,
                                                icons: [{
                                                    icon: {
                                                        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                                    },
                                                    offset: '100%',
                                                    repeat: '100px',
                                                }],
                                            }}
                                        />
                                    )}

                                    {/* Render markers for stops */}
                                    {routeDay.stops.map((stop, index) => (
                                        <Marker
                                            key={`${routeDay.day}-${index}`}
                                            position={{ lat: stop.lat, lng: stop.lng }}
                                            icon={createMarkerIcon(index)}
                                            onClick={() => setSelectedMarker({ day: routeDay.day, index })}
                                            title={stop.label}
                                        >
                                            {selectedMarker?.day === routeDay.day && selectedMarker?.index === index && (
                                                <InfoWindow
                                                    onCloseClick={() => setSelectedMarker(null)}
                                                >
                                                    <div className="p-2 min-w-[200px]">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="bg-ai-accent text-black text-xs font-bold px-2 py-0.5 rounded-full">
                                                                Day {routeDay.day}
                                                            </span>
                                                            <h3 className="font-bold text-sm">{stop.label}</h3>
                                                        </div>
                                                        {routeDay.eta_minutes && index === routeDay.stops.length - 1 && (
                                                            <div className="mt-2 pt-2 border-t border-gray-200">
                                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                                                                    <span>🚗 ETA: {routeDay.eta_minutes} min</span>
                                                                </div>
                                                                {routeDay.total_distance_km && (
                                                                    <p className="text-[10px] text-gray-500 mt-1">
                                                                        Distance: {routeDay.total_distance_km} km
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </InfoWindow>
                                            )}
                                        </Marker>
                                    ))}
                                </div>
                            );
                        })}
                    </GoogleMap>
                ) : loadError ? (
                    <div className="h-full w-full flex items-center justify-center bg-ai-card">
                        <div className="text-center">
                            <p className="text-red-400 mb-2">Failed to load map</p>
                            <p className="text-ai-muted text-sm">{loadError}</p>
                        </div>
                    </div>
                ) : null}
            </LoadScript>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] z-[400]" />

            {/* Floating Label */}
            <div className="absolute top-4 left-4 z-[400] bg-black/80 backdrop-blur border border-white/10 px-4 py-2 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-ai-accent animate-pulse" />
                <span className="text-xs text-ai-accent font-medium tracking-wider uppercase">
                    Interactive Route Map
                </span>
            </div>
        </div>
    );
};
