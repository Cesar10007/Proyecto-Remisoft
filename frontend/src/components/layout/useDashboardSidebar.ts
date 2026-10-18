import { useSyncExternalStore } from 'react'

const storageKey = 'dashboard-sidebar-collapsed'
const subscribers = new Set<() => void>()

function readPreference() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(storageKey) === 'true'
}

let collapsed = readPreference()

function notifySubscribers() {
  subscribers.forEach((subscriber) => subscriber())
}

function subscribe(subscriber: () => void) {
  if (subscribers.size === 0) {
    window.addEventListener('storage', handleStorageChange)
  }
  subscribers.add(subscriber)
  return () => {
    subscribers.delete(subscriber)
    if (subscribers.size === 0) {
      window.removeEventListener('storage', handleStorageChange)
    }
  }
}

function handleStorageChange(event: StorageEvent) {
  if (event.key !== storageKey && event.key !== null) return
  collapsed = readPreference()
  notifySubscribers()
}

function getSnapshot() {
  return collapsed
}

export function setDashboardSidebarCollapsed(value: boolean) {
  window.localStorage.setItem(storageKey, String(value))
  collapsed = value
  notifySubscribers()
}

export function useDashboardSidebarCollapsed() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
