"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface UseApiResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Generic hook for fetching data from the API.
 *
 * @param fetcher  – async function that returns data
 * @param deps     – dependency array (re-fetches when values change)
 *
 * @example
 * const { data, loading, error } = useApi(() => bookingService.getBookings(), [])
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMounted = useRef(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetcher()
      if (isMounted.current) setData(result)
    } catch (err: unknown) {
      if (!isMounted.current) return
      const msg =
        (err as any)?.response?.data?.error ??
        (err as Error).message ??
        "Something went wrong"
      setError(msg)
    } finally {
      if (isMounted.current) setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    isMounted.current = true
    load()
    return () => {
      isMounted.current = false
    }
  }, [load])

  return { data, loading, error, refetch: load }
}
