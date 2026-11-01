import { Link } from 'react-router'
import { Check, UserCheck, UserPlus } from 'lucide-react'
import { getInitials } from '../../../lib/getInitials'
import { useSendFriendRequest } from '../api'

const buttonBase =
  'flex w-full items-center justify-center gap-2 rounded-lg py-1.5 text-sm font-medium transition'

function FriendButton({ student }) {
  const sendRequest = useSendFriendRequest()

  if (student.friendStatus === 'FRIENDS') {
    return (
      <span className={`${buttonBase} bg-gray-800 text-gray-300`}>
        <UserCheck size={16} />
        Friends
      </span>
    )
  }

  if (student.friendStatus === 'REQUESTED') {
    return (
      <span className={`${buttonBase} bg-green-500/15 text-green-400`}>
        <Check size={16} />
        Requested
      </span>
    )
  }

  if (student.friendStatus === 'INCOMING') {
    return (
      <Link
        to="/profile/requests"
        className={`${buttonBase} bg-yellow-400 text-gray-900 hover:bg-yellow-300`}
      >
        Respond to request
      </Link>
    )
  }

  return (
    <div>
      <button
        type="button"
        disabled={sendRequest.isPending}
        onClick={() => sendRequest.mutate(student.id)}
        className={`${buttonBase} border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <UserPlus size={16} />
        {sendRequest.isPending ? 'Sending…' : 'Add friend'}
      </button>
      {sendRequest.isError && (
        <p className="mt-1 text-center text-xs text-red-400">
          {sendRequest.error.response?.data?.message ?? "Couldn't send the request"}
        </p>
      )}
    </div>
  )
}

function StudentCard({ student }) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-800 bg-gray-900/60 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-400 font-bold text-gray-900">
          {getInitials(student.name)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">{student.name}</p>
          <p className="truncate text-sm text-gray-400">
            {student.program} · Year {student.year}
          </p>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <FriendButton student={student} />
      </div>
    </div>
  )
}

export default StudentCard