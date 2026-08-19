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

const WELCOME_MSG: ChatMessage = {
  id: 'welcome-1',
  sender: { id: 'bot', name: 'Classroom Bot' },
  text: 'Welcome to the 8085 Microprocessor Live Classroom! Ask questions, discuss assembly problems, or share code snippets.',
  timestamp: Date.now() - 60000,
}

export function useCollaboration({
  room = 'general',
  user,
  enabled = true,
}: UseCollaborationOptions = {}) {
  const [onlineUsers, setOnlineUsers] = useState<CollabUser[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG])
  const [isConnected, setIsConnected] = useState(false)
  const [mode, setMode] = useState<'websocket' | 'serverless' | 'offline'>('offline')
  const wsRef = useRef<WebSocket | null>(null)
  const pollTimerRef = useRef<any>(null)
  const heartbeatTimerRef = useRef<any>(null)
  const userRef = useRef<CollabUser>(user || {
    id: 'anon-' + Math.random().toString(36).substring(2, 9),
    name: 'Student',
  })

  useEffect(() => {
    if (user) {
      userRef.current = user
    }
  }, [user])

  const activeUser = user || userRef.current

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
            user: activeUser,
          })
        )
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'PRESENCE_UPDATE') {
            setOnlineUsers(data.users || [])
          } else if (data.type === 'CHAT_MESSAGE') {
            const newMsg: ChatMessage = {
              id: data.payload?.id || Math.random().toString(36).substring(2, 9),
              sender: data.sender || activeUser,
              text: data.payload?.text || '',
              codeSnippet: data.payload?.codeSnippet,
              timestamp: data.timestamp || Date.now(),
            }
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev
              return [...prev.slice(-99), newMsg]
            })
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
      // MODE B: Vercel Serverless Fallback (Upstash Redis Presence & Chat Stream Polling)
      setMode('serverless')
      setIsConnected(true)

      const fetchPresenceAndMessages = async () => {
        try {
          const res = await fetch(
            `/api/collaboration/stream?room=${encodeURIComponent(room)}`,
            { cache: 'no-store' }
          )
          if (res.ok) {
            const data = await res.json()
            if (Array.isArray(data.users)) {
              setOnlineUsers(data.users)
            }
            if (Array.isArray(data.messages) && data.messages.length > 0) {
              setMessages((prev) => {
                const existingMap = new Map(prev.map((m) => [m.id, m]))
                for (const m of data.messages) {
                  if (m && m.id) {
                    existingMap.set(m.id, m)
                  }
                }
                const merged = Array.from(existingMap.values()).sort(
                  (a, b) => a.timestamp - b.timestamp
                )
                return merged.length > 0 ? merged : [WELCOME_MSG]
              })
            }
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
              user: activeUser,
            }),
          })
        } catch (err) {
          console.error('Heartbeat error:', err)
        }
      }

      // Initial immediate trigger
      sendHeartbeat()
      fetchPresenceAndMessages()

      // Poll presence/messages every 4s, heartbeat every 25s
      pollTimerRef.current = setInterval(fetchPresenceAndMessages, 4000)
      heartbeatTimerRef.current = setInterval(sendHeartbeat, 25000)

      return () => {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current)
        if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current)

        fetch('/api/collaboration/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            room,
            type: 'LEAVE',
            user: activeUser,
          }),
        }).catch(() => {})
      }
    }
  }, [room, enabled, activeUser?.id])

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
            user: activeUser,
          }),
        }).catch(() => {})
      }
    },
    [enabled, mode, room, activeUser]
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
            user: activeUser,
          }),
        }).catch(() => {})
      }
    },
    [enabled, mode, room, activeUser]
  )

  const sendChatMessage = useCallback(
    (text: string, codeSnippet?: string) => {
      if (!enabled || !text.trim()) return

      const msgId = 'msg-' + Math.random().toString(36).substring(2, 9)
      const msgObj: ChatMessage = {
        id: msgId,
        sender: activeUser,
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
            payload: { id: msgId, text, codeSnippet },
          })
        )
      } else if (mode === 'serverless') {
        fetch('/api/collaboration/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            room,
            type: 'CHAT_MESSAGE',
            payload: { id: msgId, text, codeSnippet },
            user: activeUser,
          }),
        }).catch(() => {})
      }
    },
    [enabled, mode, room, activeUser]
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
