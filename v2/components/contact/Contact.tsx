'use client'

import { Calendar, Check, Copy, Download, Mail, Send } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { GithubIcon, LinkedinIcon } from '@/components/BrandIcons'
import { useIsClient } from '@/lib/hooks'

interface Props {
  email: string
  linkedin: string
  github: string
  booking: string | null
  resume: string
  formKey: string | null
  timeZone: string
}

const TOPICS = [
  { id: 'role', label: 'Hiring for a role', subject: 'Role' },
  { id: 'project', label: 'A project or collaboration', subject: 'Project' },
  { id: 'question', label: 'A question about my work', subject: 'Question' },
  { id: 'hello', label: 'Just saying hi', subject: 'Hello' },
] as const

type Sent = 'idle' | 'sending' | 'sent' | 'error'

const enc = encodeURIComponent

/**
 * Contact: write a message and watch it become an email draft. "Open in Gmail" works without JavaScript or a
 * backend (it is a plain GET form to Gmail's composer); the email-app and copy actions appear once the page is
 * interactive. With NEXT_PUBLIC_WEB3FORMS_KEY set, "Send" delivers it directly.
 */
export function Contact({ email, linkedin, github, booking, resume, formKey, timeZone }: Props) {
  const ready = useIsClient()
  const [topic, setTopic] = useState<(typeof TOPICS)[number]['id']>('role')
  const [name, setName] = useState('')
  const [from, setFrom] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState<'' | 'email' | 'message'>('')
  const [sent, setSent] = useState<Sent>('idle')
  const messageField = useRef<HTMLTextAreaElement>(null)

  // The command palette's "Write a message" (and "box box") lands here.
  useEffect(() => {
    const focus = () => setTimeout(() => messageField.current?.focus(), 350)
    window.addEventListener('contact:compose', focus)
    return () => window.removeEventListener('contact:compose', focus)
  }, [])

  const subject = useMemo(() => {
    const t = TOPICS.find((x) => x.id === topic)!.subject
    return [t, company.trim(), name.trim() ? `from ${name.trim()}` : ''].filter(Boolean).join(' · ')
  }, [topic, company, name])

  const signature = [name.trim(), company.trim()].filter(Boolean).join(', ')
  const body = [message.trim(), [signature, from.trim()].filter(Boolean).join('\n')].filter(Boolean).join('\n\n')

  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${enc(email)}&su=${enc(subject)}&body=${enc(body)}`
  const mailto = `mailto:${email}?subject=${enc(subject)}&body=${enc(body)}`

  const copy = async (what: 'email' | 'message') => {
    const text = what === 'email' ? email : `To: ${email}\nSubject: ${subject}\n\n${body}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(what)
      setTimeout(() => setCopied(''), 1800)
    } catch {
      window.location.href = mailto
    }
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formKey) {
      window.open(gmail, '_blank', 'noopener,noreferrer')
      return
    }
    setSent('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: formKey, subject, from_name: name || 'Portfolio visitor', name, email: from, company, message }),
      })
      const json = (await res.json().catch(() => ({}))) as { success?: boolean }
      setSent(res.ok && json.success ? 'sent' : 'error')
    } catch {
      setSent('error')
    }
  }

  const field = 'h-11 w-full rounded-xl border border-line bg-bg px-3 text-[16px] focus:border-flow focus:outline-none'

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Composer: a GET form to Gmail's composer, so it works before (and without) JavaScript */}
      <form
        action="https://mail.google.com/mail/"
        method="get"
        target="_blank"
        onSubmit={onSubmit}
        className="card p-5 md:p-7 lg:col-span-7"
        aria-label="Write to Kaushil"
      >
        <input type="hidden" name="view" value="cm" />
        <input type="hidden" name="fs" value="1" />
        <input type="hidden" name="to" value={email} />
        <input type="hidden" name="su" value={subject} />

        <fieldset>
          <legend className="t-label mb-3 text-[11px] text-muted">What is this about?</legend>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <label key={t.id} className="cursor-pointer">
                <input type="radio" name="topic" value={t.id} checked={topic === t.id} onChange={() => setTopic(t.id)} className="peer sr-only" />
                <span className="chip !py-2 text-[13px] peer-checked:!border-text peer-checked:!bg-text peer-checked:!text-bg peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-flow">
                  {t.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="t-label text-[11px] text-muted">Your name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} name="name" autoComplete="name" className={field} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="t-label text-[11px] text-muted">Company (optional)</span>
            <input value={company} onChange={(e) => setCompany(e.target.value)} name="company" autoComplete="organization" className={field} />
          </label>
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="t-label text-[11px] text-muted">Your email, so I can reply (optional)</span>
            <input value={from} onChange={(e) => setFrom(e.target.value)} name="from" type="email" autoComplete="email" className={field} />
          </label>
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="t-label text-[11px] text-muted">Message</span>
            <textarea
              ref={messageField}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              name="body"
              required
              rows={5}
              className="rounded-xl border border-line bg-bg px-3 py-2.5 text-[16px] focus:border-flow focus:outline-none"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {formKey && ready ? (
            <button type="submit" disabled={sent === 'sending'} className="btn btn-primary disabled:opacity-60">
              <Send aria-hidden="true" size={16} strokeWidth={1.5} /> {sent === 'sending' ? 'Sending…' : 'Send'}
            </button>
          ) : (
            <button type="submit" className="btn btn-primary">
              <Mail aria-hidden="true" size={16} strokeWidth={1.5} /> Open in Gmail
            </button>
          )}
          {ready ? (
            <>
              <a href={mailto} className="btn btn-outline">
                Email app
              </a>
              <button type="button" onClick={() => copy('message')} className="btn btn-text">
                {copied === 'message' ? <Check aria-hidden="true" size={15} strokeWidth={1.5} /> : <Copy aria-hidden="true" size={15} strokeWidth={1.5} />}
                {copied === 'message' ? 'Copied' : 'Copy message'}
              </button>
            </>
          ) : null}
        </div>
        <p className="mt-3 text-[13px] text-muted" role="status" aria-live="polite">
          {sent === 'sent'
            ? 'Message received. I will reply to the email you gave.'
            : sent === 'error'
              ? `That did not go through. Email ${email} directly.`
              : formKey
                ? 'Sends straight to my inbox.'
                : 'Opens a ready-to-send draft; nothing is sent from this page.'}
        </p>
      </form>

      <div className="flex flex-col gap-6 lg:col-span-5">
        {/* Live preview of the draft, postmarked from Tempe */}
        <figure className="relative m-0 overflow-hidden rounded-2xl border border-line bg-surface-2 p-5" aria-label="Email preview">
          <Postmark timeZone={timeZone} />
          <p className="t-label text-[11px] text-muted">Preview</p>
          <dl className="mt-3 space-y-1.5 pr-24 text-[14px]">
            <div className="flex gap-2">
              <dt className="w-16 flex-none text-muted">To</dt>
              <dd className="min-w-0 truncate">{email}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-16 flex-none text-muted">Subject</dt>
              <dd className="min-w-0 font-semibold">{subject}</dd>
            </div>
          </dl>
          <div className="mt-4 min-h-28 whitespace-pre-wrap border-t border-line pt-4 text-[15px] leading-relaxed">
            {body || <span className="text-muted">Your message appears here as you type.</span>}
          </div>
        </figure>

        <ul className="divide-y divide-line border-y border-line text-[16px]" aria-label="Other ways to reach me">
          <li className="flex items-center justify-between gap-3 py-3">
            <a href={`mailto:${email}`} className="link inline-flex min-w-0 items-center gap-3">
              <Mail aria-hidden="true" size={18} strokeWidth={1.5} className="flex-none" />
              <span className="truncate">{email}</span>
            </a>
            {ready ? (
              <button type="button" onClick={() => copy('email')} className="inline-flex h-9 flex-none items-center gap-1.5 rounded-full border border-line px-3 text-[13px] hover:border-muted">
                {copied === 'email' ? <Check aria-hidden="true" size={14} strokeWidth={1.5} /> : <Copy aria-hidden="true" size={14} strokeWidth={1.5} />}
                {copied === 'email' ? 'Copied' : 'Copy'}
                <span className="sr-only"> email address</span>
              </button>
            ) : null}
          </li>
          <li className="flex flex-wrap gap-x-6 gap-y-2 py-3">
            <a href={linkedin} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-2">
              <LinkedinIcon size={17} /> LinkedIn
            </a>
            <a href={github} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-2">
              <GithubIcon size={17} /> GitHub
            </a>
            <a href={resume} download className="link inline-flex items-center gap-2">
              <Download aria-hidden="true" size={17} strokeWidth={1.5} /> Resume
            </a>
            {booking ? (
              <a href={booking} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-2">
                <Calendar aria-hidden="true" size={17} strokeWidth={1.5} /> Book 20 min
              </a>
            ) : null}
          </li>
        </ul>
      </div>
    </div>
  )
}

/** A round postmark with today's date in Tempe, like the stamp on a letter. */
function Postmark({ timeZone }: { timeZone: string }) {
  const ready = useIsClient()
  const date = ready ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone }).format(new Date()).toUpperCase() : ''
  return (
    <svg viewBox="0 0 100 100" className="absolute right-4 top-4 h-20 w-20 rotate-[-12deg] text-flow opacity-80" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
      <text x="50" y="40" textAnchor="middle" fontSize="11" fontWeight={700} fill="currentColor" className="font-mono" letterSpacing="1">
        TEMPE AZ
      </text>
      <text x="50" y="56" textAnchor="middle" fontSize="8.5" fill="currentColor" className="font-mono">
        {date}
      </text>
      <path d="M22 66 H78" stroke="currentColor" strokeWidth="1" />
      <text x="50" y="77" textAnchor="middle" fontSize="7" fill="currentColor" className="font-mono" letterSpacing="1">
        PORTFOLIO
      </text>
    </svg>
  )
}
