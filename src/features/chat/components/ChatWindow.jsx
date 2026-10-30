import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { getInitials } from '../../../lib/getInitials'
import { useMarkConversationRead, useMessages, useSendMessage } from '../api'
import MessageBubble from './MessageBubble'
import MessageComposer from './MessageComposer'

function ChatWindow({ conversationId }) {
  const { data, isPending, isError } = useMessages(conversationId)
  const sendMessage = useSendMessage(conversationId)
  const { mutate: markRead } = useMarkConversationRead()
  const bottomRef = useRef(null)

  const messages = Array.isArray(data?.messages) ? data.messages : []

  // Opening a chat marks it as read
  useEffect(() => {
    markRead(conversationId)
  }, [conversationId, markRead])

  // Keep the newest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length])

  function handleSend(content, restoreText) {
    sendMessage.mutate(content, { onError: restoreText })
  }

  if (isPending) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-500">
        Loading chat…
      </div>
    )
  }

  if (isError || !data?.conversation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-red-400">Couldn't open this chat.</p>
        <Link to="/chats" className="text-yellow-400 hover:underline">
          Back to chats
        </Link>
      </div>
    )
  }

  const { conversation } = data
  const isGroup = conversation.type === 'group'

  return (
    <>
      <header className="flex items-center gap-3 border-b border-gray-800 px-4 py-3">
        <Link
          to="/chats"
          aria-label="Back to chats"
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white md:hidden"
        >
          <ArrowLeft size={20} />
        </Link>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center bg-yellow-400 text-sm font-bold text-gray-900 ${
            isGroup ? 'rounded-xl' : 'rounded-full'
          }`}
        >
          {getInitials(conversation.name)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">{conversation.name}</p>
          {isGroup && (
            <p className="truncate text-xs text-gray-400">
              {conversation.members.map((member) => member.name.split(' ')[0]).join(', ')}
            </p>
          )}
        </div>
      </header>

      <div className="flex-1 space-y-1 overflow-y-auto p-4">
        {messages.map((message, index) => {
          const previous = messages[index - 1]
          const showSender =
            isGroup && !message.isMine && previous?.sender.id !== message.sender.id
          return <MessageBubble key={message.id} message={message} showSender={showSender} />
        })}
        <div ref={bottomRef} />
      </div>

      {sendMessage.isError && (
        <p className="px-4 pb-1 text-xs text-red-400">
          Message failed to send. Your text is back in the box, please try again.
        </p>
      )}

      <MessageComposer onSend={handleSend} />
    </>
  )
}

export default ChatWindow