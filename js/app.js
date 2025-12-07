// Main App Logic - now Cloud Powered ☁️
import { db } from './firebase-config.js';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// State
let localItinerary = [];
let unsubscribe = null; // for Listener

document.addEventListener('DOMContentLoaded', () => {
    // 1. Init Data (Real-time listener)
    initRealTimeData();

    // 2. Init Core
    initCountdown();
    initNavigation();

    // 3. Render
    renderFamilyGrid();
    renderItinerary();
    renderMagicMoment();
    renderFormOptions();

    // 4. Events
    initInteractions();

    // Global
    window.deleteActivity = deleteActivity;
});

function initRealTimeData() {
    // 0. MIGRATION FROM LOCAL STORAGE (One time run)
    const localSaved = localStorage.getItem('vacation_extra_activities');
    if (localSaved) {
        try {
            const localExtras = JSON.parse(localSaved);
            if (localExtras.length > 0) {
                console.log("🚀 Migrating " + localExtras.length + " items to Cloud...");
                localExtras.forEach(async (item) => {
                    // Start fresh with IDs let Firestore generate or force one
                    const { id, ...data } = item;
                    // Ensure type is preserved
                    if (!data.type) data.type = "user-added";
                    data.createdAt = Date.now();

                    await addDoc(collection(db, "vacation_activities"), data);
                });
                // Clear Local Storage so we don't duplicate
                localStorage.removeItem('vacation_extra_activities');
                alert("¡Tus datos antiguos se han subido a la Nube! ☁️");
            }
        } catch (e) {
            console.error("Migration error", e);
        }
    }

    // Listen to 'vacation_activities' collection
    const activitiesRef = collection(db, 'vacation_activities');

    unsubscribe = onSnapshot(activitiesRef, (snapshot) => {
        const cloudExtras = [];
        snapshot.forEach((doc) => {
            console.log("Cloud item:", doc.data());
            cloudExtras.push({ ...doc.data(), id: doc.id });
        });

        // Merge Core + Cloud Extras
        let combined = [...APP_DATA.itinerary, ...cloudExtras];

        // Assign IDs to Core Items
        combined = combined.map(item => {
            if (!item.id) {
                item.id = 'core_' + item.date.replace(/\s/g, '') + '_' + item.title.slice(0, 5).replace(/\s/g, '');
            }
            return item;
        });

        localItinerary = combined;
        // Sort by day
        localItinerary.sort((a, b) => a.day - b.day);

        // Re-render
        renderItinerary();

        // Refresh Map
        if (window.mapInstance) {
            window.mapInstance.remove();
            window.initMap();
        }
    });
}

// Replaces 'deleteActivity'
async function deleteActivity(id) {
    if (!confirm("¿Borrar esta actividad para TODOS?")) return;

    if (id.startsWith('core_')) {
        alert("Las actividades base del itinerario no se pueden borrar (aún).");
        return;
    }

    try {
        await deleteDoc(doc(db, "vacation_activities", id));
        // No need to reload manually, onSnapshot will trigger!
    } catch (e) {
        console.error("Error deleting: ", e);
        alert("Error al borrar. Revisa tu conexión.");
    }
}

function initInteractions() {
    const modal = document.getElementById('activity-modal');
    const addBtn = document.getElementById('add-activity-btn');
    const cancelBtn = document.getElementById('cancel-act');
    const form = document.getElementById('activity-form');

    if (addBtn) addBtn.addEventListener('click', () => modal.style.display = 'flex');
    if (cancelBtn) cancelBtn.addEventListener('click', () => modal.style.display = 'none');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = "Guardando en la Nube... ☁️";
            submitBtn.disabled = true;

            // Gather Data
            const author = document.getElementById('act-author').value;
            const dayIdx = document.getElementById('act-day').value;
            const title = document.getElementById('act-title').value;
            const details = document.getElementById('act-details').value;
            const locationInput = document.getElementById('act-location').value;

            // Geocoding
            let foundCoords = null;
            let foundLabel = locationInput;

            if (locationInput && window.GeoSearch) {
                try {
                    const provider = new GeoSearch.OpenStreetMapProvider();
                    const results = await provider.search({ query: locationInput });
                    if (results && results.length > 0) {
                        const match = results[0];
                        foundCoords = [match.y, match.x];
                        foundLabel = match.label.split(',')[0];
                    }
                } catch (err) { console.error("Geocoding failed", err); }
            }

            const baseDay = APP_DATA.itinerary.find(i => i.day == dayIdx);
            const dateStr = baseDay ? baseDay.date : `Día ${dayIdx}`;

            const newActivity = {
                day: parseInt(dayIdx),
                date: dateStr,
                title: title,
                location: foundLabel || locationInput || title,
                coordinates: foundCoords,
                type: "user-added",
                details: details,
                isUserAdded: true,
                author: author,
                createdAt: Date.now()
            };

            // Save to Firestore
            try {
                await addDoc(collection(db, "vacation_activities"), newActivity);
                // Success
                modal.style.display = 'none';
                form.reset();
            } catch (e) {
                console.error("Error adding doc: ", e);
                alert("Error al guardar en la nube.");
            }

            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        });
    }
}

function renderFormOptions() {
    const daySelect = document.getElementById('act-day');
    if (!daySelect) return;
    const uniqueDays = [...new Set(APP_DATA.itinerary.map(i => i.day))].sort((a, b) => a - b);
    daySelect.innerHTML = uniqueDays.map(d => {
        const item = APP_DATA.itinerary.find(i => i.day === d);
        return `<option value="${d}">Día ${d}: ${item.date}</option>`;
    }).join('');
}

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-links li');
    const views = document.querySelectorAll('.view');
    const pageTitle = document.getElementById('page-title');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            views.forEach(v => {
                v.style.display = 'none';
                v.classList.remove('active');
            });
            link.classList.add('active');
            const tabId = link.getAttribute('data-tab');
            const view = document.getElementById(`${tabId}-view`);
            if (view) {
                view.style.display = 'flex'; // Important for layout
                view.classList.add('active');

                if (tabId === 'map' && window.mapInstance) {
                    setTimeout(() => window.mapInstance.invalidateSize(), 100);
                }
            }
        });
    });
}

function initCountdown() {
    const targetDate = new Date(APP_DATA.tripStartDate).getTime();
    function update() {
        const now = new Date().getTime();
        const distance = targetDate - now;
        if (distance < 0) {
            document.getElementById('countdown').innerHTML = "¡VAMOS!";
            return;
        }
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        document.getElementById('days').innerText = String(days).padStart(3, '0');
        document.getElementById('hours').innerText = String(hours).padStart(2, '0');
        document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
    }
    setInterval(update, 1000);
    update();
}

function renderFamilyGrid() {
    const grid = document.getElementById('family-grid');
    if (!grid) return;
    grid.innerHTML = APP_DATA.familyMembers.map(member => `
        <div class="card glass-panel" style="display:flex; align-items:center; gap:1rem;">
            <div class="avatar">${member.avatar}</div>
            <div>
                <h4>${member.name}</h4>
                <p class="sub-text">${member.role}</p>
            </div>
        </div>
    `).join('');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
    grid.style.gap = '1rem';
}

function renderItinerary() {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    container.innerHTML = localItinerary.map((item, index) => {
        const isUser = item.isUserAdded;
        const styleBorder = isUser ? 'border-left-color: #10b981;' : '';
        const authorTag = isUser ? `<div class="user-tag">✨ ${item.author}</div>` : '';

        // Trash Button
        const trashBtn = `<button onclick="deleteActivity('${item.id}')" style="background:none; border:none; cursor:pointer; font-size:1.2rem; opacity:0.6;" title="Eliminar">🗑️</button>`;

        return `
        <div class="timeline-item animate__animated animate__fadeInRight" style="animation-delay: ${Math.min(index * 0.05, 1)}s; margin-bottom: 1.5rem; padding: 1.5rem; border-left: 3px solid var(--accent-gold); ${styleBorder} background: rgba(255,255,255,0.03); border-radius: 0 16px 16px 0;">
            <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                <div>
                    <span style="color: var(--accent-gold); font-weight:bold; font-size: 0.9rem;">${item.date}</span>
                    <span style="color: var(--text-muted); font-size: 0.8rem;"> Día ${item.day}</span>
                </div>
                ${trashBtn}
            </div>
            ${authorTag}
            <h3 style="margin: 0.5rem 0; font-size:1.2rem;">${item.title}</h3>
            <p style="color: var(--text-main); font-size: 0.95rem; line-height:1.5;">${item.details}</p>
            <div style="margin-top:0.5rem; font-size:0.8rem; color:var(--primary);">📍 ${item.location}</div>
        </div>
        `;
    }).join('');
}

function renderMagicMoment() {
    const dashboardGrid = document.querySelector('.dashboard-grid');
    if (!dashboardGrid) return;

    // Clear old budget if still there or just append
    // Ideally we want to Replace the budget slot.
    // Let's ensure we don't duplicate. We'll append for now as grid flow handles it.
    if (document.getElementById('magic-card')) return;

    const characters = [
        { name: "Mickey Mouse", quote: "¡Todo empezó con un ratón!", icon: "🐭" },
        { name: "Walt Disney", quote: "Si puedes soñarlo, puedes hacerlo.", icon: "✨" },
        { name: "Yoda", quote: "Hacerlo o no hacerlo. No hay intento.", icon: "🌌" },
        { name: "Buzz Lightyear", quote: "¡Al infinito y más allá!", icon: "🚀" },
        { name: "Rafiki", quote: "El pasado puede doler, pero puedes huir de él o aprender.", icon: "🐒" },
        { name: "Dory", quote: "Nadaremos, nadaremos...", icon: "🐟" }
    ];

    const randomChar = characters[Math.floor(Math.random() * characters.length)];

    const magicHTML = `
        <div id="magic-card" class="card glass-panel" style="grid-column: span 2; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%);">
            <h4 style="display:flex; justify-content:space-between; align-items:center;">
                <span>✨ Personaje Mágico del Día</span>
                <span style="font-size:1.5rem;">${randomChar.icon}</span>
            </h4>
            <div style="margin-top:1rem; text-align:center;">
                <p style="font-size:1.2rem; font-style:italic; font-family:'Playfair Display', serif;">"${randomChar.quote}"</p>
                <div style="margin-top:0.5rem; color:var(--accent-gold); font-weight:600;">— ${randomChar.name}</div>
            </div>
        </div>
    `;

    dashboardGrid.innerHTML += magicHTML;
}
