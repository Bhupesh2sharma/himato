import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Car } from 'lucide-react';
import { getDestinationCoordinates } from '../data/sikkimDestinations';

// Fix for Leaflet default marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Marker for "Premium" look
const createCustomIcon = (index: number) => {
    return L.divIcon({
        className: 'custom-pin',
        html: `<div style="
            background-color: #00f2ff;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid #000;
            box-shadow: 0 0 10px #00f2ff;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #000;
            font-weight: bold;
            font-size: 12px;
        ">${index + 1}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
    });
};

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

interface ItineraryMapProps {
    days: DayPlan[];
    selectedDay?: number;
}

// Component to handle map interactions (FlyTo)
const MapController = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 13, {
                duration: 2,
                easeLinearity: 0.25
            });
        }
    }, [center, map]);
    return null;
};

export const ItineraryMap = ({ days, selectedDay }: ItineraryMapProps) => {
    // 1. Extract valid coordinates from the itinerary
    const routePoints: { lat: number; lng: number; title: string; day: number; locationRaw: string }[] = [];

    days.forEach(day => {
        day.activities.forEach(act => {
            const coords = getDestinationCoordinates(act.location);
            if (coords) {
                routePoints.push({
                    lat: coords.lat,
                    lng: coords.lng,
                    title: act.title,
                    day: day.day,
                    locationRaw: act.location
                });
            }
        });
    });

    // Calculate center based on selected day or default to Gangtok
    const activePoint = selectedDay
        ? routePoints.find(p => p.day === selectedDay)
        : routePoints[0];

    const mapCenter: [number, number] = activePoint
        ? [activePoint.lat, activePoint.lng]
        : [27.3314, 88.6138]; // Default Gangtok

    // Polyline positions
    const polylinePositions = routePoints.map(p => [p.lat, p.lng] as [number, number]);

    return (
        <div className="h-[400px] sm:h-[500px] w-full rounded-2xl overflow-hidden border border-ai-accent/30 shadow-2xl relative group">

            {/* Map Container */}
            <MapContainer
                center={mapCenter}
                zoom={10}
                style={{ height: '100%', width: '100%', background: '#0f172a' }}
                scrollWheelZoom={false}
            >
                {/* Dark Mode Tiles (CartoDB Dark Matter) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <MapController center={mapCenter} />

                {/* Route Line */}
                <Polyline
                    positions={polylinePositions}
                    pathOptions={{ color: '#00f2ff', weight: 3, opacity: 0.6, dashArray: '10, 10' }}
                />

                {/* Markers */}
                {routePoints.map((point, idx) => (
                    <Marker
                        key={`${point.day}-${idx}`}
                        position={[point.lat, point.lng]}
                        icon={createCustomIcon(idx)}
                    >
                        <Popup className="glass-popup">
                            <div className="p-2 min-w-[200px]">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-ai-accent text-black text-xs font-bold px-2 py-0.5 rounded-full">Day {point.day}</span>
                                    <h3 className="font-bold text-sm">{point.locationRaw}</h3>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{point.title}</p>

                                {/* Vehicle Tip Mockup */}
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                                        <Car className="w-3 h-3" />
                                        <span>Travel Tip</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1">
                                        Roads in this area can be steep. SUV (Innova/Xylo) recommended.
                                    </p>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Overlay Gradient for "Cinematic" feel */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] z-[400]" />

            {/* Floating Label */}
            <div className="absolute top-4 left-4 z-[400] bg-black/80 backdrop-blur border border-white/10 px-4 py-2 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-ai-accent animate-pulse" />
                <span className="text-xs text-ai-accent font-medium tracking-wider uppercase">Interactive Route Map</span>
            </div>
        </div>
    );
};
