'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import SimulatorNav from '@/components/simulator-nav'
import { useChat } from '@/hooks/use-chat'
import { Users, UserPlus, Check, X, Send, Loader2, MessageSquare } from 'lucide-react'

export default function FriendsPage() {
  const { data: session } = useSession()
  const currentUserId = session?.user?.id as string
  
  const [friends, setFriends] = useState<any[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [sentRequests, setSentRequests] = useState<any[]>([])
  
  const [activeFriend, setActiveFriend] = useState<any | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [addFriendId, setAddFriendId] = useState('')
  const [loading, setLoading] = useState(true)

  const { messages, loading: chatLoading, sendMessage } = useChat(currentUserId, activeFriend?.id)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  const fetchFriends = async () => {
    try {
      const res = await fetch('/api/friends')
      if (res.ok) {
        const data = await res.json()
        setFriends(data.friends || [])
        setPendingRequests(data.pendingRequests || [])
        setSentRequests(data.sentRequests || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUserId) fetchFriends()
  }, [currentUserId])

  useEffect(() => {
    // Auto-scroll chat to bottom
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages])

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addFriendId.trim()) return
    
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: addFriendId.trim() })
      })
      if (res.ok) {
        setAddFriendId('')
        fetchFriends()
        alert('Friend request sent!')
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to send request')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleRespondRequest = async (friendshipId: string, action: 'accept' | 'reject') => {
    try {
      const res = await fetch('/api/friends', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId, action })
      })
      if (res.ok) fetchFriends()
    } catch (err) {
      console.error(err)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim()) return
    
    const content = messageInput
    setMessageInput('')
    await sendMessage(content)
  }

  if (!session) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex flex-col font-sans text-gray-200">
        <SimulatorNav />
        <div className="flex-1 flex items-center justify-center">
          Please sign in to use the Friends & Chat feature.
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-[#0a0a0a] flex flex-col font-sans text-gray-200">
      <SimulatorNav />
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT PANEL: Friends List */}
        <div className="w-80 bg-[#121212] border-r border-[#1e1e1e] flex flex-col">
          <div className="p-4 border-b border-[#1e1e1e]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Users className="w-5 h-5" /> Friends
            </h2>
            <form onSubmit={handleAddFriend} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter User ID..."
                value={addFriendId}
                onChange={(e) => setAddFriendId(e.target.value)}
                className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg">
                <UserPlus className="w-4 h-4" />
              </button>
            </form>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : (
              <>
                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pending Requests</h3>
                    <div className="space-y-2">
                      {pendingRequests.map(req => (
                        <div key={req.id} className="flex items-center justify-between bg-[#1a1a1a] p-3 rounded-lg border border-[#2a2a2a]">
                          <span className="text-sm font-medium">{req.user.name || req.user.username}</span>
                          <div className="flex gap-2">
                            <button onClick={() => handleRespondRequest(req.id, 'accept')} className="text-emerald-400 bg-emerald-400/10 p-1.5 rounded-md hover:bg-emerald-400/20">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleRespondRequest(req.id, 'reject')} className="text-red-400 bg-red-400/10 p-1.5 rounded-md hover:bg-red-400/20">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Friends List */}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">My Friends</h3>
                  {friends.length === 0 ? (
                    <p className="text-sm text-gray-600 italic">No friends yet. Add some by ID!</p>
                  ) : (
                    <div className="space-y-2">
                      {friends.map(friend => (
                        <button
                          key={friend.id}
                          onClick={() => setActiveFriend(friend)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${activeFriend?.id === friend.id ? 'bg-blue-600/10 border-blue-500/30' : 'bg-[#1a1a1a] border-[#2a2a2a] hover:bg-[#222]'}`}
                        >
                          <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center shrink-0 overflow-hidden">
                            {friend.image ? <img src={friend.image} alt={friend.name} /> : <span className="font-bold text-lg">{friend.name?.[0] || 'U'}</span>}
                          </div>
                          <div>
                            <div className="font-medium text-sm text-gray-200">{friend.name || friend.username}</div>
                            <div className="text-xs text-gray-500 truncate w-40">ID: {friend.id}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Chat Workspace */}
        <div className="flex-1 flex flex-col bg-[#0a0a0a]">
          {activeFriend ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-[#1e1e1e] flex items-center px-6 shrink-0 bg-[#121212]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center">
                    {activeFriend.image ? <img src={activeFriend.image} alt="Avatar" className="w-full h-full rounded-full" /> : <span className="font-bold">{activeFriend.name?.[0] || 'U'}</span>}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{activeFriend.name || activeFriend.username}</h2>
                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Online (Supabase Realtime)
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={chatScrollRef}>
                {chatLoading ? (
                  <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-blue-500" /></div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4 opacity-50">
                    <MessageSquare className="w-16 h-16" />
                    <p>No messages yet. Say hello!</p>
                  </div>
                ) : (
                  messages.map((msg: any) => {
                    const isMe = msg.senderId === currentUserId
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-[#1e1e1e] text-gray-200 rounded-bl-sm border border-[#2a2a2a]'}`}>
                          <p className="text-sm">{msg.content}</p>
                          <span className={`text-[10px] mt-1 block ${isMe ? 'text-blue-200' : 'text-gray-500'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-[#121212] border-t border-[#1e1e1e]">
                <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={`Message ${activeFriend.name || 'friend'}...`}
                    className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full pl-5 pr-12 py-3 text-sm focus:outline-none focus:border-blue-500 text-white shadow-inner"
                  />
                  <button 
                    type="submit" 
                    disabled={!messageInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
              <MessageSquare className="w-16 h-16 opacity-20" />
              <p>Select a friend from the sidebar to start chatting</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
