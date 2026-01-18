'use client'

import { useState } from 'react'
import ImageUpload from '@/components/ImageUpload'

export default function TestUploadPage() {
  const [uploadedUrl, setUploadedUrl] = useState('')

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Image Upload Test</h1>
          <p className="text-gray-600 mb-8">
            Test Cloudinary image upload functionality
          </p>

          <ImageUpload
            label="Product Image"
            onUploadComplete={(url) => {
              setUploadedUrl(url)
              console.log('Uploaded URL:', url)
            }}
          />

          {uploadedUrl && (
            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">
                ✅ Upload Successful!
              </h3>
              <p className="text-sm text-gray-700 mb-2">
                Your image has been uploaded to Cloudinary
              </p>
              <div className="bg-white p-3 rounded border border-green-200">
                <p className="text-xs text-gray-600 mb-1 font-semibold">
                  Image URL:
                </p>
                <code className="text-xs break-all text-blue-600">
                  {uploadedUrl}
                </code>
              </div>
              
              <div className="mt-4">
                <p className="text-xs text-gray-600 mb-2 font-semibold">
                  How to use in your product:
                </p>
                <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`await prisma.product.create({
  data: {
    name: "Running Shoes",
    image: "${uploadedUrl}",
    price: 59.99,
    // ... other fields
  }
})`}
                </pre>
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">
              📚 How to Use in Your Forms
            </h3>
            <pre className="bg-white p-3 rounded border border-blue-200 text-xs overflow-x-auto">
{`import ImageUpload from '@/components/ImageUpload'

// In your form component:
const [imageUrl, setImageUrl] = useState('')

<ImageUpload
  label="Product Image"
  currentImage={imageUrl}
  onUploadComplete={(url) => setImageUrl(url)}
/>

// Then use imageUrl when saving to MongoDB`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
