import { Users } from 'lucide-react'
import { getInitials } from '../../../lib/getInitials'

function ClubCard({ club }) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-800 bg-gray-900/60 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-400 font-bold text-gray-900">
          {getInitials(club.name)}
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 font-semibold">{club.name}</p>
          <span className="mt-1 inline-block rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
            {club.category}
          </span>
        </div>
      </div>

      <p className="mt-3 line-clamp-3 text-sm text-gray-400">{club.description}</p>

      <div className="mt-auto flex items-center justify-between pt-4">
        <span className="flex items-center gap-1.5 text-sm text-gray-400">
          <Users size={16} />
          {club.memberCount.toLocaleString()} members
        </span>
        <button className="rounded-lg border border-yellow-400 px-4 py-1.5 text-sm font-medium text-yellow-400 transition hover:bg-yellow-400 hover:text-gray-900">
          Join
        </button>
      </div>
    </div>
  )
}

export default ClubCard