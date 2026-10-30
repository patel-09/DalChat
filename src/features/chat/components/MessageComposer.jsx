import { useState } from 'react'
import { SendHorizontal } from 'lucide-react'

function MessageComposer({ onSend }) {
  const [text, setText] = useState('')

  function submit() {
    const content = text.trim()
    if (!content) return
    // The second argument puts the text back if sending fails
    onSend(content, () => setText(content))
    setText('')
  }

  function handleKeyDown(event) {
    // Enter sends; Shift + Enter makes a new line
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
      className="flex items-end gap-2 border-t border-gray-800 p-3"
    >
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        maxLength={2000}
        placeholder="Type a message"
        aria-label="Message"
        className="max-h-32 min-h-10 flex-1 resize-none rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 field-sizing-content focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        aria-label="Send message"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-gray-900 transition hover:bg-yellow-300 disabled:opacity-40"
      >
        <SendHorizontal size={18} />
      </button>
    </form>
  )
}

export default MessageComposer