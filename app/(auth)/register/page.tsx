/**
 * app/(auth)/register/page.tsx
 * AUTH-01: Account creation form.
 */
'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    const csrf = document.cookie
      .split('; ')
      .find((c) => c.startsWith('csrf_token='))
      ?.split('=')[1] ?? ''

    startTransition(async () => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Registration failed.')
      } else {
        setSuccess(true)
      }
    })
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Check your email</h1>
          <p className="text-gray-600 text-sm">We sent a verification link to <strong>{email}</strong>. Click it to activate your account.</p>
          <Link href="/login" className="mt-6 inline-block text-blue-600 hover:underline text-sm">Back to sign in</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Create account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email" type="email" autoComplete="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password" type="password" autoComplete="new-password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-400">8+ characters, 1 uppercase, 1 number</p>
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">Confirm password</label>
            <input
              id="confirm" type="password" autoComplete="new-password" required
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit" disabled={isPending}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  )
}
