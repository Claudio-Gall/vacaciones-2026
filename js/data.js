// CENTRAL DATA STORE (Extracted from Excel & User Updates)

const APP_DATA = {
    // Start Date: Jan 19, 2026 (Flight Departs)
    tripStartDate: "2026-01-19T22:35:00",

    familyMembers: [
        { id: 1, name: "C. Galleguillos", role: "Organizador/Papá", avatar: "CG" },
        { id: 2, name: "I. Rojas", role: "Mamá/Co-PILOTO", avatar: "IR" },
        { id: 3, name: "J. Galleguillos", role: "Hija Mayor", avatar: "JG" },
        { id: 4, name: "M. Galleguillos", role: "El Pequeño (10)", avatar: "MG" },
        { id: 5, name: "I. Muñoz", role: "Tío", avatar: "IM" },
        { id: 6, name: "A. Arias", role: "Tía", avatar: "AA" },
        { id: 7, name: "J. Muñoz", role: "Primo", avatar: "JM" },
        { id: 8, name: "A. Muñoz", role: "Prima (13)", avatar: "AM" }
    ],

    // Budget from Excel
    budget: [
        { item: "Vuelos (AA)", cost: 4500, status: "paid" }, // Est
        { item: "Casa Champions Gate", cost: 2130, status: "pending" },
        { item: "Crucero Symphony", cost: 3800, status: "pending" },
        { item: "Entradas Disney/Universal", cost: 2800, status: "pending" },
        { item: "Arriendo Auto (Miami-Orlando)", cost: 800, status: "est" },
        { item: "Comidas", cost: 1500, status: "est" },
        { item: "Paquete Tragos Adultos", cost: 1189, status: "pending" }
    ],

    // Itinerary: Integrated Flight -> Drive -> Parks -> Drive -> Cruise -> Flight
    itinerary: [
        {
            day: 1,
            date: "Lun 19 Ene",
            title: "🛫 Salida de Chile",
            location: "Aeropuerto SCL",
            type: "flight",
            details: "Vuelo AA 912. Salida 10:35 PM. ¡Comienza la aventura!"
        },
        {
            day: 2,
            date: "Mar 20 Ene",
            title: "🛬 Llegada a Miami y Auto a Orlando",
            location: "Miami International Airport",
            type: "transport",
            details: "Llegada 5:00 AM. Retiro de Autos. Viaje por Turnpike hacia Orlando (3h 30m)."
        },
        {
            day: 2,
            date: "Mar 20 Ene",
            title: "🏠 Check-in Casa",
            location: "Champions Gate, Orlando",
            type: "home",
            details: "1520 Oasis Club Blvd. Instalación, supermercado (Walmart) y descanso."
        },
        {
            day: 3,
            date: "Mie 21 Ene",
            title: "🎢 Magic Kingdom",
            location: "Magic Kingdom Park",
            type: "park",
            details: "El clásico. Castillo, Fuegos Artificiales"
        },

        {
            day: 4,
            date: "Jue 22 Ene",
            title: "🦁 Animal Kingdom",
            location: "Animal Kingdom",
            type: "park",
            details: "Pandora: Flight of Passage (Llegar temprano). Safari."
        },
        {
            day: 4,
            date: "Jue 22 Ene",
            title: "🛍️ Disney Springs",
            location: "Disney Springs",
            type: "shopping",
            details: "Cena y Compras. World of Disney, Lego Store."
        },
        {
            day: 5,
            date: "Vie 23 Ene",
            title: "🎬 Hollywood Studios",
            location: "Disney's Hollywood Studios",
            type: "park",
            details: "Star Wars Galaxy's Edge, Toy Story Land."
        },
        {
            day: 6,
            date: "Sab 24 Ene",
            title: "🛍️ Universal / CityWalk / Compras",
            location: "Universal CityWalk",
            type: "shopping",
            details: "Día más relajado o Universal Studios si se decide."
        },
        {
            day: 7,
            date: "Dom 25 Ene",
            title: "🚗 Regreso a Miami (Puerto)",
            location: "Puerto de Miami",
            type: "transport",
            details: "Viaje temprano de Orlando a Miami. Devolución de auto o Parking."
        },
        {
            day: 7,
            date: "Dom 25 Ene",
            title: "🚢 Embarque Symphony of the Seas",
            location: "Puerto de Miami",
            type: "cruise",
            details: "Check-in crucero. Salida 16:30 aprox."
        },
        {
            day: 8,
            date: "Lun 26 Ene",
            title: "🌊 Navegación",
            location: "En Alta Mar",
            type: "cruise",
            details: "Disfrutar del barco."
        },
        {
            day: 9,
            date: "Mar 27 Ene",
            title: "🇧🇸 Nassau, Bahamas",
            location: "Nassau",
            type: "cruise",
            details: "8:00 AM - 5:00 PM (aprox)"
        },
        {
            day: 10,
            date: "Mie 28 Ene",
            title: "🏝️ Perfect Day at CocoCay",
            location: "CocoCay",
            type: "cruise",
            details: "Isla privada. Parque acuático y playa."
        },
        {
            day: 11,
            date: "Jue 29 Ene",
            title: "🌊 Navegación",
            location: "En Alta Mar",
            type: "cruise",
            details: "Relax."
        },
        {
            day: 12,
            date: "Vie 30 Ene",
            title: "🇵🇷 San Juan, Puerto Rico",
            location: "San Juan",
            type: "cruise",
            details: "Llegada en la tarde (según itinerario original) o día completo."
        },
        {
            day: 13,
            date: "Sab 31 Ene",
            title: "🇩🇴 Puerto Plata",
            location: "Puerto Plata",
            type: "cruise",
            details: "República Dominicana."
        },
        {
            day: 14,
            date: "Dom 01 Feb",
            title: "🚢 Regreso a Miami",
            location: "Puerto de Miami",
            type: "cruise",
            details: "Desembarque en la mañana."
        },
        {
            day: 14,
            date: "Dom 01 Feb",
            title: "🏨 Hotel Miami",
            location: "Miami Beach",
            type: "hotel",
            details: "Noche relax en Miami antes del regreso."
        },
        {
            day: 15,
            date: "Lun 02 Feb",
            title: "🛍️ Miami Shopping / Playa",
            location: "Miami Beach",
            type: "leisure",
            details: "Día libre. Compras finales o playa."
        },
        {
            day: 16,
            date: "Mar 03 Feb",
            title: "✈️ Regreso a Chile",
            location: "Miami International Airport",
            type: "flight",
            details: "Vuelo AA 957. Salida 22:45."
        },
        {
            day: 17,
            date: "Mie 04 Feb",
            title: "🏠 Llegada a Santiago",
            location: "Santiago, Chile",
            type: "home",
            details: "Llegada 09:05 AM. Fin de las vacaciones."
        }
    ]
};
