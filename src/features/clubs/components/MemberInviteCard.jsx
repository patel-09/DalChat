import { Check, UserPlus } from 'lucide-react'
import { getInitials } from '../../../lib/getInitials'

function MemberInviteCard({ person, isInvited, onToggle }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/60 p-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold text-gray-900">
        {getInitials(person.name)}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{person.name}</p>
        <p className="truncate text-sm text-gray-400">
          {person.program} · Year {person.year}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onToggle(person)}
        className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
          isInvited
            ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
            : 'border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900'
        }`}
      >
        {isInvited ? (
          <>
            <Check size={16} />
            Invited
          </>
        ) : (
          <>
            <UserPlus size={16} />
            Send invite
          </>
        )}
      </button>
    </div>
  )
}

export default MemberInviteCard