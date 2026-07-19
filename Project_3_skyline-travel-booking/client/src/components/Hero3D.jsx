import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';

const MARKERS = [
  { name: 'Bali', lat: -8.4, lon: 115.2 },
  { name: 'Kyoto', lat: 35.0, lon: 135.8 },
  { name: 'Reykjavik', lat: 64.1, lon: -21.9 },
  { name: 'Cape Town', lat: -33.9, lon: 18.4 },
  { name: 'Lisbon', lat: 38.7, lon: -9.1 },
  { name: 'Queenstown', lat: -45.0, lon: 168.7 },
  { name: 'Marrakech', lat: 31.6, lon: -8.0 },
  { name: 'Banff', lat: 51.2, lon: -115.6 }
];

function latLonToVec3(lat, lon, r) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function Globe() {
  const groupRef = useRef();
  const markerPositions = useMemo(() => MARKERS.map((m) => latLonToVec3(m.lat, m.lon, 1.5)), []);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.06;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[1.5, 3]} />
        <meshBasicMaterial color="#2f8f9d" wireframe transparent opacity={0.35} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.48, 32, 32]} />
        <meshBasicMaterial color="#0b1d33" transparent opacity={0.55} />
      </mesh>
      {markerPositions.map((pos, i) => (
        <mesh key={MARKERS[i].name} position={pos}>
          <sphereGeometry args={[0.028, 12, 12]} />
          <meshBasicMaterial color="#e8a33d" />
        </mesh>
      ))}
    </group>
  );
}

function PaperPlane() {
  const ref = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.35;
    const radius = 2.6;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;
    const y = Math.sin(t * 1.3) * 0.6;
    if (ref.current) {
      ref.current.position.set(x, y, z);
      ref.current.lookAt(Math.cos(t + 0.05) * radius, Math.sin((t + 0.05) * 1.3) * 0.6, Math.sin(t + 0.05) * radius);
    }
  });

  return (
    <group ref={ref} scale={0.32}>
      {/* Fuselage */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.28, 1.4, 3]} />
        <meshStandardMaterial color="#f7f5f0" flatShading />
      </mesh>
      {/* Wings */}
      <mesh position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.65, 0.18, 3]} />
        <meshStandardMaterial color="#e8a33d" flatShading />
      </mesh>
    </group>
  );
}

function OrbitRing() {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      pts.push([Math.cos(a) * 2.6, 0, Math.sin(a) * 2.6]);
    }
    return pts;
  }, []);
  return <Line points={points} color="#e8a33d" transparent opacity={0.25} lineWidth={1} />;
}

export default function Hero3D() {
  return (
    <div className="h-full w-full cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 1.2, 4.6], fov: 42 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 3, 3]} intensity={1} />
        <Suspense fallback={null}>
          <Globe />
          <OrbitRing />
          <PaperPlane />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.4}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.6}
        />
      </Canvas>
    </div>
  );
}
