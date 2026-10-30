import { useState } from 'react'
import { useClubs } from '../api'
import ClubCard from '../components/ClubCard'
import { Link } from 'react-router'
import { Plus, Search } from 'lucide-react'

const CATEGORIES = ['All', 'Academic', 'Cultural', 'Sports', 'Arts', 'Tech', 'Volunteering']

function ClubsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const { data: clubs = [], isPending, isError, isPlaceholderData } = useClubs({
    search,
    category,
  })

  function renderResults() {
    if (isPending) {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-48 animate-pulse rounded-xl bg-gray-900" />
          ))}
        </div>
      )
    }

    if (isError) {
      return <p className="text-red-400">Couldn't load clubs. Please try again.</p>
    }

    if (clubs.length === 0) {
      return <p className="text-gray-400">No clubs match your search.</p>
    }

    return (
      <div
        className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 transition-opacity ${
          isPlaceholderData ? 'opacity-60' : ''
        }`}
      >
        {clubs.map((club) => (
          <ClubCard key={club.id} club={club} />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Clubs & Societies</h2>
          <p className="mt-2 text-gray-400">Find your people at Dal.</p>
        </div>
        <Link
          to="/clubs/new"
          className="flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-gray-900 transition hover:bg-yellow-300"
        >
          <Plus size={18} />
          Create society
        </Link>
      </div>

      <div className="relative mt-6">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search clubs and societies"
          className="w-full rounded-lg border border-gray-700 bg-gray-900 py-2 pl-10 pr-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {CATEGORIES.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition ${
              category === item
                ? 'bg-yellow-400 text-gray-900'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-6">{renderResults()}</div>
    </div>
  )
}

export default ClubsPage