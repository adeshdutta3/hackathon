import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

const loading = () => {
  return (
    <div className="flex h-full w-full  items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="loader mb-4"></div>
        <p className="text-lg">
            loading...
        </p>
      </div>
    </div>
  )
}

export default loading