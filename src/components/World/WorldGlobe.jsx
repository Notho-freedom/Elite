import { useEffect, useRef, useState, useMemo } from 'react';
import createGlobe from 'globe.gl';
import userService from '../../services/userService';
import { useApp } from '../Context/AppContext';

function hashToRange(hashSource, min, max) {
  let hash = 0;
  for (let i = 0; i < hashSource.length; i++) {
    hash = (hash * 31 + hashSource.charCodeAt(i)) >>> 0;
  }
  const normalized = hash / 0xffffffff;
  return min + (max - min) * normalized;
}

function extractLatLng(locationField, fallbackId) {
  if (!locationField) {
    return [hashToRange(fallbackId, -60, 75), hashToRange(fallbackId.split('').reverse().join(''), -180, 180)];
  }
  if (typeof locationField === 'string') {
    try {
      const parsed = JSON.parse(locationField);
      if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
        return [parsed.lat, parsed.lng];
      }
    } catch (_) {
      // ignore
    }
  }
  if (typeof locationField === 'object') {
    const lat = typeof locationField.lat === 'number' ? locationField.lat : null;
    const lng = typeof locationField.lng === 'number' ? locationField.lng : null;
    if (lat != null && lng != null) return [lat, lng];
  }
  return [hashToRange(fallbackId, -60, 75), hashToRange(fallbackId.split('').reverse().join(''), -180, 180)];
}

const WorldGlobe = () => {
  const containerRef = useRef(null);
  const globeRef = useRef(null);
  const { theme } = useApp();
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!containerRef.current || globeRef.current) return;

    const g = createGlobe(containerRef.current)
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-dark.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundColor('rgba(0,0,0,0)')
      .pointAltitude('altitude')
      .pointColor('color')
      .pointLabel('label')
      .pointsTransitionDuration(600);

    const controls = g.controls();

    // Auto-rotate and initial POV
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.6;
    }
    
    g.pointOfView({ altitude: 2.4 });

    globeRef.current = g;
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const res = await userService.getAllUsers({});
      const users = res.success ? res.data : [];
      const pts = users.map(u => {
        const [lat, lng] = extractLatLng(u.location, u.id || u.email || u.username || Math.random().toString());
        return {
          lat,
          lng,
          altitude: 0.01 + (u.is_online ? 0.02 : 0.0),
          color: u.is_online ? 'rgba(16,185,129,0.9)' : 'rgba(59,130,246,0.8)',
          label: `${u.name || u.username || 'Utilisateur'}${u.is_online ? ' (en ligne)' : ''}`,
        };
      });
      setPoints(pts);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointsData(points);
    }
  }, [points]);

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="absolute inset-0" />
      {/* Simple overlay for stats */}
      <div className="absolute top-3 left-3 px-3 py-2 rounded-md text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
        {loading ? 'Chargement du globe…' : `${points.length} utilisateurs positionnés`}
      </div>
    </div>
  );
};

export default WorldGlobe;