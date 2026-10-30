import { Pencil } from 'lucide-react'
import { getInitials } from '../../../lib/getInitials'

function ProfileCard({ profile, onEdit }) {
  const fullName = `${profile.firstName} ${profile.lastName}`
  const details = [profile.program, profile.year].filter(Boolean).join(' · ')

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900/60 p-6">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-2xl font-bold text-gray-900">
          {getInitials(fullName)}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold">{fullName}</h2>
          <p className="text-sm text-gray-400">{profile.email}</p>
          {details && <p className="mt-1 text-sm text-gray-300">{details}</p>}
          <p
            className={`mt-3 whitespace-pre-line text-sm ${
              profile.bio ? 'text-gray-200' : 'italic text-gray-500'
            }`}
          >
            {profile.bio || 'No bio yet.'}
          </p>
        </div>

        <button
          onClick={onEdit}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-200 transition hover:bg-gray-800"
        >
          <Pencil size={14} />
          Edit profile
        </button>
      </div>
    </section>
  )
}

export default ProfileCard