import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { Search, User, Users } from 'lucide-react'
import { useStudents } from '../api'
import { useClubs } from '../../clubs/api'
import StudentCard from '../components/StudentCard'
import ClubCard from '../../clubs/components/ClubCard'

const TABS = [
  {
    id: 'people',
    label: 'People',
    icon: User,
    noun: 'students',
    placeholder: 'Search students by name or program',
  },
  {
    id: 'clubs',
    label: 'Clubs',
    icon: Users,
    noun: 'clubs',
    placeholder: 'Search clubs and societies',
  },
]

function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'clubs' ? 'clubs' : 'people'
  const currentTab = TABS.find((tab) => tab.id === activeTab)

  const [search, setSearch] = useState('')

  // Only the active tab fetches data
  const studentsQuery = useStudents(search, { enabled: activeTab === 'people' })
  const clubsQuery = useClubs({ search, category: 'All', enabled: activeTab === 'clubs' })

  const {
    data: results = [],
    isPending,
    isError,
    isPlaceholderData,
  } = activeTab === 'people' ? studentsQuery : clubsQuery

  function selectTab(tabId) {
    // People is the default, so it gets a clean URL: /discover
    setSearchParams(tabId === 'people' ? {} : { tab: tabId }, { replace: true })
  }

  function renderResults() {
    if (isPending) {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-xl bg-gray-900" />
          ))}
        </div>
      )
    }

    if (isError) {
      return (
        <p className="text-red-400">
          Couldn't load {currentTab.noun}. Please try again.
        </p>
      )
    }

    if (results.length === 0) {
      return (
        <p className="text-gray-400">
          {search
            ? `No ${currentTab.noun} match "${search}".`
            : `No ${currentTab.noun} found.`}
        </p>
      )
    }

    return (
      <div
        className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 transition-opacity ${
          isPlaceholderData ? 'opacity-60' : ''
        }`}
      >
        {activeTab === 'people'
          ? results.map((student) => <StudentCard key={student.id} student={student} />)
          : results.map((club) => <ClubCard key={club.id} club={club} />)}
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      <h2 className="text-2xl font-bold">Discover</h2>
      <p className="mt-2 text-gray-400">Find Dalhousie students and societies.</p>

      <div
        role="tablist"
        aria-label="What to search"
        className="mt-6 inline-flex rounded-lg border border-gray-800 bg-gray-900 p-1"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => selectTab(id)}
              className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition ${
                isActive ? 'bg-yellow-400 text-gray-900' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          )
        })}
      </div>

      <div className="relative mt-4">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={currentTab.placeholder}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 py-2 pl-10 pr-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      <div className="mt-6">{renderResults()}</div>
    </div>
  )
}

export default DiscoverPage