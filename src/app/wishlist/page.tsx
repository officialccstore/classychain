'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function WishlistPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view and manage your wishlist</p>
          <Link href="/login" className="inline-block bg-secondary text-black px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">My Wishlist</h1>
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">Your wishlist is empty</p>
          <p className="text-gray-400 text-sm mb-6">
            Start adding your favorite shoes to your wishlist!
          </p>
          <Link href="/products" className="inline-block bg-secondary text-black px-6 py-2 rounded-lg font-bold hover:bg-yellow-400 transition">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
