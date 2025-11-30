import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Room management endpoints
  
  // Create a new room
  app.post("/api/rooms", async (req, res) => {
    try {
      const { maxPlayers, gridSize, playerName, playerAvatar } = req.body;
      
      if (!maxPlayers || !gridSize || !playerName) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const room = await storage.createRoom(maxPlayers, gridSize, playerName, playerAvatar || "👤");
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to create room" });
    }
  });

  // Get room by code
  app.get("/api/rooms/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const room = await storage.getRoom(code);
      
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch room" });
    }
  });

  // Join a room
  app.post("/api/rooms/:code/join", async (req, res) => {
    try {
      const { code } = req.params;
      const { playerName, playerAvatar } = req.body;

      if (!playerName) {
        return res.status(400).json({ error: "Player name required" });
      }

      const room = await storage.joinRoom(code, playerName, playerAvatar || "👤");

      if (!room) {
        return res.status(400).json({ error: "Cannot join room" });
      }

      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to join room" });
    }
  });

  // Start game
  app.post("/api/rooms/:code/start", async (req, res) => {
    try {
      const { code } = req.params;
      const room = await storage.startGame(code);

      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to start game" });
    }
  });

  return httpServer;
}
