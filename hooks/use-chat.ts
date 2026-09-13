import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Note: Ensure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY set in .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create client safely, only if url and key are provided
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export function useChat(currentUserId: string, friendId: string | null) {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch initial messages
  useEffect(() => {
    if (!friendId) {
      setMessages([])
      return
    }

    const fetchHistory = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/chat/${friendId}`)
        if (res.ok) {
          const data = await res.json()
          setMessages(data.messages || [])
        }
      } catch (err) {
        console.error("Failed to load chat history", err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [friendId])

  // Subscribe to real-time incoming messages using Supabase
  useEffect(() => {
    if (!friendId || !currentUserId || !supabase) return

    // Create a channel that listens to the Message table specifically for the current user
    const channel = supabase
      .channel(`chat_${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Message',
          filter: `receiverId=eq.${currentUserId}`
        },
        (payload) => {
          const newMsg = payload.new
          // Check if this incoming message is from the friend we are currently chatting with
          if (newMsg.senderId === friendId) {
            setMessages((prev) => [...prev, newMsg])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, friendId])

  const sendMessage = async (content: string) => {
    if (!content.trim() || !friendId) return null
    
    // Optimistic update
    const tempMessage = {
      id: `temp_${Date.now()}`,
      senderId: currentUserId,
      receiverId: friendId,
      content,
      createdAt: new Date().toISOString()
    }
    
    setMessages((prev) => [...prev, tempMessage])

    try {
      const res = await fetch(`/api/chat/${friendId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      
      if (!res.ok) {
        // Remove optimistic message on failure
        setMessages((prev) => prev.filter(m => m.id !== tempMessage.id))
        return null
      }
      
      const data = await res.json()
      // Replace optimistic message with actual db message
      setMessages((prev) => prev.map(m => m.id === tempMessage.id ? data.message : m))
      return data.message
    } catch (error) {
      setMessages((prev) => prev.filter(m => m.id !== tempMessage.id))
      return null
    }
  }

  return { messages, loading, sendMessage }
}
