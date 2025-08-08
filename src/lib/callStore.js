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


const mockCallHistory = [
  {
    id: '1',
    type: 'VOICE',
    state: 'ENDED',
    isOutgoing: true,
    startTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    duration: 180, // 3 minutes
    participants: [
      { id: 'user1', name: 'Jean Dupont', isMe: false },
      { id: 'me', name: 'Moi', isMe: true }
    ]
  },
  {
    id: '2',
    type: CALL_TYPES.VIDEO,
    state: CALL_STATES.ENDED,
    isOutgoing: false,
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    duration: 0,
    participants: [
      { id: 'me', name: 'Moi', isMe: true }
      ,{ id: 'user2', name: 'Marie Martin', isMe: false }
    ]
  },
  {
    id: '3',
    type: 'GROUP_VIDEO',
    state: 'ENDED',
    isOutgoing: true,
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    duration: 1500, // 25 minutes
    isGroup: true,
    participants: [
      { id: 'user1', name: 'Jean Dupont', isMe: false },
      { id: 'user2', name: 'Marie Martin', isMe: false },
      { id: 'user3', name: 'Pierre Durand', isMe: false },
      { id: 'me', name: 'Moi', isMe: true }
    ]
  },
  {
    id: '4',
    type: 'voice',
    state: 'REJECTED',
    isOutgoing: false,
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    duration: 0,
    participants: [
      { id: 'user4', name: 'Sophie Lambert', isMe: false },
      { id: 'me', name: 'Moi', isMe: true }
    ]
  },
  {
    id: '5',
    type: 'voice',
    state: 'ENDED',
    isOutgoing: true,
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    duration: 45, // 45 seconds
    participants: [
      { id: 'user5', name: 'Thomas Leroy', isMe: false },
      { id: 'me', name: 'Moi', isMe: true }
    ]
  },
  {
    id: '6',
    type: 'GROUP_VOICE',
    state: 'ENDED',
    isOutgoing: true,
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4 days ago
    duration: 720, // 12 minutes
    participants: [
      { id: 'user1', name: 'Jean Dupont', isMe: false },
      { id: 'user6', name: 'Camille Petit', isMe: false },
      { id: 'me', name: 'Moi', isMe: true }
    ]
  },
  {
    id: '7',
    type: CALL_TYPES['video'],
    state: 'MISSED',
    isOutgoing: false,
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(), // 5 days ago
    duration: 0,
    participants: [
      { id: 'user7', name: 'Lucie Moreau', isMe: false },
      { id: 'me', name: 'Moi', isMe: true }
    ]
  },
  {
    id: '8',
    type: 'VOICE',
    state: 'ENDED',
    isOutgoing: true,
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 144).toISOString(), // 6 days ago
    duration: 300, // 5 minutes
    participants: [
      { id: 'user8', name: 'Nicolas Bernard', isMe: false },
      { id: 'me', name: 'Moi', isMe: true }
    ]
  },
  {
    id: '9',
    type: CALL_TYPES['video'],
    state: 'ENDED',
    isOutgoing: false,
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(), // 7 days ago
    duration: 900, // 15 minutes
    participants: [
      { id: 'user9', name: 'Élodie Roux', isMe: false },
      { id: 'me', name: 'Moi', isMe: true }
    ]
  },
  {
    id: '10',
    type: 'GROUP_VIDEO',
    state: 'ENDED',
    isOutgoing: true,
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 192).toISOString(), // 8 days ago
    duration: 1800, // 30 minutes
    participants: [
      { id: 'user2', name: 'Marie Martin', isMe: false },
      { id: 'user5', name: 'Thomas Leroy', isMe: false },
      { id: 'user10', name: 'Antoine Michel', isMe: false },
      { id: 'me', name: 'Moi', isMe: true }
    ]
  }
];

// État initial
const initialState = {
  // Appel actuel
  currentCall: null,
  
  // Historique des appels
  callHistory: mockCallHistory,
  
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
