// Call Store - Gestion d'état pour les appels vocaux et vidéo
import { create } from 'zustand';

// Types d'appels
export const CALL_TYPES = {
  VOICE: 'voice',
  VIDEO: 'video',
  GROUP_VOICE: 'group_voice',
  GROUP_VIDEO: 'group_video'
};

// États d'appel
export const CALL_STATES = {
  IDLE: 'idle',
  DIALING: 'dialing',
  RINGING: 'ringing',
  CONNECTED: 'connected',
  ON_HOLD: 'on_hold',
  ENDED: 'ended',
  MISSED: 'missed',
  REJECTED: 'rejected',
  BUSY: 'busy'
};

// États des participants
export const PARTICIPANT_STATES = {
  INVITED: 'invited',
  RINGING: 'ringing',
  CONNECTED: 'connected',
  ON_HOLD: 'on_hold',
  LEFT: 'left',
  REJECTED: 'rejected',
  BUSY: 'busy'
};

// État initial
const initialState = {
  // Appel actuel
  currentCall: null,
  
  // Historique des appels
  callHistory: [],
  
  // Paramètres d'appel
  settings: {
    autoAnswer: false,
    muteOnStart: false,
    videoOnStart: true,
    speakerMode: false,
    noiseReduction: true,
    echoCancellation: true,
    autoRecord: false
  },
  
  // État des médias
  mediaState: {
    isMuted: false,
    isVideoEnabled: true,
    isSpeakerOn: false,
    isRecording: false,
    isScreenSharing: false
  },
  
  // Participants
  participants: [],
  
  // Statistiques d'appel
  callStats: {
    duration: 0,
    quality: 'good',
    bandwidth: 0,
    packetLoss: 0
  }
};

// Store Zustand
export const useCallStore = create((set, get) => ({
  ...initialState,
  
  // Actions pour les appels
  startCall: (participants, type = CALL_TYPES.VOICE) => {
    const call = {
      id: Date.now().toString(),
      type,
      participants,
      state: CALL_STATES.DIALING,
      startTime: new Date(),
      duration: 0
    };
    
    set({
      currentCall: call,
      participants: participants.map(p => ({
        ...p,
        state: PARTICIPANT_STATES.INVITED,
        joinTime: null,
        leaveTime: null
      }))
    });
    
    return call;
  },
  
  answerCall: (callId) => {
    const { currentCall } = get();
    if (currentCall && currentCall.id === callId) {
      set({
        currentCall: { ...currentCall, state: CALL_STATES.CONNECTED },
        participants: get().participants.map(p => ({
          ...p,
          state: PARTICIPANT_STATES.CONNECTED,
          joinTime: new Date()
        }))
      });
    }
  },
  
  endCall: () => {
    const { currentCall, participants } = get();
    if (currentCall) {
      const endTime = new Date();
      const duration = Math.floor((endTime - currentCall.startTime) / 1000);
      
      const endedCall = {
        ...currentCall,
        state: CALL_STATES.ENDED,
        endTime,
        duration
      };
      
      set({
        currentCall: null,
        participants: [],
        callHistory: [endedCall, ...get().callHistory]
      });
    }
  },
  
  rejectCall: (callId) => {
    const { currentCall } = get();
    if (currentCall && currentCall.id === callId) {
      const rejectedCall = {
        ...currentCall,
        state: CALL_STATES.REJECTED,
        endTime: new Date()
      };
      
      set({
        currentCall: null,
        participants: [],
        callHistory: [rejectedCall, ...get().callHistory]
      });
    }
  },
  
  // Actions pour les participants
  addParticipant: (participant) => {
    set({
      participants: [...get().participants, {
        ...participant,
        state: PARTICIPANT_STATES.INVITED,
        joinTime: null,
        leaveTime: null
      }]
    });
  },
  
  removeParticipant: (participantId) => {
    set({
      participants: get().participants.filter(p => p.id !== participantId)
    });
  },
  
  updateParticipantState: (participantId, state) => {
    set({
      participants: get().participants.map(p => 
        p.id === participantId 
          ? { ...p, state, joinTime: state === PARTICIPANT_STATES.CONNECTED ? new Date() : p.joinTime }
          : p
      )
    });
  },
  
  // Actions pour les médias
  toggleMute: () => {
    set({
      mediaState: {
        ...get().mediaState,
        isMuted: !get().mediaState.isMuted
      }
    });
  },
  
  toggleVideo: () => {
    set({
      mediaState: {
        ...get().mediaState,
        isVideoEnabled: !get().mediaState.isVideoEnabled
      }
    });
  },
  
  toggleSpeaker: () => {
    set({
      mediaState: {
        ...get().mediaState,
        isSpeakerOn: !get().mediaState.isSpeakerOn
      }
    });
  },
  
  toggleRecording: () => {
    set({
      mediaState: {
        ...get().mediaState,
        isRecording: !get().mediaState.isRecording
      }
    });
  },
  
  toggleScreenShare: () => {
    set({
      mediaState: {
        ...get().mediaState,
        isScreenSharing: !get().mediaState.isScreenSharing
      }
    });
  },
  
  // Actions pour les paramètres
  updateSettings: (newSettings) => {
    set({
      settings: { ...get().settings, ...newSettings }
    });
  },
  
  // Actions pour les statistiques
  updateCallStats: (stats) => {
    set({
      callStats: { ...get().callStats, ...stats }
    });
  },
  
  // Actions pour l'historique
  clearCallHistory: () => {
    set({ callHistory: [] });
  },
  
  deleteCallFromHistory: (callId) => {
    set({
      callHistory: get().callHistory.filter(call => call.id !== callId)
    });
  },
  
  // Getters
  getCurrentCall: () => get().currentCall,
  getParticipants: () => get().participants,
  getCallHistory: () => get().callHistory,
  getMediaState: () => get().mediaState,
  getSettings: () => get().settings,
  getCallStats: () => get().callStats,
  
  // Utilitaires
  isInCall: () => !!get().currentCall,
  isCallActive: () => {
    const { currentCall } = get();
    return currentCall && currentCall.state === CALL_STATES.CONNECTED;
  },
  getConnectedParticipants: () => {
    return get().participants.filter(p => p.state === PARTICIPANT_STATES.CONNECTED);
  }
}));
