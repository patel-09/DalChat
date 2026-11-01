import { useNavigate } from 'react-router'
import { MessageCircle } from 'lucide-react'
import { getInitials } from '../../../lib/getInitials'
import { useOpenDirectChat } from '../../chat/api'

function StudentCard({ student }) {
  const navigate = useNavigate()
  const openChat = useOpenDirectChat()

  function handleMessage() {
    openChat.mutate(student.id, {
      onSuccess: (conversation) => navigate(`/chats/${conversation.id}`),
    })
  }

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
        <button
          type="button"
          onClick={handleMessage}
          disabled={openChat.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-yellow-400 py-1.5 text-sm font-medium text-yellow-400 transition hover:bg-yellow-400 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <MessageCircle size={16} />
          {openChat.isPending ? 'Opening…' : 'Message'}
        </button>
        {openChat.isError && (
          <p className="mt-1 text-center text-xs text-red-400">
            {openChat.error.response?.data?.message ?? "Couldn't open the chat"}
          </p>
        )}
      </div>
    </div>
  )
}

export default StudentCard