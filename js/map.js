// Google Maps Logic (Detailed Route Visualization)
window.mapInstance = null;
window.routingControl = null;

const coords = {
    santiago: [-33.4489, -70.6693],
    miamiAirport: [25.7959, -80.2870],
    miamiPort: [25.7781, -80.1791],
    orlandoHome: [28.2612, -81.6317], // Champions Gate
    nassau: [25.0480, -77.3554],
    cococay: [25.8167, -77.9333],
    sanjuan: [18.4655, -66.1057],
    puertoplata: [19.7808, -70.6871],
    disneySprings: [28.3708, -81.5200],
    volcanoBay: [28.4723, -81.4729],
    epcot: [28.3747, -81.5494],
    universalStudios: [28.4743, -81.4678],
    islandsOfAdventure: [28.4710, -81.4712]
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initMap, 500);
});

function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // --- 1. SETUP MAP ---
    const startView = [10.0, -70.0];
    window.mapInstance = L.map('map').setView(startView, 3);

    L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(window.mapInstance);

    // --- 3. DRAW ROUTES ---
    const flightPath = [
        coords.santiago,
        [-10, -75],
        [15, -78],
        coords.miamiAirport
    ];
    L.polyline(flightPath, {
        color: '#3b82f6',
        weight: 3,
        dashArray: '10, 10',
        opacity: 0.7
    }).addTo(window.mapInstance).bindPopup("✈️ Vuelo AA912: SCL -> MIA");

    const roadPath = [
        coords.miamiAirport,
        [26.1, -80.2],
        [27.4, -80.4],
        coords.orlandoHome
    ];
    L.polyline(roadPath, {
        color: '#ef4444',
        weight: 4,
        opacity: 0.8
    }).addTo(window.mapInstance).bindPopup("🚗 Auto: Miami <-> Orlando");

    const cruisePath = [
        coords.miamiPort,
        coords.nassau,
        coords.cococay,
        [22, -68],
        coords.sanjuan,
        coords.puertoplata,
        coords.miamiPort
    ];
    L.polyline(cruisePath, {
        color: '#fbbf24',
        weight: 3,
        dashArray: '5, 5'
    }).addTo(window.mapInstance).bindPopup("🚢 Crucero Symphony of the Seas");


    // --- 4. MARKERS ---
    const locationDb = {
        "Aeropuerto SCL": coords.santiago,
        "Santiago, Chile": coords.santiago,
        "Miami International Airport": coords.miamiAirport,
        "Puerto de Miami": coords.miamiPort,
        "Miami Beach": [25.7907, -80.1300],
        "Miami": [25.7617, -80.1918],
        "Champions Gate": coords.orlandoHome,
        "Disney Springs": coords.disneySprings,

        // Disney Parks
        "Magic Kingdom": [28.4179, -81.5812],
        "Animal Kingdom": [28.3597, -81.5913],
        "Hollywood Studios": [28.3575, -81.5628],
        "Epcot": coords.epcot,

        // Universal
        "Universal CityWalk": [28.4743, -81.4678],
        "Universal Studios": coords.universalStudios,
        "Islands of Adventure": coords.islandsOfAdventure,
        "Volcano Bay": coords.volcanoBay,

        // Cruise
        "Nassau": coords.nassau,
        "CocoCay": coords.cococay,
        "San Juan": coords.sanjuan,
        "Puerto Plata": coords.puertoplata
    };

    const markersGroup = L.featureGroup([]);

    // Load Items (Core + User)
    let allItems = [...APP_DATA.itinerary];
    const local = localStorage.getItem('vacation_extra_activities');
    if (local) allItems = [...allItems, ...JSON.parse(local)];
    const deleted = JSON.parse(localStorage.getItem('vacation_deleted_items') || '[]');

    allItems.forEach(item => {
        // ID Generation if missing (same logic as app.js)
        if (!item.id) item.id = 'core_' + item.date.replace(/\s/g, '') + '_' + item.title.slice(0, 5).replace(/\s/g, '');

        if (deleted.includes(item.id)) return;

        let pos = null;

        // 1. Check for specific geocoded coordinates (User Smart Add)
        if (item.coordinates) {
            pos = item.coordinates;
        }
        // 2. Exact match in DB
        else if (locationDb[item.location]) {
            pos = locationDb[item.location];
        }
        // 3. Fuzzy search in DB
        else {
            for (const [k, v] of Object.entries(locationDb)) {
                if (item.title.includes(k) || item.location.includes(k)) {
                    pos = v;
                    break;
                }
            }
        }

        if (pos) {
            let iconChar = "📍";
            if (item.type === 'flight') iconChar = "✈️";
            if (item.type === 'park') iconChar = "🎢";
            if (item.type === 'cruise') iconChar = "🚢";
            if (item.type === 'home') iconChar = "🏠";

            const icon = L.divIcon({
                html: `<div style="font-size: 1.5rem; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));">${iconChar}</div>`,
                className: 'custom-map-icon',
                iconSize: [30, 30]
            });

            const m = L.marker(pos, { icon: icon })
                .bindPopup(`<b>${item.title}</b><br>${item.date}<br><button onclick="calculateRoute([${pos}])">Ir 🚗</button>`);

            m.addTo(window.mapInstance);
            markersGroup.addLayer(m);
        }
    });

    // Don't autofit to markers immediately because we want the "Grand View" of Chile initially.
    // Or we can fit bounds of the flight path.
    // Let's stick to the manually set view [10, -70] zoom 3 which covers N and S America well.
    // If user wants to see Orlando details, they zoom in or use "Search".

    // --- 5. SEARCH & ROUTING ---
    // (Same as before)
    // --- 5. SEARCH & ROUTING ---
    try {
        const searchControl = new GeoSearch.GeoSearchControl({
            provider: new GeoSearch.OpenStreetMapProvider(),
            style: 'bar',
            autoClose: true,
            searchLabel: 'Buscar en Google Maps...',
        });
        window.mapInstance.addControl(searchControl);
    } catch (e) { }

    // --- 6. CUSTOM ROUTE PLANNER ---
    const startSelect = document.getElementById('route-start');
    const endSelect = document.getElementById('route-end');
    const calcBtn = document.getElementById('btn-calc-route');

    // Create a Routing Database that includes EVERYTHING (Static + User Added)
    const routingDb = { ...locationDb };
    allItems.forEach(item => {
        if (item.coordinates) {
            const key = item.location || item.title;
            routingDb[key] = item.coordinates;
        }
    });

    // Populate Dropdowns
    if (startSelect && endSelect) {
        const locations = Object.keys(routingDb).sort();
        const options = locations.map(key => `<option value="${key}">${key}</option>`).join('');

        startSelect.innerHTML = `<option value="">-- Seleccionar --</option>` + options;
        endSelect.innerHTML = `<option value="">-- Seleccionar --</option>` + options;

        // Pre-select defaults
        startSelect.value = "Champions Gate";
        endSelect.value = "Magic Kingdom";
    }

    if (calcBtn) {
        calcBtn.addEventListener('click', () => {
            const startKey = startSelect.value;
            const endKey = endSelect.value;

            if (!startKey || !endKey) {
                alert("Selecciona origen y destino");
                return;
            }

            const startCoords = routingDb[startKey];
            const endCoords = routingDb[endKey];

            if (window.routingControl) window.mapInstance.removeControl(window.routingControl);

            document.getElementById('route-results').style.display = 'block';
            document.getElementById('dist-val').innerText = "Calculando...";
            document.getElementById('time-val').innerText = "...";

            window.routingControl = L.Routing.control({
                waypoints: [L.latLng(startCoords), L.latLng(endCoords)],
                lineOptions: { styles: [{ color: '#10b981', weight: 6 }] }, // Green for custom route
                createMarker: () => null,
                show: false // Hide default panel
            }).on('routesfound', function (e) {
                const routes = e.routes;
                const summary = routes[0].summary;
                // Update UI
                document.getElementById('dist-val').innerText = (summary.totalDistance / 1000).toFixed(1) + " km";
                document.getElementById('time-val').innerText = Math.round(summary.totalTime / 60) + " min";
            }).addTo(window.mapInstance);
        });
    }

    // Global helper helper (kept for markers)
    window.calculateRoute = function (destCoords) {
        if (window.routingControl) window.mapInstance.removeControl(window.routingControl);
        window.routingControl = L.Routing.control({
            waypoints: [L.latLng(coords.orlandoHome), L.latLng(destCoords)],
            lineOptions: { styles: [{ color: '#4285F4', weight: 6 }] },
            createMarker: () => null, show: false
        }).addTo(window.mapInstance);
    };
}
