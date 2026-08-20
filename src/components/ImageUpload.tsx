'use client'

import { useState } from 'react'
import { Upload, X, Check } from 'lucide-react'

interface ImageUploadProps {
  onUploadComplete?: (url: string) => void
  currentImage?: string
  label?: string
}

export default function ImageUpload({ 
  onUploadComplete, 
  currentImage,
  label = 'Upload Image' 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState(currentImage || '')
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string | null>(currentImage || null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB')
      return
    }

    setError('')
    setUploading(true)

    try {
      // Show preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to S3
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setImageUrl(data.url)
      
      if (onUploadComplete) {
        onUploadComplete(data.url)
      }
    } catch (err) {
      setError('Failed to upload image. Please try again.')
      setPreview(null)
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setImageUrl('')
    setPreview(null)
    if (onUploadComplete) {
      onUploadComplete('')
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
      </label>

      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
          {imageUrl && (
            <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
              <Check className="w-4 h-4" />
            </div>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-yellow-400 hover:bg-yellow-50/50 transition">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-12 h-12 text-gray-400 mb-3" />
            <p className="mb-2 text-sm text-gray-600">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 5MB)</p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
      )}

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Uploading...</span>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {imageUrl && (
        <div className="text-xs text-gray-500 break-all">
          <span className="font-semibold">URL:</span> {imageUrl}
        </div>
      )}
    </div>
  )
}
