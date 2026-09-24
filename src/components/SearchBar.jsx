import React from 'react'

const SearchBar = () => {
  const [query, setQuery] = React.useState('')
  const [places, setPlaces] = React.useState([])
  const [isSearching, setIsSearching] = React.useState(false)
  const [error, setError] = React.useState('')

  const searchPlaces = async (event) => {
    event.preventDefault()
    const searchTerm = query.trim()

    if (!searchTerm) return

    setIsSearching(true)
    setError('')

    try {
      const params = new URLSearchParams({
        name: searchTerm,
        count: '8',
        language: 'en',
        format: 'json',
      })
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`)
      if (!response.ok) throw new Error('Unable to search locations')

      const data = await response.json()
      setPlaces(data.results || [])
      if (!data.results?.length) setError('No cities found. Try another search.')
    } catch {
      setError('Location search is unavailable right now.')
    } finally {
      setIsSearching(false)
    }
  }

  const selectPlace = (place) => {
    window.dispatchEvent(new CustomEvent('weather-location-change', {
      detail: {
        latitude: place.latitude,
        longitude: place.longitude,
        name: [place.name, place.admin1, place.country].filter(Boolean).join(', '),
      },
    }))
    setQuery(place.name)
    setPlaces([])
    setError('')
  }

  return (
    <section className='px-3 py-5 sm:px-6 lg:px-10'>
      <div className='mx-auto w-full max-w-7xl'>
        <form className='flex w-full items-center gap-2' onSubmit={searchPlaces}>
          <label className='sr-only' htmlFor='city-search'>Search any city worldwide</label>
          <input
            id='city-search'
            type='search'
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder='Search any city or country worldwide'
            className='min-w-0 flex-1 rounded-lg border border-cyan-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 sm:rounded-xl sm:px-4 sm:py-3 sm:text-base'
          />
          <button type='submit' disabled={isSearching} className='shrink-0 rounded-lg bg-cyan-700 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:cursor-wait disabled:opacity-60 sm:rounded-xl sm:px-6 sm:py-3 sm:text-base'>
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <p className='mt-2 text-sm text-red-600'>{error}</p>}

        {places.length > 0 && (
          <div className='mt-2 grid gap-2 rounded-xl border border-cyan-100 bg-white p-2 shadow-md sm:grid-cols-2'>
            {places.map((place) => (
              <button
                key={`${place.id}-${place.latitude}-${place.longitude}`}
                type='button'
                onClick={() => selectPlace(place)}
                className='rounded-lg px-3 py-2 text-left text-slate-700 hover:bg-cyan-50'
              >
                <span className='block font-semibold'>{place.name}</span>
                <span className='block text-sm text-slate-500'>
                  {[place.admin1, place.country].filter(Boolean).join(', ')}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default SearchBar