import { createContext, useContext, useState } from 'react'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const addNotification = (channel, text, ticketId) => {
    const n = { id: Date.now(), channel, text, ticketId, timestamp: new Date().toISOString(), read: false }
    setNotifications(prev => [n, ...prev].slice(0, 20))
  }

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const value = useContext(NotificationContext)
  if (!value) throw new Error('useNotifications must be inside NotificationProvider')
  return value
}
