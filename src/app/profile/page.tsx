'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface UserData {
  id: string
  email: string
  name: string
  role: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (err) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view your profile</p>
          <Link href="/login" className="inline-block bg-secondary text-black px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">My Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-secondary to-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                👤
              </div>
              <h2 className="text-xl font-bold mb-2">{user.name}</h2>
              <p className="text-gray-600 mb-4">{user.email}</p>
              <p className="text-sm text-gray-500 mb-4 capitalize">Role: {user.role}</p>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Recent Orders</h3>
              <div className="text-gray-500">
                <p>No orders yet. Start shopping now!</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Saved Addresses</h3>
              <div className="text-gray-500">
                <p>No addresses saved yet.</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Account Settings</h3>
              <button className="text-secondary font-bold hover:underline">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
