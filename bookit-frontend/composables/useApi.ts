export const useApi = () => {
  const config = useRuntimeConfig()
  const token  = useCookie('bookit_token')

  const buildUrl = (path: string, params?: Record<string, any>) => {
    const base = `${config.public.apiBase}${path}`
    if (!params) return base
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '' && v !== null)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&')
    return query ? `${base}?${query}` : base
  }

  const request = async (method: string, path: string, body?: any, params?: Record<string, any>) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`
    }

    const response = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    })

    const data = await response.json()

    if (!data.success) {
      const err: any = new Error(data.message || 'API error')
      err.status = response.status
      throw err
    }

    return data.data
  }

  return {
    get:    (path: string, params?: Record<string, any>) => request('GET', path, undefined, params),
    post:   (path: string, body: any)                    => request('POST', path, body),
    patch:  (path: string, body: any)                    => request('PATCH', path, body),
    delete: (path: string)                               => request('DELETE', path)
  }
}