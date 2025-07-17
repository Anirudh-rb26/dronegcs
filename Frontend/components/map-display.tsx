"use client"

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useEffect } from "react"

// Fix for default marker icon not showing up
delete L.Icon.Default.prototype._get
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
})

interface MapDisplayProps {
    latitude: number
    longitude: number
}

function MapUpdater({ latitude, longitude }: MapDisplayProps) {
    const map = useMap()

    useEffect(() => {
        if (latitude && longitude) {
            map.setView([latitude, longitude], map.getZoom())
        }
    }, [latitude, longitude, map])

    // This useEffect will invalidate the map size after the component mounts
    // and after a short delay, ensuring it renders correctly within its container.
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize()
        }, 100) // A small delay to allow the DOM to settle
        return () => clearTimeout(timer)
    }, [map]) // Run once when the map instance is available

    return null
}

export function MapDisplay({ latitude, longitude }: MapDisplayProps) {
    const defaultPosition: [number, number] = [latitude || 18.5914, longitude || 73.7381]

    return (
        <div className="w-full h-full min-h-[300px] lg:min-h-[500px] rounded-xl overflow-hidden shadow-inner border border-gray-200 dark:border-gray-700">
            <MapContainer
                center={defaultPosition}
                zoom={15}
                scrollWheelZoom={true}
                className="h-full w-full"
                attributionControl={false} // Hide default Leaflet attribution
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {latitude && longitude && (
                    <Marker position={[latitude, longitude]}>
                        <Popup>
                            Drone Location <br /> Lat: {latitude.toFixed(4)}, Lng: {longitude.toFixed(4)}
                        </Popup>
                    </Marker>
                )}
                <MapUpdater latitude={latitude} longitude={longitude} />
            </MapContainer>
        </div>
    )
}
