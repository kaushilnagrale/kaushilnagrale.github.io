'use client'

import { useEffect, useState } from 'react'

export function toast(message: string) {
  window.dispatchEvent(new CustomEvent('toast', { detail: message }))
}

export function Toaster() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const onToast = (e: Event) => {
      setMessage((e as CustomEvent<string>).detail)
      clearTimeout(timer)
      timer = setTimeout(() => setMessage(''), 2400)
    }
    window.addEventListener('toast', onToast)
    return () => {
      window.removeEventListener('toast', onToast)
      clearTimeout(timer)
    }
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      className={`no-print pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex justify-center px-4 transition-opacity duration-150 xl:bottom-14 ${
        message ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {message ? (
        <p className="rounded-full border border-line bg-surface-2 px-4 py-2 font-mono text-[13px] tracking-[0.04em] text-text">{message}</p>
      ) : null}
    </div>
  )
}
