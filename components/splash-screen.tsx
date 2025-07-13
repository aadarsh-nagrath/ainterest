"use client"

import { useEffect, useState } from "react"

export default function SplashScreen() {
  const [animationPhase, setAnimationPhase] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setAnimationPhase(1), 300),
      setTimeout(() => setAnimationPhase(2), 800),
      setTimeout(() => setAnimationPhase(3), 1500),
    ]

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-red-500 via-red-600 to-red-700 flex items-center justify-center overflow-hidden">
      {/* Animated Background Circles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-white/10 animate-pulse ${
              animationPhase >= 1 ? "opacity-100" : "opacity-0"
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 100 + 20}px`,
              height: `${Math.random() * 100 + 20}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Logo Container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Ainterest Logo */}
        <div
          className={`relative transition-all duration-1000 ${
            animationPhase >= 1 ? "scale-100 opacity-100 rotate-0" : "scale-50 opacity-0 rotate-180"
          }`}
        >
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden">
            {/* Animated shine effect */}
            <div
              className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 transition-transform duration-1000 ${
                animationPhase >= 2 ? "translate-x-full" : "-translate-x-full"
              }`}
            />
            <span className="text-red-600 font-bold text-4xl relative z-10">A</span>
          </div>

          {/* Floating pins animation */}
          {animationPhase >= 2 && (
            <>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-white rounded-full animate-bounce"
                  style={{
                    left: `${50 + Math.cos((i * Math.PI * 2) / 8) * 60}px`,
                    top: `${50 + Math.sin((i * Math.PI * 2) / 8) * 60}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: "1s",
                  }}
                />
              ))}
            </>
          )}
        </div>

        {/* Ainterest Text */}
        <div
          className={`mt-6 transition-all duration-1000 delay-500 ${
            animationPhase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h1 className="text-white text-4xl font-bold tracking-wide">Ainterest</h1>
          <div className="flex justify-center mt-2">
            <div
              className={`h-1 bg-white rounded-full transition-all duration-1000 ${
                animationPhase >= 3 ? "w-32" : "w-0"
              }`}
            />
          </div>
        </div>

        {/* Loading dots */}
        <div
          className={`flex gap-2 mt-8 transition-opacity duration-500 ${
            animationPhase >= 2 ? "opacity-100" : "opacity-0"
          }`}
        >
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-white rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Fade out overlay */}
      <div
        className={`absolute inset-0 bg-white transition-opacity duration-1000 ${
          animationPhase >= 3 ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  )
}
