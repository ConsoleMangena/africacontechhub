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
    searchLocation?: string // Location string to geocode and navigate to
}

export function LocationPicker({ onLocationSelect, initialLocation, searchLocation }: LocationPickerProps) {
    const mapRef = useRef<L.Map | null>(null)
    const markerRef = useRef<L.Marker | null>(null)
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
        initialLocation || null
    )
    const [isGeocoding, setIsGeocoding] = useState(false)
    const lastGeocodedLocationRef = useRef<string>('') // Track last geocoded location to avoid loops

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

                    // Track this as the last geocoded location to prevent geocoding loop
                    if (address) {
                        lastGeocodedLocationRef.current = address
                    }

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

    // Geocode location string and navigate map to it
    useEffect(() => {
        if (!searchLocation || !mapRef.current || searchLocation.trim().length < 3) {
            return
        }

        // Skip geocoding if this location was just set from a map click (to avoid loops)
        if (searchLocation === lastGeocodedLocationRef.current) {
            return
        }

        const geocodeLocation = async () => {
            setIsGeocoding(true)
            try {
                // Use Nominatim geocoding API
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchLocation)}&format=json&limit=1&countrycodes=zw`
                )
                const data = await response.json()

                if (data && data.length > 0) {
                    const result = data[0]
                    const lat = parseFloat(result.lat)
                    const lng = parseFloat(result.lon)
                    const address = result.display_name

                    // Navigate map to the location
                    mapRef.current?.setView([lat, lng], 13)

                    // Remove existing marker if any
                    if (markerRef.current) {
                        markerRef.current.remove()
                    }

                    // Add new marker at geocoded location
                    const marker = L.marker([lat, lng]).addTo(mapRef.current!)
                    markerRef.current = marker

                    setSelectedLocation({ lat, lng })

                    // Show popup with address
                    marker.bindPopup(`
                        <div class="text-sm">
                            <strong>Location Found</strong><br/>
                            ${address}
                        </div>
                    `).openPopup()

                    // Track this as the last geocoded location
                    lastGeocodedLocationRef.current = address

                    // Call the callback with the geocoded location
                    onLocationSelect(lat, lng, address)
                } else {
                    // Location not found, but don't show error - user might still be typing
                    console.log('Location not found:', searchLocation)
                }
            } catch (error) {
                console.error('Geocoding error:', error)
            } finally {
                setIsGeocoding(false)
            }
        }

        // Debounce geocoding to avoid too many API calls
        const timeoutId = setTimeout(() => {
            geocodeLocation()
        }, 800) // Wait 800ms after user stops typing

        return () => clearTimeout(timeoutId)
    }, [searchLocation, onLocationSelect])

    return (
        <div className='space-y-2'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <MapPin className='h-4 w-4' />
                <span>
                    {isGeocoding ? 'Searching for location...' : 'Enter location above or click on the map to pin-point your project location'}
                </span>
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
