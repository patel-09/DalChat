function MessageBubble({ message, showSender }) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
  const isSending = message.status === 'sending'

  return (
    <div
      className={`flex ${message.isMine ? 'justify-end' : 'justify-start'} ${
        showSender ? 'pt-3' : ''
      }`}
    >
      <div
        className={`flex max-w-[75%] flex-col ${message.isMine ? 'items-end' : 'items-start'}`}
      >
        {showSender && (
          <span className="mb-1 px-1 text-xs font-medium text-gray-400">
            {message.sender.name}
          </span>
        )}
        <div
          className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm ${
            message.isMine
              ? 'rounded-br-md bg-yellow-400 text-gray-900'
              : 'rounded-bl-md bg-gray-800 text-gray-100'
          } ${isSending ? 'opacity-60' : ''}`}
        >
          {message.content}
        </div>
        <span className="mt-0.5 px-1 text-[11px] text-gray-500">
          {isSending ? 'Sending…' : time}
        </span>
      </div>
    </div>
  )
}

export default MessageBubble