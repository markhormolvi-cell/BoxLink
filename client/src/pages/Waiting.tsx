import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Copy, Check, Users, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { getRoom, watchRoom, clearCurrentRoom, Room } from "@/lib/room-manager";
import { toast } from "@/hooks/use-toast";

export default function Waiting() {
  const [location, setLocation] = useLocation();
  const [room, setRoom] = useState<Room | null>(null);
  const [copied, setCopied] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const roomCode = params.get("code");

  useEffect(() => {
    if (!roomCode) {
      setLocation("/");
      return;
    }

    const initialRoom = getRoom(roomCode);
    if (!initialRoom) {
      toast({
        title: "Room not found",
        description: "The room code is invalid or expired.",
        variant: "destructive",
      });
      setLocation("/");
      return;
    }

    // Watch for room updates
    const unwatch = watchRoom(roomCode, (updatedRoom) => {
      if (updatedRoom) {
        setRoom(updatedRoom);

        // Auto-start when all players joined
        if (updatedRoom.players.length === updatedRoom.maxPlayers && !updatedRoom.started) {
          // Small delay for better UX
          setTimeout(() => {
            if (updatedRoom.players.length === updatedRoom.maxPlayers) {
              setLocation(
                `/game?mode=online-${updatedRoom.maxPlayers}&size=${updatedRoom.gridSize}&roomCode=${updatedRoom.code}&user=${encodeURIComponent(updatedRoom.players[0].name)}`
              );
            }
          }, 500);
        }
      }
    });

    return unwatch;
  }, [roomCode, setLocation]);

  const copyInviteLink = () => {
    if (!room) return;
    const inviteUrl = `${window.location.origin}?joinRoom=${room.code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Invite link copied!",
      description: "Share this link with your friends to invite them.",
    });
  };

  const handleExit = () => {
    clearCurrentRoom();
    setLocation("/");
  };

  if (!room) {
    return (
      <Layout>
        <div className="flex items-center justify-center flex-1 p-4">
          <div className="text-center space-y-4">
            <Loader className="size-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading room...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const isFull = room.players.length === room.maxPlayers;
  const inviteUrl = `${window.location.origin}?joinRoom=${room.code}`;

  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full space-y-6"
        >
          {/* Header */}
          <div>
            <Button
              variant="ghost"
              onClick={handleExit}
              className="gap-2 mb-4"
            >
              <ArrowLeft className="size-4" /> Back
            </Button>
          </div>

          {/* Main Card */}
          <Card className="border-2 shadow-xl bg-white/80 dark:bg-card/80 backdrop-blur-xl">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />

            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Waiting for Players</CardTitle>
              <CardDescription className="mt-2">
                {room.maxPlayers - room.players.length} more {room.maxPlayers - room.players.length === 1 ? "player" : "players"} needed
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Room Code */}
              <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                <p className="text-sm text-muted-foreground mb-2">Room Code</p>
                <div className="flex gap-2">
                  <code className="flex-1 text-2xl font-bold text-primary tracking-wider">
                    {room.code}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyInviteLink}
                    className="gap-2"
                  >
                    {copied ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Invite Link */}
              <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
                <p className="text-xs text-muted-foreground mb-2">Invite Link</p>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={inviteUrl}
                    readOnly
                    className="flex-1 text-xs bg-transparent border-0 focus:outline-none text-foreground/70 truncate"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyInviteLink}
                  >
                    {copied ? (
                      <Check className="size-4 text-green-500" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Players List */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Users className="size-4 text-primary" />
                  Players ({room.players.length}/{room.maxPlayers})
                </div>

                <div className="space-y-2">
                  {room.players.map((player, idx) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border border-border/30"
                    >
                      <Avatar>
                        <AvatarFallback>{player.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{player.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined {Math.round((Date.now() - player.joinedAt) / 1000)}s ago
                        </p>
                      </div>
                      <div className="size-2 rounded-full bg-green-500/60" />
                    </motion.div>
                  ))}

                  {/* Waiting Slots */}
                  {Array.from({ length: room.maxPlayers - room.players.length }).map((_, idx) => (
                    <motion.div
                      key={`waiting-${idx}`}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-dashed border-border/30"
                    >
                      <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                        <Loader className="size-4 text-muted-foreground animate-spin" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Waiting...</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="text-center py-4">
                {isFull ? (
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-lg font-bold text-green-600 dark:text-green-400"
                  >
                    ✓ All players joined! Starting...
                  </motion.div>
                ) : (
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Waiting for {room.maxPlayers - room.players.length} more...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Game Info */}
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>Game Mode: {room.maxPlayers}-Player Online</p>
            <p>Grid Size: {room.gridSize}×{room.gridSize}</p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
