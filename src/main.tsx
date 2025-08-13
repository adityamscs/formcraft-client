import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import React from 'react'

// Simple toast system using a custom event
function ToastHost() {
  const [queue, setQueue] = React.useState<Array<{ id: number; type: 'success'|'error'|'warning'|'info'; message: string }>>([])
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      const id = Date.now() + Math.random()
      setQueue(q => [...q, { id, type: detail.type || 'info', message: detail.message || '' }])
      setTimeout(() => setQueue(q => q.filter(t => t.id !== id)), 2500)
    }
    window.addEventListener('toast', handler as EventListener)
    return () => window.removeEventListener('toast', handler as EventListener)
  }, [])
  return (
    <div className="fixed top-4 right-4 z-[1000] space-y-2">
      {queue.map(t => (
        <div key={t.id} className={`card-compact px-4 py-3 text-sm shadow-large ${t.type === 'success' ? 'border-emerald-200 text-emerald-800 bg-emerald-50' : ''} ${t.type === 'error' ? 'border-red-200 text-red-800 bg-red-50' : ''} ${t.type === 'warning' ? 'border-amber-200 text-amber-800 bg-amber-50' : ''} ${t.type === 'info' ? 'border-blue-200 text-blue-800 bg-blue-50' : ''}`}>
          {t.message}
        </div>
      ))}
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <ToastHost />
  </StrictMode>,
)
