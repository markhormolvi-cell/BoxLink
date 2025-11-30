import { type User, type InsertUser, type Room, type RoomPlayer } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createRoom(maxPlayers: 2 | 4, gridSize: 3 | 5 | 7 | 10, playerName: string, playerAvatar: string): Promise<Room>;
  joinRoom(code: string, playerName: string, playerAvatar: string): Promise<Room | null>;
  getRoom(code: string): Promise<Room | null>;
  startGame(code: string): Promise<Room | null>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private rooms: Map<string, Room>;

  constructor() {
    this.users = new Map();
    this.rooms = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createRoom(maxPlayers: 2 | 4, gridSize: 3 | 5 | 7 | 10, playerName: string, playerAvatar: string): Promise<Room> {
    const code = this.generateCode();
    const player: RoomPlayer = {
      id: `player_${Date.now()}`,
      name: playerName,
      avatar: playerAvatar,
      joinedAt: Date.now(),
    };

    const room: Room = {
      id: randomUUID(),
      code,
      maxPlayers,
      gridSize,
      players: [player],
      started: false,
      startedAt: null,
      createdAt: Date.now() as any,
    };

    this.rooms.set(code, room);
    return room;
  }

  async joinRoom(code: string, playerName: string, playerAvatar: string): Promise<Room | null> {
    const normalizedCode = code.toUpperCase().trim();
    const room = this.rooms.get(normalizedCode);

    if (!room) return null;
    if (room.started) return null;
    
    const players = Array.isArray(room.players) ? room.players : [];
    if (players.length >= room.maxPlayers) return null;

    if (!players.some((p: RoomPlayer) => p.name === playerName)) {
      players.push({
        id: `player_${Date.now()}`,
        name: playerName,
        avatar: playerAvatar,
        joinedAt: Date.now(),
      });
    }

    (room as any).players = players;
    this.rooms.set(normalizedCode, room);
    return room;
  }

  async getRoom(code: string): Promise<Room | null> {
    const normalizedCode = code.toUpperCase().trim();
    return this.rooms.get(normalizedCode) || null;
  }

  async startGame(code: string): Promise<Room | null> {
    const normalizedCode = code.toUpperCase().trim();
    const room = this.rooms.get(normalizedCode);

    if (!room) return null;

    room.started = true;
    (room as any).startedAt = Date.now();
    this.rooms.set(normalizedCode, room);
    return room;
  }

  private generateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

export const storage = new MemStorage();
