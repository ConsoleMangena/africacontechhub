import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin } from 'lucide-react'

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface LocationPickerProps {
    onLocationSelect: (lat: number, lng: number, address?: string) => void
    initialLocation?: { lat: number; lng: number }
}

export function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
    const mapRef = useRef<L.Map | null>(null)
    const markerRef = useRef<L.Marker | null>(null)
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
        initialLocation || null
    )

    useEffect(() => {
        // Initialize map centered on Harare, Zimbabwe
        const defaultCenter: [number, number] = initialLocation
            ? [initialLocation.lat, initialLocation.lng]
            : [-17.8252, 31.0335] // Harare coordinates

        if (!mapRef.current) {
            const map = L.map('location-map').setView(defaultCenter, 12)

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map)

            // Add click handler to map
            map.on('click', async (e) => {
                const { lat, lng } = e.latlng

                // Remove existing marker if any
                if (markerRef.current) {
                    markerRef.current.remove()
                }

                // Add new marker
                const marker = L.marker([lat, lng]).addTo(map)
                markerRef.current = marker

                setSelectedLocation({ lat, lng })

                // Reverse geocoding to get address
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
                    )
                    const data = await response.json()
                    const address = data.display_name || undefined

                    marker.bindPopup(`
            <div class="text-sm">
              <strong>Selected Location</strong><br/>
              ${address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`}
            </div>
          `).openPopup()

                    onLocationSelect(lat, lng, address)
                } catch (error) {
                    console.error('Geocoding error:', error)
                    onLocationSelect(lat, lng)
                }
            })

            mapRef.current = map

            // Add initial marker if location provided
            if (initialLocation) {
                const marker = L.marker([initialLocation.lat, initialLocation.lng]).addTo(map)
                markerRef.current = marker
            }
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove()
                mapRef.current = null
            }
        }
    }, [])

    return (
        <div className='space-y-2'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <MapPin className='h-4 w-4' />
                <span>Click on the map to pin-point your project location</span>
            </div>
            <div
                id='location-map'
                className='h-[300px] w-full rounded-lg border border-border overflow-hidden'
            />
            {selectedLocation && (
                <div className='text-xs text-muted-foreground'>
                    Selected: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </div>
            )}
        </div>
    )
}
