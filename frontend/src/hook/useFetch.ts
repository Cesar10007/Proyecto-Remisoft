// src/hooks/useFetch.ts
import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get(url)
      setData(Array.isArray(response.data) ? response.data : response.data?.data ?? [])
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Error al cargar los datos')
    } finally {
      setIsLoading(false)
    }
  }, [url])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, isLoading, error, refetch, setData }
}