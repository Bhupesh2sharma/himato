
interface Destination {
    name: string;
    lat: number;
    lng: number;
    description?: string;
    image?: string;
}

interface RouteInfo {
    from: string;
    to: string;
    distance: string;
    duration: string;
    roadCondition: 'Smooth' | 'Moderate' | 'Rough' | 'Steep';
    recommendedVehicle: string;
}

export const SIKKIM_DESTINATIONS: Record<string, Destination> = {
    // East Sikkim
    "Gangtok": { name: "Gangtok", lat: 27.3314, lng: 88.6138, description: "Capital city, vibrant MG Marg" },
    "Tsomgo Lake": { name: "Tsomgo Lake", lat: 27.3742, lng: 88.7629, description: "Glacial lake, yak rides" },
    "Nathula Pass": { name: "Nathula Pass", lat: 27.3875, lng: 88.8310, description: "Indo-China border" },
    "Baba Mandir": { name: "Baba Mandir", lat: 27.3622, lng: 88.8225, description: "Legendary shrine" },
    "Zuluk": { name: "Zuluk", lat: 27.2518, lng: 88.7774, description: "Zig-zag roads, Silk Route" },

    // North Sikkim
    "Lachen": { name: "Lachen", lat: 27.7167, lng: 88.5500, description: "Gateway to Gurudongmar" },
    "Gurudongmar Lake": { name: "Gurudongmar Lake", lat: 28.0167, lng: 88.7000, description: "Sacred high altitude lake" },
    "Lachung": { name: "Lachung", lat: 27.6891, lng: 88.7430, description: "Mountain village, Yumthang base" },
    "Yumthang Valley": { name: "Yumthang Valley", lat: 27.8188, lng: 88.7047, description: "Valley of Flowers" },

    // West Sikkim
    "Pelling": { name: "Pelling", lat: 27.3175, lng: 88.2430, description: "Kanchenjunga views, skywalk" },
    "Yuksom": { name: "Yuksom", lat: 27.3725, lng: 88.2230, description: "First capital, trekking base" },
    "Ravangla": { name: "Ravangla", lat: 27.3060, lng: 88.3630, description: "Buddha Park" },

    // South Sikkim
    "Namchi": { name: "Namchi", lat: 27.1664, lng: 88.3524, description: "Char Dham, Samdruptse" },

    // Default / Airport
    "Bagdogra": { name: "Bagdogra", lat: 26.6846, lng: 88.3268, description: "Nearest Airport" },
    "Pakyong": { name: "Pakyong", lat: 27.2346, lng: 88.5916, description: "Sikkim's Airport" }
};

export const ROUTE_TIPS: Record<string, RouteInfo> = {
    "Bagdogra-Gangtok": {
        from: "Bagdogra",
        to: "Gangtok",
        distance: "125 km",
        duration: "4-5 hrs",
        roadCondition: "Moderate",
        recommendedVehicle: "Innova / Xylo"
    },
    "Gangtok-Tsomgo Lake": {
        from: "Gangtok",
        to: "Tsomgo Lake",
        distance: "40 km",
        duration: "2-3 hrs",
        roadCondition: "Steep",
        recommendedVehicle: "Mahindra Maxx / Bolero (Permit Required)"
    },
    "Gangtok-Lachen": {
        from: "Gangtok",
        to: "Lachen",
        distance: "120 km",
        duration: "6-7 hrs",
        roadCondition: "Rough",
        recommendedVehicle: "Tata Sumo / Bolero (High Clearance)"
    },
    "Lachen-Gurudongmar Lake": {
        from: "Lachen",
        to: "Gurudongmar Lake",
        distance: "66 km",
        duration: "3-4 hrs",
        roadCondition: "Rough",
        recommendedVehicle: "Xylo / Scorpio (4x4 preferred)"
    }
};

// Helper to find coordinates for a possibly messy AI-generated place name
export const getDestinationCoordinates = (query: string): Destination | null => {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const q = normalize(query);

    // Direct match check
    for (const [key, dest] of Object.entries(SIKKIM_DESTINATIONS)) {
        if (normalize(key) === q || q.includes(normalize(key))) {
            return dest;
        }
    }

    // Fallback: Default to Gangtok if it looks like a "start" point, or null
    return null;
};
