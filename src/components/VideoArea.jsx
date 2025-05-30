import { useEffect, useRef, useState } from 'react';
import { FaVideoSlash } from 'react-icons/fa';

const LOCAL_VIDEO_CONSTRAINTS = { video: true, audio: false };
const BACKGROUND_VIDEO_SRC = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm";

const VideoArea = ({ activeCall }) => {
  const mainVideoRef = useRef(null);
  const miniVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [isLocalMain, setIsLocalMain] = useState(true);

  // Démarrer / arrêter le stream local selon activeCall?.isVideoOn
  useEffect(() => {
    if (!activeCall?.isVideoOn) {
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
        setLocalStream(null);
      }
      return;
    }

    const startLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(LOCAL_VIDEO_CONSTRAINTS);
        setLocalStream(stream);
      } catch (err) {
        console.error("Error accessing local media:", err);
      }
    };

    startLocalStream();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
        setLocalStream(null);
      }
    };
  }, [activeCall?.isVideoOn]);

  // On met à jour la vidéo principale et mini à chaque changement de stream ou toggle
  useEffect(() => {
    if (!mainVideoRef.current || !miniVideoRef.current) return;

    if (isLocalMain) {
      // Local stream en grand, vidéo background en mini
      mainVideoRef.current.srcObject = localStream;
      mainVideoRef.current.src = null;  // nécessaire pour forcer le reload
      miniVideoRef.current.srcObject = null;
      miniVideoRef.current.src = BACKGROUND_VIDEO_SRC;
      miniVideoRef.current.loop = true;
      miniVideoRef.current.muted = true;
      miniVideoRef.current.play().catch(() => {});
    } else {
      // Vidéo background en grand, local stream en mini
      mainVideoRef.current.srcObject = null;
      mainVideoRef.current.src = BACKGROUND_VIDEO_SRC;
      mainVideoRef.current.loop = true;
      mainVideoRef.current.muted = true;
      mainVideoRef.current.play().catch(() => {});

      miniVideoRef.current.srcObject = localStream;
      miniVideoRef.current.src = null;
    }

    // Play les vidéos stream ou source
    if (localStream) {
      if (isLocalMain) {
        mainVideoRef.current.play().catch(() => {});
      } else {
        miniVideoRef.current.play().catch(() => {});
      }
    }

  }, [isLocalMain, localStream]);

  const toggleVideoSource = (e) => {
    e.stopPropagation();  // éviter toggle depuis le container global
    setIsLocalMain(prev => !prev);
  };

  return (
    <div className="relative flex-1 bg-[#2a2a2a] h-screen min-w-[420px]">
      {/* Vidéo principale */}
      <video
        ref={mainVideoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        {/* Pas de source ici, source fixée via ref dans useEffect */}
      </video>

      {/* Mini carte - clic toggle */}
      <div
        onClick={toggleVideoSource}
        className="absolute bottom-8 right-8 rounded-lg overflow-hidden shadow-lg w-[120px] h-[96px] bg-[#2a2a2a] z-10 cursor-pointer"
      >
        <video
          ref={miniVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      {/* Affichage fallback quand la vidéo locale n'est pas disponible */}
      {!activeCall?.isVideoOn && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <FaVideoSlash className="text-gray-400 text-6xl" />
        </div>
      )}
    </div>
  );
};

export default VideoArea;
