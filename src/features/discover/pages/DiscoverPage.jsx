import { useState } from 'react'
import { Search } from 'lucide-react'
import { useStudents } from '../api'
import StudentCard from '../components/StudentCard'

function DiscoverPage() {
  const [search, setSearch] = useState('')
  const { data: students = [], isPending, isError, isPlaceholderData } =
    useStudents(search)

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
      return <p className="text-red-400">Couldn't load students. Please try again.</p>
    }

    if (students.length === 0) {
      return <p className="text-gray-400">No students match "{search}".</p>
    }

    return (
      <div
        className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 transition-opacity ${
          isPlaceholderData ? 'opacity-60' : ''
        }`}
      >
        {students.map((student) => (
          <StudentCard key={student.id} student={student} />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      <h2 className="text-2xl font-bold">Discover</h2>
      <p className="mt-2 text-gray-400">
        Find other Dalhousie students by name, program, or interest.
      </p>

      <div className="relative mt-6">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Try “Computer Science” or “Hiking”"
          className="w-full rounded-lg border border-gray-700 bg-gray-900 py-2 pl-10 pr-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      <div className="mt-6">{renderResults()}</div>
    </div>
  )
}

export default DiscoverPage