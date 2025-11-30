// Room management system - API based backend
export interface RoomPlayer {
  id: string;
  name: string;
  avatar: string;
  joinedAt: number;
}

export interface Room {
  id: string;
  code: string;
  maxPlayers: 2 | 4;
  gridSize: 3 | 5 | 7 | 10;
  players: RoomPlayer[];
  createdAt: number | bigint;
  startedAt: number | bigint | null;
  started: boolean;
}

const CURRENT_ROOM_KEY = 'boxlink_current_room';
const API_BASE = '/api';

// Create a new room
export const createRoom = async (maxPlayers: 2 | 4, gridSize: 3 | 5 | 7 | 10, playerName: string, playerAvatar: string): Promise<Room> => {
  try {
    const response = await fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxPlayers, gridSize, playerName, playerAvatar: playerAvatar || "👤" }),
    });

    if (!response.ok) throw new Error('Failed to create room');
    const room = await response.json();
    localStorage.setItem(CURRENT_ROOM_KEY, JSON.stringify(room));
    return room;
  } catch (error) {
    console.error('[Room] Failed to create room:', error);
    throw error;
  }
};

// Join an existing room
export const joinRoom = async (code: string, playerName: string, playerAvatar: string): Promise<Room | null> => {
  try {
    const normalizedCode = code.toUpperCase().trim();
    const response = await fetch(`${API_BASE}/rooms/${normalizedCode}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName, playerAvatar: playerAvatar || "👤" }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[Room] Failed to join room:', error);
      return null;
    }

    const room = await response.json();
    localStorage.setItem(CURRENT_ROOM_KEY, JSON.stringify(room));
    return room;
  } catch (error) {
    console.error('[Room] Error joining room:', error);
    return null;
  }
};

// Get room by code
export const getRoom = async (code: string): Promise<Room | null> => {
  try {
    const normalizedCode = code.toUpperCase().trim();
    const response = await fetch(`${API_BASE}/rooms/${normalizedCode}`);

    if (!response.ok) {
      console.error('[Room] Room not found:', normalizedCode);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[Room] Error fetching room:', error);
    return null;
  }
};

// Get current room from localStorage
export const getCurrentRoom = (): Room | null => {
  const stored = localStorage.getItem(CURRENT_ROOM_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

// Start game
export const startGame = async (code: string): Promise<Room | null> => {
  try {
    const normalizedCode = code.toUpperCase().trim();
    const response = await fetch(`${API_BASE}/rooms/${normalizedCode}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) return null;

    const room = await response.json();
    localStorage.setItem(CURRENT_ROOM_KEY, JSON.stringify(room));
    return room;
  } catch (error) {
    console.error('[Room] Error starting game:', error);
    return null;
  }
};

// Clear current room
export const clearCurrentRoom = () => {
  localStorage.removeItem(CURRENT_ROOM_KEY);
};

// Watch room updates (polling)
export const watchRoom = (code: string, callback: (room: Room | null) => void) => {
  let isMounted = true;

  const poll = async () => {
    if (!isMounted) return;
    const room = await getRoom(code);
    if (isMounted) callback(room);
    if (isMounted) setTimeout(poll, 300);
  };

  poll();
  return () => { isMounted = false; };
};
