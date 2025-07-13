"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Search, Bell, MessageCircle, Menu, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import SplashScreen from "@/components/splash-screen"

// Mock data for Ainterest-style pins with realistic aspect ratios
const generatePins = (startIndex: number, count: number) => {
  const categories = ["Fashion", "Food", "Travel", "Art", "Design", "Photography", "Nature", "Architecture"]

  // Realistic Ainterest-style image dimensions with different aspect ratios
  const imageDimensions = [
    { width: 300, height: 400 }, // Portrait (3:4)
    { width: 300, height: 500 }, // Tall portrait
    { width: 300, height: 200 }, // Landscape (3:2)
    { width: 300, height: 300 }, // Square (1:1)
    { width: 300, height: 600 }, // Very tall portrait
    { width: 300, height: 180 }, // Wide landscape (16:9)
    { width: 300, height: 450 }, // Standard portrait
    { width: 300, height: 350 }, // Medium portrait
    { width: 300, height: 250 }, // Medium landscape
    { width: 300, height: 800 }, // Extra tall (like infographics)
    { width: 300, height: 150 }, // Very wide (panoramic)
    { width: 300, height: 375 }, // Phone screenshot ratio
  ]

  const titles = [
    "Minimalist Home Decor Ideas",
    "Delicious Pasta Recipe",
    "Mountain Hiking Adventure",
    "Abstract Digital Art",
    "Cozy Reading Nook",
    "Sunset Photography Tips",
    "Garden Design Inspiration",
    "Modern Architecture",
    "Fashion Street Style",
    "Healthy Breakfast Bowl",
    "Travel Photography",
    "Interior Design Trends",
    "Landscape Photography",
    "Art Studio Setup",
    "Vintage Fashion",
    "Food Styling Tips",
    "Nature Photography",
    "Home Office Design",
    "Portrait Photography",
    "Urban Architecture",
  ]

  return Array.from({ length: count }, (_, i) => {
    const dimensions = imageDimensions[Math.floor(Math.random() * imageDimensions.length)]
    const title = titles[Math.floor(Math.random() * titles.length)]
    const category = categories[Math.floor(Math.random() * categories.length)]

    return {
      id: startIndex + i,
      title: `${title} ${startIndex + i + 1}`,
      description: `Beautiful ${category.toLowerCase()} inspiration for your next project`,
      image: `/placeholder.svg?height=${dimensions.height}&width=${dimensions.width}`,
      width: dimensions.width,
      height: dimensions.height,
      category: category,
      saves: Math.floor(Math.random() * 1000) + 10,
      aspectRatio: dimensions.height / dimensions.width,
    }
  })
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
  const [pins, setPins] = useState(() => generatePins(0, 30))
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadMorePins = useCallback(() => {
    if (loading || !hasMore) return

    setLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      const newPins = generatePins(pins.length, 20)
      setPins((prev) => [...prev, ...newPins])
      setLoading(false)

      // Stop loading more after 200 pins for demo
      if (pins.length >= 200) {
        setHasMore(false)
      }
    }, 1000)
  }, [pins.length, loading, hasMore])

  // Hide splash screen after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMorePins()
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [loadMorePins])

  if (showSplash) {
    return <SplashScreen />
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-semibold text-lg hidden sm:block">Ainterest</span>
            </div>
            <Button variant="ghost" className="hidden md:flex items-center gap-1">
              <Menu className="w-4 h-4" />
              Home feed
            </Button>
          </div>

          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search for ideas" className="pl-10 bg-gray-100 border-0 rounded-full" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex justify-center py-4 border-b border-gray-100">
        <div className="flex gap-8">
          <button className="text-black font-medium border-b-2 border-black pb-2">For you</button>
          <button className="text-gray-600 hover:text-black pb-2">Explore</button>
        </div>
      </div>

      {/* Category Chips */}
      <div className="px-4 py-6 max-w-7xl mx-auto">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category, index) => (
            <div
              key={index}
              className="flex-shrink-0 bg-gray-100 rounded-2xl p-4 min-w-[200px] cursor-pointer hover:bg-gray-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300">
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600">More ideas for</p>
                  <p className="font-semibold text-black">{category.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="px-4 max-w-7xl mx-auto">
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 2xl:columns-7 gap-4">
          {pins.map((pin) => (
            <div key={pin.id} className="break-inside-avoid mb-4 group cursor-pointer">
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 hover:brightness-95 transition-all duration-200 shadow-sm hover:shadow-lg">
                <Image
                  src={pin.image || "/placeholder.svg"}
                  alt={pin.title}
                  width={pin.width}
                  height={pin.height}
                  className="w-full h-auto object-cover"
                  style={{ aspectRatio: `${pin.width}/${pin.height}` }}
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-end p-4 opacity-0 group-hover:opacity-100">
                  <div className="w-full flex justify-between items-end">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90 hover:bg-white text-black rounded-full text-xs px-3"
                      >
                        Share
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90 hover:bg-white text-black rounded-full text-xs px-3"
                      >
                        More
                      </Button>
                    </div>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white rounded-full px-4">
                      Save
                    </Button>
                  </div>
                </div>

                {/* Pin Info */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white text-black rounded-full text-xs px-2"
                  >
                    {pin.saves}
                  </Button>
                </div>
              </div>

              {/* Pin Details */}
              <div className="pt-3 px-1">
                <h3 className="font-medium text-sm text-gray-900 line-clamp-2 leading-tight">{pin.title}</h3>
                <p className="text-xs text-gray-600 mt-1 line-clamp-1">{pin.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        )}

        {/* End Message */}
        {!hasMore && <div className="text-center py-8 text-gray-500">You've reached the end!</div>}
      </div>
    </div>
  )
}
