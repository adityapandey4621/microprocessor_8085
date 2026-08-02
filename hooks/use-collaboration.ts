'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface CollabUser {
  id: string
  name?: string
  image?: string
}

export interface ChatMessage {
  id: string
  sender: CollabUser
  text: string
  codeSnippet?: string
  timestamp: number
}

export interface UseCollaborationOptions {
  room?: string
  user?: CollabUser
  enabled?: boolean
}

export function useCollaboration({
  room = 'general',
  user,
  enabled = true,
}: UseCollaborationOptions = {}) {
  const [onlineUsers, setOnlineUsers] = useState<CollabUser[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: { id: 'bot', name: 'Classroom Bot' },
      text: 'Welcome to the 8085 Microprocessor Live Classroom! Ask questions, discuss assembly problems, or share code snippets.',
      timestamp: Date.now() - 60000,
    },
  ])
  const [isConnected, setIsConnected] = useState(false)
  const [mode, setMode] = useState<'websocket' | 'serverless' | 'offline'>('offline')
  const wsRef = useRef<WebSocket | null>(null)
  const pollTimerRef = useRef<any>(null)
  const heartbeatTimerRef = useRef<any>(null)

  const defaultUser: CollabUser = user || {
    id: 'anon-' + Math.random().toString(36).substring(2, 9),
    name: 'Student',
  }

  // 1. Connect via Native WebSocket or Fallback Serverless Polling
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      setIsConnected(false)
      setMode('offline')
      return
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL

    if (wsUrl) {
      // MODE A: Native WebSocket (Render / Docker)
      setMode('websocket')
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        ws.send(
          JSON.stringify({
            type: 'JOIN',
            room,
            user: defaultUser,
          })
        )
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'PRESENCE_UPDATE') {
            setOnlineUsers(data.users || [])
          } else if (data.type === 'CHAT_MESSAGE') {
            setMessages((prev) => [
              ...prev.slice(-99),
              {
                id: Math.random().toString(36).substring(2, 9),
                sender: data.sender || defaultUser,
                text: data.payload?.text || '',
                codeSnippet: data.payload?.codeSnippet,
                timestamp: data.timestamp || Date.now(),
              },
            ])
          }
        } catch (err) {
          console.error('WebSocket parse error:', err)
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
      }

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'LEAVE', room }))
        }
        ws.close()
        wsRef.current = null
      }
    } else {
      // MODE B: Vercel Serverless Fallback (Upstash Redis Presence Polling)
      setMode('serverless')
      setIsConnected(true)

      const fetchPresence = async () => {
        try {
          const res = await fetch(
            `/api/collaboration/stream?room=${encodeURIComponent(room)}`
          )
          if (res.ok) {
            const data = await res.json()
            setOnlineUsers(data.users || [])
          }
        } catch (err) {
          console.error('Presence poll error:', err)
        }
      }

      const sendHeartbeat = async () => {
        try {
          await fetch('/api/collaboration/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              room,
              type: 'HEARTBEAT',
              user: defaultUser,
            }),
          })
        } catch (err) {
          console.error('Heartbeat error:', err)
        }
      }

      // Initial calls
      sendHeartbeat()
      fetchPresence()

      pollTimerRef.current = setInterval(fetchPresence, 10000) // Poll every 10s
      heartbeatTimerRef.current = setInterval(sendHeartbeat, 30000) // Heartbeat every 30s

      return () => {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current)
        if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current)

        fetch('/api/collaboration/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            room,
            type: 'LEAVE',
            user: defaultUser,
          }),
        }).catch(() => {})
      }
    }
  }, [room, enabled])

  const broadcastCursor = useCallback(
    (line: number, column: number) => {
      if (!enabled) return

      if (mode === 'websocket' && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'CURSOR',
            room,
            payload: { line, column },
          })
        )
      } else if (mode === 'serverless') {
        fetch('/api/collaboration/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            room,
            type: 'CURSOR',
            payload: { line, column },
            user: defaultUser,
          }),
        }).catch(() => {})
      }
    },
    [enabled, mode, room]
  )

  const broadcastCodeChange = useCallback(
    (code: string) => {
      if (!enabled) return

      if (mode === 'websocket' && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'CODE_CHANGE',
            room,
            payload: { code },
          })
        )
      } else if (mode === 'serverless') {
        fetch('/api/collaboration/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            room,
            type: 'CODE_CHANGE',
            payload: { code },
            user: defaultUser,
          }),
        }).catch(() => {})
      }
    },
    [enabled, mode, room]
  )

  const sendChatMessage = useCallback(
    (text: string, codeSnippet?: string) => {
      if (!enabled || !text.trim()) return

      const msgObj: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        sender: defaultUser,
        text,
        codeSnippet,
        timestamp: Date.now(),
      }

      // Optimistic UI update
      setMessages((prev) => [...prev.slice(-99), msgObj])

      if (mode === 'websocket' && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'CHAT_MESSAGE',
            room,
            payload: { text, codeSnippet },
          })
        )
      } else if (mode === 'serverless') {
        fetch('/api/collaboration/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            room,
            type: 'CHAT_MESSAGE',
            payload: { text, codeSnippet },
            user: defaultUser,
          }),
        }).catch(() => {})
      }
    },
    [enabled, mode, room]
  )

  return {
    onlineCount: onlineUsers.length,
    onlineUsers,
    messages,
    isConnected,
    mode,
    broadcastCursor,
    broadcastCodeChange,
    sendChatMessage,
  }
}
