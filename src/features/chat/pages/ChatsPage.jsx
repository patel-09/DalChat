import { useParams } from 'react-router'
import { MessageCircle } from 'lucide-react'
import ConversationList from '../components/ConversationList'
import ChatWindow from '../components/ChatWindow'

function ChatsPage() {
  const { conversationId } = useParams()

  return (
    <div className="flex h-[calc(100dvh-7.5rem)] overflow-hidden rounded-xl border border-gray-800 bg-gray-950 md:h-[calc(100dvh-3rem)]">
      {/* Chat list: always on desktop; on phones only when no chat is open */}
      <aside
        className={`${conversationId ? 'hidden' : 'flex'} w-full flex-col border-gray-800 md:flex md:w-80 md:shrink-0 md:border-r`}
      >
        <ConversationList />
      </aside>

      {/* Chat window: always on desktop; on phones only when a chat is open */}
      <section
        className={`${conversationId ? 'flex' : 'hidden'} min-w-0 flex-1 flex-col md:flex`}
      >
        {conversationId ? (
          <ChatWindow key={conversationId} conversationId={conversationId} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-gray-400">
            <MessageCircle size={40} className="text-gray-600" />
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default ChatsPage