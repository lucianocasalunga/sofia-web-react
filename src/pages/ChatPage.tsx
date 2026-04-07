import { useState } from "react"
import { ChatSidebar } from "../components/chat/chat-sidebar"
import { ChatArea } from "../components/chat/chat-area"
import { RightSidebar } from "../components/layout/right-sidebar"

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [sidebarKey, setSidebarKey] = useState(0)

  const handleNewChat = () => {
    setSelectedChat(null)
  }

  const handleChatCreated = (chatId: string) => {
    setSelectedChat(chatId)
    setSidebarKey(prev => prev + 1)
  }

  return (
    <div className="h-screen bg-black flex overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Left sidebar - conversations */}
      <ChatSidebar
        key={sidebarKey}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        onNewChat={handleNewChat}
      />

      {/* Center - chat feed */}
      <ChatArea
        sidebarOpen={sidebarOpen}
        onOpenSidebar={() => setSidebarOpen(true)}
        selectedChat={selectedChat}
        onChatCreated={handleChatCreated}
      />

      {/* Right sidebar - desktop only */}
      <RightSidebar />
    </div>
  )
}
