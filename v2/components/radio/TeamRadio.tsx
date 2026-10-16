'use client'

import { Calendar, Check, Copy, Download, Mail } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { GithubIcon, LinkedinIcon } from '@/components/BrandIcons'
import { useIsClient } from '@/lib/hooks'

interface Props {
  email: string
  linkedin: string
  github: string
  booking: string | null
  resume: string
  intro: string
  formKey: string | null
}

type Phase = 'idle' | 'open' | 'sending' | 'sent' | 'error'

const BARS = 28

/** S-13 · Push to talk opens the form. Without JavaScript (or before a form key is set) the button is a mailto link. */
export function TeamRadio({ email, linkedin, github, booking, resume, intro, formKey }: Props) {
  const enhanced = useIsClient() && !!formKey
  const [phase, setPhase] = useState<Phase>('idle')
  const [typing, setTyping] = useState(false)
  const [copied, setCopied] = useState(false)
  const typingTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const firstField = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!formKey) return
    const onOpen = () => setPhase((p) => (p === 'idle' ? 'open' : p))
    window.addEventListener('radio:open', onOpen)
    return () => window.removeEventListener('radio:open', onOpen)
  }, [formKey])

  useEffect(() => {
    if (phase === 'open') firstField.current?.focus()
  }, [phase])

  const onType = () => {
    setTyping(true)
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => setTyping(false), 700)
  }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    if (data.get('botcheck')) return
    setPhase('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: formKey,
          subject: `Team radio: ${data.get('name')} (${data.get('role_type')})`,
          from_name: 'Pit wall team radio',
          name: data.get('name'),
          email: data.get('email'),
          company: data.get('company'),
          role_type: data.get('role_type'),
          message: data.get('message'),
        }),
      })
      const json = (await res.json().catch(() => ({}))) as { success?: boolean }
      setPhase(res.ok && json.success ? 'sent' : 'error')
    } catch {
      setPhase('error')
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${email}`
    }
  }

  const display =
    phase === 'sending' ? 'TRANSMITTING' : phase === 'sent' ? 'COPY THAT' : phase === 'error' ? 'NO SIGNAL' : phase === 'open' ? 'CH 01 · OPEN' : 'CH 01 · KAUSHIL'

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <div className="rounded-[28px] border border-line bg-surface p-4 shadow-[var(--shadow)] md:p-6">
          {/* Channel display */}
          <div className="rounded-2xl border border-line bg-surface-2 p-4">
            <div className="flex items-center justify-between">
              <p className="t-label text-flow" aria-live="polite">
                {display}
              </p>
              <span className="dot" data-status={phase === 'sending' || typing ? 'live' : 'none'} aria-hidden="true" />
            </div>
            <div className={`radio-wave mt-3 flex h-12 items-center gap-[3px] ${typing || phase === 'sending' ? 'is-on' : ''}`} aria-hidden="true">
              {Array.from({ length: BARS }, (_, i) => (
                <span key={i} className="block w-full rounded-full bg-flow" style={{ animationDelay: `${(i * 53) % 600}ms` }} />
              ))}
            </div>
          </div>

          <p className="mt-5 text-[17px]">{intro}</p>

          {phase === 'idle' || !enhanced ? (
            enhanced ? (
              <button type="button" onClick={() => setPhase('open')} className="btn btn-primary mt-5 h-16 w-full text-[17px]">
                <span className="dot !bg-bg" aria-hidden="true" /> Push to talk
              </button>
            ) : (
              <a href={`mailto:${email}?subject=Team%20radio`} className="btn btn-primary mt-5 h-16 w-full text-[17px]">
                <span className="dot !bg-bg" aria-hidden="true" /> Push to talk
              </a>
            )
          ) : phase === 'sent' ? (
            <p role="status" className="mt-5 rounded-2xl border border-s-green p-4 text-[17px]">
              <span className="font-semibold">Copy that. Message received.</span>
              <span className="block text-muted">I&apos;ll reply to the email you gave.</span>
            </p>
          ) : (
            <form onSubmit={submit} onInput={onType} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="Team radio message">
              <Field label="Name" name="name" required inputRef={firstField} autoComplete="name" />
              <Field label="Email" name="email" type="email" required autoComplete="email" />
              <Field label="Company" name="company" autoComplete="organization" />
              <label className="flex flex-col gap-1.5">
                <span className="t-label text-[11px] text-muted">Role type</span>
                <select name="role_type" defaultValue="Software" className="h-11 rounded-xl border border-line bg-bg px-3 text-[16px] focus:border-flow focus:outline-none">
                  <option>Data</option>
                  <option>ML</option>
                  <option>Software</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="t-label text-[11px] text-muted">Message</span>
                <textarea name="message" required rows={5} className="rounded-xl border border-line bg-bg px-3 py-2.5 text-[16px] focus:border-flow focus:outline-none" />
              </label>
              <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              {phase === 'error' ? (
                <p role="alert" className="text-[15px] sm:col-span-2">
                  <span className="t-label mr-2 text-[11px] text-s-yellow">No signal</span>
                  The message did not go through. Try again, or email{' '}
                  <a className="link" href={`mailto:${email}`}>
                    {email}
                  </a>
                  .
                </p>
              ) : null}
              <div className="flex flex-wrap gap-3 sm:col-span-2">
                <button type="submit" disabled={phase === 'sending'} className="btn btn-primary disabled:opacity-60">
                  {phase === 'sending' ? 'Transmitting…' : 'Transmit'}
                </button>
                <button type="button" onClick={() => setPhase('idle')} className="btn btn-outline">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="lg:col-span-5">
        <p className="t-label mb-3 text-muted">Other channels</p>
        <ul className="divide-y divide-line border-y border-line text-[16px]">
          <li className="flex items-center justify-between gap-3 py-3.5">
            <a href={`mailto:${email}`} className="link inline-flex min-w-0 items-center gap-3">
              <Mail aria-hidden="true" size={18} strokeWidth={1.5} className="flex-none" />
              <span className="truncate">{email}</span>
            </a>
            <button type="button" onClick={copy} className="inline-flex h-9 flex-none items-center gap-1.5 rounded-full border border-line px-3 text-[13px] hover:border-muted">
              {copied ? <Check aria-hidden="true" size={14} strokeWidth={1.5} /> : <Copy aria-hidden="true" size={14} strokeWidth={1.5} />}
              {copied ? 'Copied' : 'Copy'}
              <span className="sr-only"> email address</span>
            </button>
          </li>
          <li className="py-3.5">
            <a href={linkedin} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-3">
              <LinkedinIcon size={18} /> LinkedIn
            </a>
          </li>
          <li className="py-3.5">
            <a href={github} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-3">
              <GithubIcon size={18} /> GitHub
            </a>
          </li>
          {booking ? (
            <li className="py-3.5">
              <a href={booking} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-3">
                <Calendar aria-hidden="true" size={18} strokeWidth={1.5} /> Book 20 min
              </a>
            </li>
          ) : null}
          <li className="py-3.5">
            <a href={resume} download className="link inline-flex items-center gap-3">
              <Download aria-hidden="true" size={18} strokeWidth={1.5} /> Resume (PDF)
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required,
  autoComplete,
  inputRef,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  autoComplete?: string
  inputRef?: React.Ref<HTMLInputElement>
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="t-label text-[11px] text-muted">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </span>
      <input
        ref={inputRef}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="h-11 rounded-xl border border-line bg-bg px-3 text-[16px] focus:border-flow focus:outline-none"
      />
    </label>
  )
}
