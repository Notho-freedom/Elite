import React from 'react';
import { useApp } from './Context/AppContext'; // adapte le chemin selon ta structure

const CallScreen = () => {
  const { activeCall, callHandlers, setActiveCall } = useApp();

  if (!activeCall) return null; // ou un fallback UI si pas d'appel actif

  return (
    <div className="relative h-screen w-screen bg-black flex flex-col items-center justify-center text-white">
      <p className="text-xl font-semibold">
        Call with {activeCall?.callerName || "Unknown"}
      </p>
      <div className="mt-4 flex gap-4">
        <button
          className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
          onClick={() => {
            callHandlers.endCall();
            setActiveCall(null); // redondant mais safe
          }}
        >
          End Call
        </button>

        <button
          className={`px-4 py-2 rounded transition ${
            activeCall.isMuted ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'
          }`}
          onClick={callHandlers.toggleMute}
        >
          {activeCall.isMuted ? 'Unmute' : 'Mute'}
        </button>

        <button
          className={`px-4 py-2 rounded transition ${
            activeCall.isVideoOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600'
          }`}
          onClick={callHandlers.toggleVideo}
        >
          {activeCall.isVideoOn ? 'Video On' : 'Video Off'}
        </button>
      </div>
    </div>
  );
};

export default CallScreen;
