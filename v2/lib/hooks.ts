'use client'

import { useSyncExternalStore } from 'react'

const noSubscribe = () => () => {}

/** True after hydration; false on the server and during the hydration pass. */
export function useIsClient(): boolean {
  return useSyncExternalStore(noSubscribe, () => true, () => false)
}

/** location.search as it was when the page loaded. Empty on the server. */
export function useInitialSearch(): string {
  return useSyncExternalStore(noSubscribe, () => window.location.search, () => '')
}
