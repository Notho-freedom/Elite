import React, { useEffect, useMemo, useRef, useState } from 'react';
import Globe from 'globe.gl';
import { useApp } from '../Context/AppContext';
import useAllUsers from '../../hooks/useAllUsers';

function hashStringToNumber(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    // Simple hash
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function positionFromId(id) {
  const seed = hashStringToNumber(id);
  const lat = ((seed % 180000) / 1000) - 90; // [-90, 90]
  const lng = (((Math.floor(seed / 180000)) % 360000) / 1000) - 180; // [-180, 180]
  const clampedLat = Math.max(-75, Math.min(75, lat));
  return { lat: clampedLat, lng };
}

function extractLatLng(u) {
  // Try structured location first
  const loc = u.location || u.user_metadata?.location;
  if (loc) {
    if (typeof loc === 'object' && loc.lat != null && loc.lng != null) {
      return { lat: Number(loc.lat), lng: Number(loc.lng) };
    }
    if (typeof loc === 'string') {
      const match = loc.match(/(-?\d+\.?\d*)[,; ]+(-?\d+\.?\d*)/);
      if (match) {
        return { lat: Number(match[1]), lng: Number(match[2]) };
      }
    }
  }
  return positionFromId(u.id || u.email || u.username || Math.random().toString());
}

const WorldGlobe = () => {
  const containerRef = useRef(null);
  const globeRef = useRef(null);
  const { theme } = useApp();
  const { users } = useAllUsers();
  const [ready, setReady] = useState(false);

  const points = useMemo(() => {
    return users.map((u) => {
      const { lat, lng } = extractLatLng(u);
      return {
        lat,
        lng,
        size: u.is_online ? 0.7 : 0.4,
        color: u.is_online ? 'rgba(59,130,246,0.95)' : 'rgba(156,163,175,0.9)',
        name: u.name || u.username || u.email || 'Utilisateur',
      };
    });
  }, [users]);

  useEffect(() => {
    if (!containerRef.current || globeRef.current) return;

    const globe = Globe()
      (containerRef.current)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundColor('rgba(0,0,0,0)')
      .pointAltitude('size')
      .pointColor('color')
      .pointLabel('name')
      .pointsData([]);

    // Improve visuals
    globe.pointOfView({ altitude: 2.2 });

    globeRef.current = globe;
    setReady(true);

    const handleResize = () => {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      globe.width(width);
      globe.height(height);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!ready || !globeRef.current) return;
    globeRef.current.pointsData(points);
  }, [points, ready]);

  return (
    <div className={`${theme.bgColor} w-full h-full relative`}>
      <div ref={containerRef} className="absolute inset-0" />
      {!users.length && (
        <div className="absolute inset-0 flex items-center justify-center text-sm opacity-70">
          Chargement du globe...
        </div>
      )}
    </div>
  );
};

export default WorldGlobe;