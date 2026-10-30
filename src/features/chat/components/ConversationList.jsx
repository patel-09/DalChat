import { useState } from 'react'
import { NavLink } from 'react-router'
import { Search, X } from 'lucide-react'
import { getInitials } from '../../../lib/getInitials'
import { formatTimeAgo } from '../../../lib/formatTimeAgo'
import { useConversations } from '../api'

function previewText(conversation) {
  const last = conversation.lastMessage
  if (!last) return 'No messages yet'
  if (last.isMine) return `You: ${last.content}`
  if (conversation.type === 'group') return `${last.senderName.split(' ')[0]}: ${last.content}`
  return last.content
}

function matchesSearch(conversation, search) {
  const query = search.trim().toLowerCase()
  if (!query) return true

  const name = conversation.name.toLowerCase()
  const lastMessage = (conversation.lastMessage?.content ?? '').toLowerCase()
  return name.includes(query) || lastMessage.includes(query)
}

function ConversationList() {
  const { data, isPending, isError, refetch } = useConversations()
  const [search, setSearch] = useState('')

  const conversations = Array.isArray(data) ? data : []
  const filtered = conversations.filter((conversation) => matchesSearch(conversation, search))

  function renderList() {
    if (isPending) {
      return (
        <div className="space-y-2 p-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-lg bg-gray-900" />
          ))}
        </div>
      )
    }

    if (isError) {
      return (
        <div className="p-4 text-center">
          <p className="text-red-400">Couldn't load your chats.</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-yellow-400 hover:underline"
          >
            Try again
          </button>
        </div>
      )
    }

    if (conversations.length === 0) {
      return <p className="p-4 text-gray-400">No chats yet.</p>
    }

    if (filtered.length === 0) {
      return <p className="p-4 text-gray-400">No chats match "{search.trim()}".</p>
    }

    return (
      <ul>
        {filtered.map((conversation) => {
          const isGroup = conversation.type === 'group'
          const hasUnread = conversation.unreadCount > 0

          return (
            <li key={conversation.id}>
              <NavLink
                to={`/chats/${conversation.id}`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 transition ${
                    isActive ? 'bg-gray-800' : 'hover:bg-gray-900'
                  }`
                }
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center bg-yellow-400 text-sm font-bold text-gray-900 ${
                    isGroup ? 'rounded-xl' : 'rounded-full'
                  }`}
                >
                  {getInitials(conversation.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p
                      className={`truncate ${
                        hasUnread ? 'font-bold text-white' : 'font-medium text-gray-200'
                      }`}
                    >
                      {conversation.name}
                    </p>
                    {conversation.lastMessage && (
                      <span className="shrink-0 text-xs text-gray-500">
                        {formatTimeAgo(conversation.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`truncate text-sm ${
                        hasUnread ? 'text-gray-200' : 'text-gray-400'
                      }`}
                    >
                      {previewText(conversation)}
                    </p>
                    {hasUnread && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-yellow-400 px-1.5 text-xs font-bold text-gray-900">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </NavLink>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <>
      <div className="space-y-3 border-b border-gray-800 px-4 py-3">
        <h2 className="text-lg font-bold">Chats</h2>

        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setSearch('')
            }}
            placeholder="Search chats"
            aria-label="Search chats"
            className="w-full rounded-lg border border-gray-700 bg-gray-900 py-1.5 pl-9 pr-8 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">{renderList()}</div>
    </>
  )
}

export default ConversationList