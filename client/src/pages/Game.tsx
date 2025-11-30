import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { useGameEngine, GridSize, Player } from "@/lib/game-engine";
import { Board } from "@/components/game/Board";
import { PlayerCard } from "@/components/game/PlayerCard";
import { Chat } from "@/components/game/Chat";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Share2, UserPlus } from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "@/hooks/use-toast";
import { useFriends } from "@/lib/friends-engine";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from "@/lib/utils";

export default function Game() {
  const [location, setLocation] = useLocation();
  const { friends, inviteFriend } = useFriends();
  
  // Parse URL params
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode") || "pvc";
  const size = parseInt(params.get("size") || "5") as GridSize;
  const username = params.get("user") || "Player 1";
  const roomCode = params.get("roomCode");

  // Setup Players based on mode
  const getInitialPlayers = (): Player[] => {
    const p1 = { id: 1, name: username, avatar: "🧑‍🚀", color: "--player-1", score: 0, isAi: false };
    
    if (mode === 'pvc') {
      return [
        p1,
        { id: 2, name: "Bot", avatar: "🤖", color: "--player-2", score: 0, isAi: true, difficulty: 'medium' }
      ];
    } else if (mode === 'pvp') {
      return [
        p1,
        { id: 2, name: "Player 2", avatar: "👽", color: "--player-2", score: 0, isAi: false }
      ];
    } else if (mode === 'online-4') {
      // In a real online system, this would be fetched from the room
      // For now, AI opponents fill remaining slots
      return [
        p1,
        { id: 2, name: "Sarah", avatar: "👩‍🎤", color: "--player-2", score: 0, isAi: true },
        { id: 3, name: "Mike", avatar: "🧛", color: "--player-3", score: 0, isAi: true },
        { id: 4, name: "Alex", avatar: "🧙", color: "--player-4", score: 0, isAi: true },
      ];
    }
    // Default online-2
    return [
       p1,
       { id: 2, name: "Opponent", avatar: "👤", color: "--player-2", score: 0, isAi: true }
    ];
  };

  const [players] = useState<Player[]>(getInitialPlayers);
  const { gameState, makeMove, resetGame } = useGameEngine(size, players);

  // Win Effect
  useEffect(() => {
    if (gameState.isGameOver) {
      const winner = gameState.players.find(p => p.id === gameState.winner);
      if (winner) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: [getComputedStyle(document.documentElement).getPropertyValue(winner.color).trim() || '#FFD700']
        });
        toast({
          title: "Game Over!",
          description: `${winner.name} wins with ${winner.score} boxes!`,
          duration: 5000,
        });
      }
    }
  }, [gameState.isGameOver, gameState.winner, gameState.players]);

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto p-4 flex flex-col gap-6 flex-1">
        
        {/* Header / Controls */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setLocation("/")} className="gap-2">
            <ArrowLeft className="size-4" /> Exit
          </Button>
          
          <div className="flex items-center gap-2">
             <div className="bg-primary/10 px-4 py-1 rounded-full text-sm font-bold text-primary uppercase tracking-wider">
                {mode.replace('-', ' ')} • {size}x{size}
             </div>
          </div>

          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 hidden sm:flex">
                  <UserPlus className="size-4" /> Invite Friend
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite a Friend</DialogTitle>
                  <DialogDescription>
                    Select an online friend to join this match.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                  {friends.filter(f => f.status === 'online').map(friend => (
                    <div key={friend.id} className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`} />
                          <AvatarFallback>{friend.avatar}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{friend.username}</span>
                      </div>
                      <Button size="sm" onClick={() => inviteFriend(friend.id)}>Invite</Button>
                    </div>
                  ))}
                  {friends.filter(f => f.status === 'online').length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No friends online right now.</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="icon" onClick={() => resetGame(size, players)} title="Restart">
              <RotateCcw className="size-4" />
            </Button>
            <Button variant="outline" size="icon" title="Share Room Code">
              <Share2 className="size-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_350px] gap-6 flex-1">
          {/* Main Game Area */}
          <div className="flex flex-col gap-6">
            
            {/* Scoreboard */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {gameState.players.map((p, idx) => (
                <PlayerCard 
                  key={p.id} 
                  player={p} 
                  isActive={idx === gameState.activePlayerIndex && !gameState.isGameOver}
                  isWinner={gameState.winner === p.id}
                />
              ))}
            </div>

            {/* Board */}
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
               <Board gameState={gameState} onLineClick={makeMove} />
            </div>

            {gameState.isGameOver && (
              <div className="text-center animate-in fade-in slide-in-from-bottom-4">
                 <h2 className="text-3xl font-display font-bold mb-4">Match Finished</h2>
                 <Button size="lg" onClick={() => resetGame(size, players)}>Play Again</Button>
              </div>
            )}
          </div>

          {/* Sidebar: Chat & Logs */}
          <div className="flex flex-col gap-4 h-full">
             <Chat />
             
             {/* Match History Preview */}
             <div className="hidden md:block bg-card border border-border/50 rounded-xl p-4 flex-1 max-h-[200px] overflow-auto">
                <h3 className="text-xs font-bold uppercase text-muted-foreground mb-2">Game Log</h3>
                <div className="space-y-1">
                  {gameState.history.map((entry, i) => (
                    <div key={i} className="text-xs text-muted-foreground border-b border-border/30 py-1 last:border-0">
                       {entry}
                    </div>
                  ))}
                  {gameState.history.length === 0 && (
                    <div className="text-xs text-muted-foreground italic">Match started...</div>
                  )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
