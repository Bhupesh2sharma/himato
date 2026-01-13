import { useEffect, useState, useMemo, useRef, Fragment } from 'react';
import { GoogleMap, LoadScript, Polyline, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Libraries array must be defined outside component to prevent recreation
const MAP_LIBRARIES: ('geometry' | 'drawing' | 'places' | 'visualization')[] = ['geometry'];

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
    const color = "#00f2ff";
    const svg = `
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <!-- Outer Glow -->
            <circle cx="20" cy="20" r="14" fill="${color}" fill-opacity="0.2" filter="url(#glow)"/>
            <!-- Main Circle -->
            <circle cx="20" cy="20" r="10" fill="${color}" stroke="white" stroke-width="2"/>
            <!-- Inner Number -->
            <text x="20" y="24" font-family="Inter, system-ui, sans-serif" font-size="10" font-weight="900" fill="black" text-anchor="middle">${index + 1}</text>
        </svg>
    `;

    return {
        url: `data:image/svg+xml;base64,${btoa(svg)}`,
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 20),
    };
}

export const ItineraryMap = ({ routeData, selectedDay }: ItineraryMapProps) => {
    const [selectedMarker, setSelectedMarker] = useState<{ day: number; index: number } | null>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const previousSelectedDayRef = useRef<number | undefined>(undefined);
    const isInitialLoadRef = useRef<boolean>(true);
    const [directionsResults, setDirectionsResults] = useState<{ [key: string]: google.maps.DirectionsResult | null }>({});
    const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);

    // Debug: Log routeData
    useEffect(() => {
        console.log('[ItineraryMap] routeData:', routeData);
        console.log('[ItineraryMap] routeData?.days:', routeData?.days);
        console.log('[ItineraryMap] selectedDay:', selectedDay);
    }, [routeData, selectedDay]);

    // Calculate initial map center and bounds for all routes
    const { initialCenter, initialBounds } = useMemo(() => {
        if (!routeData || !routeData.days || routeData.days.length === 0) {
            return {
                initialCenter: { lat: 27.3314, lng: 88.6138 }, // Default to Gangtok
                initialBounds: null
            };
        }

        // Collect all stops from all days
        const allStops: RouteStop[] = [];
        routeData.days.forEach(day => {
            allStops.push(...day.stops);
        });

        if (allStops.length === 0) {
            return {
                initialCenter: { lat: 27.3314, lng: 88.6138 },
                initialBounds: null
            };
        }

        // Calculate bounds for all routes
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

        return { initialCenter: center, initialBounds: bounds };
    }, [routeData]);

    // Calculate bounds for selected day (for smooth panning)
    const selectedDayBounds = useMemo(() => {
        if (!routeData || !routeData.days || !selectedDay) return null;

        const selectedRouteDay = routeData.days.find(d => d.day === selectedDay);
        if (!selectedRouteDay || selectedRouteDay.stops.length === 0) return null;

        const lats = selectedRouteDay.stops.map(s => s.lat);
        const lngs = selectedRouteDay.stops.map(s => s.lng);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        if (typeof google !== 'undefined' && google.maps && google.maps.LatLngBounds) {
            return new google.maps.LatLngBounds(
                { lat: minLat, lng: minLng },
                { lat: maxLat, lng: maxLng }
            );
        }

        return null;
    }, [routeData, selectedDay]);

    // Initial map setup
    useEffect(() => {
        if (map && initialBounds && isInitialLoadRef.current) {
            map.fitBounds(initialBounds, 50);
            isInitialLoadRef.current = false;
        } else if (map && initialCenter && isInitialLoadRef.current && !initialBounds) {
            map.setCenter(initialCenter);
            map.setZoom(10);
            isInitialLoadRef.current = false;
        }
    }, [map, initialBounds, initialCenter]);

    // Smooth pan/zoom to selected day route (without re-rendering)
    useEffect(() => {
        if (!map || !selectedDayBounds || isInitialLoadRef.current) return;
        if (previousSelectedDayRef.current === selectedDay) return;

        previousSelectedDayRef.current = selectedDay;

        // Calculate center of selected day route
        const center = selectedDayBounds.getCenter();
        const currentZoom = map.getZoom() || 10;

        // Pan to the selected day's center, maintaining a reasonable zoom level
        // Use a zoom that's not too close (to keep other routes visible) but focused
        const targetZoom = Math.min(currentZoom, 12); // Cap at zoom level 12 to keep other routes visible

        if (center) {
            map.panTo({ lat: center.lat(), lng: center.lng() });
            if (currentZoom > targetZoom) {
                map.setZoom(targetZoom);
            }
        } else {
            // Fallback to fitBounds if center is not available
            map.fitBounds(selectedDayBounds, 80); // Larger padding to keep other routes visible
        }
    }, [map, selectedDayBounds, selectedDay]);

    // Show all days' routes (not filtered by selectedDay)
    const visibleDays = useMemo(() => {
        console.log('[ItineraryMap] Computing visibleDays, routeData:', routeData);
        if (!routeData || !routeData.days || !Array.isArray(routeData.days)) {
            console.warn('[ItineraryMap] No routeData or invalid days array');
            return [];
        }
        // Filter out days with no stops
        const filtered = routeData.days.filter(day => {
            const hasStops = day.stops && Array.isArray(day.stops) && day.stops.length > 0;
            if (!hasStops) {
                console.warn(`[ItineraryMap] Day ${day.day} has no stops`);
            }
            return hasStops;
        });
        console.log(`[ItineraryMap] visibleDays: ${filtered.length} days with stops out of ${routeData.days.length} total days`);
        return filtered;
    }, [routeData]);

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

    // Initialize Directions Service when map loads
    useEffect(() => {
        if (map && typeof google !== 'undefined' && google.maps && !directionsServiceRef.current) {
            directionsServiceRef.current = new google.maps.DirectionsService();
        }
    }, [map]);

    // Fetch routes using Directions Service for days without polylines
    useEffect(() => {
        if (!map || !directionsServiceRef.current || !routeData?.days) return;

        const fetchMissingRoutes = async () => {
            const newResults: { [key: string]: google.maps.DirectionsResult | null } = {};

            for (const routeDay of routeData.days) {
                const dayKey = `day-${routeDay.day}`;

                // Skip if we already have a result or if polyline exists
                if (directionsResults[dayKey] || routeDay.polyline) continue;

                // Skip if we don't have enough stops
                if (!routeDay.stops || routeDay.stops.length < 2) continue;

                try {
                    const origin = routeDay.stops[0];
                    const destination = routeDay.stops[routeDay.stops.length - 1];
                    const waypoints = routeDay.stops.slice(1, -1).map(stop => ({
                        location: new google.maps.LatLng(stop.lat, stop.lng),
                        stopover: true
                    }));

                    await new Promise<void>((resolve) => {
                        directionsServiceRef.current!.route(
                            {
                                origin: new google.maps.LatLng(origin.lat, origin.lng),
                                destination: new google.maps.LatLng(destination.lat, destination.lng),
                                waypoints: waypoints.length > 0 ? waypoints : undefined,
                                travelMode: google.maps.TravelMode.DRIVING,
                                optimizeWaypoints: false,
                            },
                            (result, status) => {
                                if (status === google.maps.DirectionsStatus.OK && result) {
                                    newResults[dayKey] = result;
                                } else {
                                    console.warn(`Directions request failed for day ${routeDay.day}:`, status);
                                    newResults[dayKey] = null;
                                }
                                resolve();
                            }
                        );
                    });
                } catch (error) {
                    console.error(`Error fetching directions for day ${routeDay.day}:`, error);
                    newResults[dayKey] = null;
                }
            }

            if (Object.keys(newResults).length > 0) {
                setDirectionsResults(prev => ({ ...prev, ...newResults }));
            }
        };

        fetchMissingRoutes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, routeData]); // directionsResults is intentionally excluded to avoid infinite loops

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
                        center={initialCenter}
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
                        {visibleDays && visibleDays.length > 0 && visibleDays.map((routeDay) => {
                            console.log(`[ItineraryMap] Rendering day ${routeDay.day}:`, {
                                hasPolyline: !!routeDay.polyline,
                                stopsCount: routeDay.stops?.length,
                                stops: routeDay.stops
                            });

                            // Decode polyline if available
                            let path: google.maps.LatLngLiteral[] = [];
                            let hasValidPolyline = false;

                            if (routeDay.polyline) {
                                try {
                                    path = decodePolyline(routeDay.polyline);
                                    hasValidPolyline = path.length >= 2;
                                    console.log(`[ItineraryMap] Day ${routeDay.day} decoded polyline:`, path.length, 'points');
                                } catch (error) {
                                    console.error(`Error decoding polyline for day ${routeDay.day}:`, error);
                                    hasValidPolyline = false;
                                }
                            }

                            // Check if we have a directions result for this day (fallback when polyline is missing)
                            const dayKey = `day-${routeDay.day}`;
                            const directionsResult = directionsResults[dayKey];
                            const hasDirectionsResult = !!directionsResult;

                            // Highlight active day route with different styling
                            const isActiveDay = selectedDay === routeDay.day;
                            const strokeColor = isActiveDay ? '#00f2ff' : '#00a0b0';
                            const strokeWeight = isActiveDay ? 6 : 3;
                            const strokeOpacity = isActiveDay ? 1.0 : 0.6;

                            return (
                                <Fragment key={`route-day-${routeDay.day}`}>
                                    {/* Render route using Polyline if we have a decoded polyline */}
                                    {hasValidPolyline && (
                                        <Polyline
                                            path={path}
                                            options={{
                                                strokeColor: strokeColor,
                                                strokeWeight: strokeWeight,
                                                strokeOpacity: strokeOpacity,
                                                zIndex: isActiveDay ? 10 : 5,
                                                geodesic: false, // Use actual route path, not geodesic
                                                icons: [{
                                                    icon: {
                                                        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                                        scale: isActiveDay ? 5 : 4,
                                                        fillColor: strokeColor,
                                                        fillOpacity: strokeOpacity,
                                                        strokeColor: '#000',
                                                        strokeWeight: 1,
                                                    },
                                                    offset: '100%',
                                                    repeat: '100px',
                                                }],
                                            }}
                                            onLoad={(polyline) => {
                                                console.log(`[ItineraryMap] Polyline loaded for day ${routeDay.day}`, polyline);
                                            }}
                                        />
                                    )}

                                    {/* Render route using DirectionsRenderer if we don't have polyline but have directions result */}
                                    {!hasValidPolyline && hasDirectionsResult && (
                                        <DirectionsRenderer
                                            directions={directionsResult}
                                            options={{
                                                polylineOptions: {
                                                    strokeColor: strokeColor,
                                                    strokeWeight: strokeWeight,
                                                    strokeOpacity: strokeOpacity,
                                                    zIndex: isActiveDay ? 10 : 5,
                                                    icons: [{
                                                        icon: {
                                                            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                                            scale: isActiveDay ? 5 : 4,
                                                            fillColor: strokeColor,
                                                            fillOpacity: strokeOpacity,
                                                            strokeColor: '#000',
                                                            strokeWeight: 1,
                                                        },
                                                        offset: '100%',
                                                        repeat: '100px',
                                                    }],
                                                },
                                                suppressMarkers: true, // We render our own markers
                                                preserveViewport: false,
                                            }}
                                        />
                                    )}

                                    {/* Log warning if we have no route data */}
                                    {(() => {
                                        if (!hasValidPolyline && !hasDirectionsResult && routeDay.stops && routeDay.stops.length >= 2) {
                                            console.warn(`[ItineraryMap] Day ${routeDay.day} has no polyline and no directions result - route will not be displayed`);
                                        }
                                        return null;
                                    })()}

                                    {/* Render markers for stops */}
                                    {routeDay.stops && routeDay.stops.length > 0 && routeDay.stops.map((stop, index) => (
                                        <Marker
                                            key={`marker-${routeDay.day}-${index}`}
                                            position={{ lat: stop.lat, lng: stop.lng }}
                                            icon={createMarkerIcon(index)}
                                            onClick={() => setSelectedMarker({ day: routeDay.day, index })}
                                            title={stop.label}
                                            zIndex={isActiveDay ? 100 : 50}
                                        >
                                            {selectedMarker?.day === routeDay.day && selectedMarker?.index === index && (
                                                <InfoWindow
                                                    onCloseClick={() => setSelectedMarker(null)}
                                                >
                                                    <div className="p-2 min-w-[200px] text-black">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="bg-[#00f2ff] text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                                Day {routeDay.day}
                                                            </span>
                                                            <h3 className="font-bold text-sm text-black">{stop.label}</h3>
                                                        </div>
                                                        {routeDay.eta_minutes && index === routeDay.stops.length - 1 && (
                                                            <div className="mt-2 pt-2 border-t border-gray-100">
                                                                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                                                                    <span>🚗 ETA: {routeDay.eta_minutes} min</span>
                                                                </div>
                                                                {routeDay.total_distance_km && (
                                                                    <p className="text-[10px] text-gray-400 mt-1">
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
                                </Fragment>
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
