'use client'

import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'
import { Card } from './ui/card'
import Link from 'next/link'
import Image from 'next/image'

interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  categoryId: string
  category: { id: string; name: string }
  imageUrl?: string
  available: boolean
}

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const searchItems = async () => {
      if (!query.trim()) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch('/api/menu')
        const items = await response.json()

        const filtered = items
          .filter(
            (item: MenuItem) =>
              item.name.toLowerCase().includes(query.toLowerCase()) ||
              item.description?.toLowerCase().includes(query.toLowerCase()) ||
              item.category.name.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 5) // Limit to top 5 results

        setResults(filtered)
      } catch (error) {
        console.error('Search failed:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(searchItems, 300)
    return () => clearTimeout(debounce)
  }, [query])

  return (
    <div className="relative w-full max-w-xl">
      <Input
        type="search"
        placeholder="Search for items..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setShowResults(true)
        }}
        onFocus={() => setShowResults(true)}
        className="w-full"
      />

      {/* Results dropdown */}
      {showResults && (query.trim() || results.length > 0) && (
        <Card className="absolute z-50 mt-2 w-full overflow-hidden p-2">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              {results.map((item) => (
                <Link
                  key={item.id}
                  href={`/store/item/${item.id}`}
                  className="block cursor-pointer rounded-lg p-2 hover:bg-gray-100"
                  onClick={() => {
                    setShowResults(false)
                    setQuery('')
                  }}
                >
                  <div className="flex items-center gap-3">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">in {item.category.name}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">No results found</div>
          )}
        </Card>
      )}
    </div>
  )
}
