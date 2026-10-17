/** Row generator for Quality Gate: clean records and records with exactly one data-quality defect. */

export type Field = 'id' | 'customer' | 'amount' | 'country' | 'date'
export type Defect = 'null' | 'email' | 'negative' | 'text' | 'future' | 'country' | 'duplicate'

export interface Row {
  key: number
  values: Record<Field, string | number | null>
  defect: Defect | null
  field: Field | null
}

export const RULE: Record<Defect, { field: Field; text: string }> = {
  null: { field: 'customer', text: 'customer is null' },
  email: { field: 'customer', text: 'customer is not a valid email' },
  negative: { field: 'amount', text: 'amount is negative' },
  text: { field: 'amount', text: 'amount is text, not a number' },
  future: { field: 'date', text: 'date is in the future' },
  country: { field: 'country', text: 'country is not an ISO code we accept' },
  duplicate: { field: 'id', text: 'id is already in Silver (duplicate)' },
}

const NAMES = ['maya', 'arjun', 'li.wei', 'sofia', 'omar', 'grace', 'ravi', 'elena', 'kofi', 'yuki', 'noah', 'zara']
const DOMAINS = ['mail.com', 'acme.io', 'example.org', 'shop.co', 'asu.edu']
const COUNTRIES = ['US', 'IN', 'GB', 'DE', 'CA', 'AU', 'JP', 'BR']
const BAD_COUNTRIES = ['ZZ', 'USA', 'Ind', 'XX']
const BAD_EMAILS = (n: string) => [`${n}@@mail.com`, `${n}.mail.com`, `${n}@`, `@${n}`]
const AMOUNT_WORDS = ['forty-two', 'n/a', 'ten', '1O.50']

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]
const iso = (d: Date) => d.toISOString().slice(0, 10)

/** Builds the next row. `silverIds` are ids already passed, so a duplicate can be shown fairly. */
export function makeRow(key: number, nextId: number, silverIds: number[]): Row {
  const name = pick(NAMES)
  const today = new Date()
  const past = new Date(today.getTime() - Math.floor(Math.random() * 60) * 86_400_000)
  const values: Row['values'] = {
    id: nextId,
    customer: `${name}@${pick(DOMAINS)}`,
    amount: Math.round((5 + Math.random() * 495) * 100) / 100,
    country: pick(COUNTRIES),
    date: iso(past),
  }
  if (Math.random() > 0.45) return { key, values, defect: null, field: null }

  const options: Defect[] = ['null', 'email', 'negative', 'text', 'future', 'country']
  if (silverIds.length) options.push('duplicate', 'duplicate')
  const defect = pick(options)
  switch (defect) {
    case 'null':
      values.customer = null
      break
    case 'email':
      values.customer = pick(BAD_EMAILS(name))
      break
    case 'negative':
      values.amount = -Math.round((5 + Math.random() * 200) * 100) / 100
      break
    case 'text':
      values.amount = pick(AMOUNT_WORDS)
      break
    case 'future': {
      const ahead = new Date(today.getTime() + (365 + Math.floor(Math.random() * 1500)) * 86_400_000)
      values.date = iso(ahead)
      break
    }
    case 'country':
      values.country = pick(BAD_COUNTRIES)
      break
    case 'duplicate':
      values.id = pick(silverIds)
      break
  }
  return { key, values, defect, field: RULE[defect].field }
}

export function format(v: string | number | null, field: Field): string {
  if (v === null) return 'null'
  if (field === 'amount' && typeof v === 'number') return v.toFixed(2)
  return typeof v === 'string' && field !== 'id' ? `"${v}"` : String(v)
}
