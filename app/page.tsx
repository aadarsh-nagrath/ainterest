"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { Search, Bell, MessageCircle, Menu, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import SplashScreen from "@/components/splash-screen"
import GoogleLoginButton from "@/components/google-login-button"
import { useSession } from "next-auth/react"

// Predefined card aspect ratios (width/height)
const CARD_ASPECT_RATIOS = [
  { width: 1, height: 1 },    // 1:1
  { width: 3, height: 4 },    // 3:4
  { width: 4, height: 3 },    // 4:3
  { width: 16, height: 9 },   // 16:9
  { width: 9, height: 16 },   // 9:16
  { width: 2, height: 3 },    // 2:3
  { width: 3, height: 2 },    // 3:2
]

// Helper to find the closest card slot for an image
function findClosestCardSlot(imageAspect: number) {
  let minDiff = Infinity
  let bestSlot = CARD_ASPECT_RATIOS[0]
  for (const slot of CARD_ASPECT_RATIOS) {
    const slotAspect = slot.width / slot.height
    const diff = Math.abs(slotAspect - imageAspect)
    if (diff < minDiff) {
      minDiff = diff
      bestSlot = slot
    }
  }
  return bestSlot
}

// Utility to get image dimensions
function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = function () {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = reject
    img.src = url
  })
}

// Shuffle array utility
function shuffleArray<T>(array: T[]): T[] {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}

const categories = [
  { name: "tattoo", image: "/placeholder.svg?height=60&width=60" },
  { name: "fiction concept art", image: "/placeholder.svg?height=60&width=60" },
  { name: "Sci-Fi", image: "/placeholder.svg?height=60&width=60" },
  { name: "camping", image: "/placeholder.svg?height=60&width=60" },
  { name: "Lifestyle", image: "/placeholder.svg?height=60&width=60" },
  { name: "Photography", image: "/placeholder.svg?height=60&width=60" },
  { name: "Design", image: "/placeholder.svg?height=60&width=60" },
]

export default function AinterestClone() {
  const [showSplash, setShowSplash] = useState(true)
  const { data: session } = useSession()
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [nextCursor, setNextCursor] = useState<string | null>(null)

  // Simple fetch function
  const fetchImages = useCallback(async (cursor: string | null = null) => {
    if (loading) return
    console.log('Fetching images with cursor:', cursor)
    setLoading(true)
    
    try {
      const url = cursor ? `/api/images?cursor=${cursor}` : "/api/images"
      const res = await fetch(url)
      const data = await res.json()
      
      // Get dimensions for new images
      const imagesWithDimensions = await Promise.all(
        data.images.map(async (img: any) => {
          try {
            const { width, height } = await getImageDimensions(img.url)
            return { ...img, width, height }
          } catch {
            return null
          }
        })
      )
      
      const validImages = imagesWithDimensions.filter(Boolean)
      
      setImages(prev => {
        const ids = new Set(prev.map(img => img.id))
        const newImages = validImages.filter(img => !ids.has(img.id))
        
        // Only shuffle if this is the initial load (no cursor)
        const imagesToAdd = cursor ? newImages : shuffleArray(newImages)
        const combined = [...prev, ...imagesToAdd]
        console.log('Total images now:', combined.length)
        return combined
      })
      
      setNextCursor(data.nextCursor)
      setHasMore(!!data.nextCursor)
      console.log('Next cursor:', data.nextCursor)
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setLoading(false)
    }
  }, [loading])

  // Initial fetch
  useEffect(() => {
    fetchImages()
  }, [])

  // Simple scroll listener for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return
      
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      
      // If we're near the bottom (within 500px), fetch more
      if (scrollTop + windowHeight >= documentHeight - 500) {
        console.log('Near bottom, fetching more images')
        fetchImages(nextCursor)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loading, hasMore, nextCursor, fetchImages])

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500)
    return () => clearTimeout(timer)
  }, [])

  if (showSplash) return <SplashScreen />

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">A</span>
              </div>
              <span className="font-semibold text-lg hidden sm:block text-foreground">Ainterest</span>
            </div>
            <Button variant="ghost" className="hidden md:flex items-center gap-1">
              <Menu className="w-4 h-4" />
              Home feed
            </Button>
          </div>

          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search for ideas" className="pl-10 bg-muted border-0 rounded-full" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MessageCircle className="w-5 h-5" />
            </Button>
            <GoogleLoginButton />
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex justify-center py-4 border-b border-border">
        <div className="flex gap-8">
          <button className="text-foreground font-medium border-b-2 border-foreground pb-2">For you</button>
          <button className="text-muted-foreground hover:text-foreground pb-2">Explore</button>
        </div>
      </div>

      {/* Category Chips */}
      <div className="px-4 py-6 max-w-7xl mx-auto">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category, index) => (
            <div
              key={index}
              className="flex-shrink-0 bg-muted rounded-2xl p-4 min-w-[200px] cursor-pointer hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">More ideas for</p>
                  <p className="font-semibold text-foreground">{category.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="px-4 w-full">
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 2xl:columns-7 gap-4" style={{ minHeight: '100vh' }}>
          {images.map((img, index) => {
            if (!img.width || !img.height) return null
            const aspect = img.width / img.height
            const slot = findClosestCardSlot(aspect)
            return (
              <div 
                key={`${img.id}-${index}`} 
                className="break-inside-avoid mb-4 group cursor-pointer"
                style={{ contain: 'layout' }}
              >
                <div
                  className="relative rounded-2xl overflow-hidden bg-muted hover:brightness-95 transition-all duration-200 shadow-sm hover:shadow-lg"
                  style={{ aspectRatio: `${slot.width} / ${slot.height}` }}
                >
                  <Image
                    src={img.url}
                    alt={img.title}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="pt-3 px-1">
                  <h3 className="font-medium text-sm text-foreground line-clamp-2 leading-tight">{img.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{img.description}</p>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        
        {/* End message */}
        {!hasMore && !loading && (
          <div className="text-center py-8 text-muted-foreground">You've reached the end!</div>
        )}
      </div>
    </div>
  )
}
