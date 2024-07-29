const socket = io();

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error("Geolocation error:", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

const map = L.map("map").setView([0, 0], 10); // Initial view might need adjustment

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    map.setView([latitude, longitude], 16); // Set view with zoom level

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]); // Update existing marker position
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map); // Add new marker
    }
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]); // Remove marker from map
        delete markers[id]; // Remove marker from markers object
    }
});
