import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, bigint, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const rooms = pgTable("rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 6 }).notNull().unique(),
  maxPlayers: integer("max_players").notNull(),
  gridSize: integer("grid_size").notNull(),
  players: jsonb("players").notNull().default(sql`'[]'::jsonb`),
  started: boolean("started").notNull().default(false),
  startedAt: bigint("started_at", { mode: "number" }),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Room = typeof rooms.$inferSelect;

export const roomPlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string(),
  joinedAt: z.number(),
});

export type RoomPlayer = z.infer<typeof roomPlayerSchema>;
