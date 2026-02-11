"use client"

import { useRef, Suspense, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Mesh } from "three"
import { Caustics, Environment } from "@react-three/drei"

interface PrismProps {
  color?: string
}

function GlassPrismMesh({ color = "#ffffff" }: PrismProps) {
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      // Langsames, subtiles Wiegen auf der Z-Achse
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.15) * 0.1
    }
  })

  return (
    <>
      <mesh 
        ref={meshRef} 
        position={[0, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]} // 90° Rotation um X-Achse (liegend)
      >
        {/* Dreieckiges Prisma: CylinderGeometry mit 3 Segmenten */}
        <cylinderGeometry args={[1, 1, 3, 3]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          transmission={1} // Komplett durchsichtig
          roughness={0} // Spiegelglatt
          metalness={0}
          ior={1.5} // Lichtbrechungsindex von Glas
          thickness={2}
          clearcoat={1}
          clearcoatRoughness={0}
          envMapIntensity={1}
        />
      </mesh>
      {/* Caustics für Lichtbrechung */}
      <Caustics
        lightSource={[2.5, 5, 2.5]}
        worldRadius={3}
        ior={1.5}
        intensity={0.5}
        causticsOnly={false}
        backside={false}
      />
    </>
  )
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm border border-slate-200/30 animate-pulse" />
    </div>
  )
}

interface GlassPrismProps {
  className?: string
  hoverColor?: string
}

export default function GlassPrism({ className = "", hoverColor }: GlassPrismProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // Prüfe ob Mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!isMounted) {
    return (
      <div className={`absolute inset-0 pointer-events-none ${className}`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 backdrop-blur-sm border border-slate-200/30 rounded-full animate-pulse" />
      </div>
    )
  }

  // Responsive Kamera-Position
  const cameraPosition: [number, number, number] = isMobile ? [0, 0, 9] : [0, 0, 5]

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`} style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: cameraPosition, fov: 50 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ 
          alpha: true, 
          antialias: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} />
          <pointLight position={[-5, -5, -5]} intensity={0.8} />
          <Environment preset="city" />
          <GlassPrismMesh color={hoverColor || "#ffffff"} />
        </Suspense>
      </Canvas>
    </div>
  )
}
