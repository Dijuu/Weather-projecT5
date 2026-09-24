import React, { useEffect, useState } from 'react'

const Location = () => {
	const [status, setStatus] = useState('')

	useEffect(() => {
		const publishLocation = ({ coords }) => {
			window.dispatchEvent(new CustomEvent('weather-location-change', {
				detail: {
					latitude: coords.latitude,
					longitude: coords.longitude,
				},
			}))
			setStatus('')
		}

		const requestLocation = () => {
			if (!navigator.geolocation) {
				setStatus('Location access is not supported by this browser.')
				return
			}

			setStatus('Requesting location access...')
			navigator.geolocation.getCurrentPosition(
			publishLocation,
			() => setStatus('Location access was denied. Showing the default forecast.'),
			{ enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
			)
		}

		window.addEventListener('request-current-location', requestLocation)
		requestLocation()

		return () => window.removeEventListener('request-current-location', requestLocation)
	}, [])

	return status ? <p className='sr-only' aria-live='polite'>{status}</p> : null
}

export default Location
