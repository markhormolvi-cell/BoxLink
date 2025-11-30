import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Users, Bot, Globe, Smartphone, Play, ChevronRight, LogIn } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { createRoom, joinRoom, getRoom } from "@/lib/room-manager";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Home() {
  const [location, setLocation] = useLocation();
  const [mode, setMode] = useState("pvc");
  const [gridSize, setGridSize] = useState("5");
  const [username, setUsername] = useState("Player 1");
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  // Check for joinRoom parameter in URL
  useEffect(() => {
    const handleUrlJoin = async () => {
      const params = new URLSearchParams(window.location.search);
      const joinRoomCode = params.get("joinRoom");
      
      if (joinRoomCode && username) {
        const room = await joinRoom(joinRoomCode, username, "👤");
        if (room) {
          setLocation(`/waiting?code=${room.code}`);
        }
      }
    };
    handleUrlJoin();
  }, []);

  const startGame = async () => {
    if (mode.startsWith("online")) {
      // For online modes, create a room and go to waiting
      const playerCount = (mode === "online-2" ? 2 : 4) as 2 | 4;
      const gridNum = parseInt(gridSize) as 3 | 5 | 7 | 10;
      try {
        const room = await createRoom(playerCount, gridNum, username, "👤");
        setLocation(`/waiting?code=${room.code}`);
      } catch (error) {
        toast({
          title: "Failed to create room",
          description: "Could not create game room",
          variant: "destructive",
        });
      }
    } else {
      // For single player and local multiplayer, start game directly
      setLocation(`/game?mode=${mode}&size=${gridSize}&user=${encodeURIComponent(username)}`);
    }
  };

  const handleJoinGame = async () => {
    const code = inviteCode.trim().toUpperCase();
    
    if (!code) {
      toast({
        title: "Invalid code",
        description: "Please enter an invite code",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if room exists
      const room = await getRoom(code);
      if (!room) {
        toast({
          title: "Room not found",
          description: "The invite code is invalid or the room has expired",
          variant: "destructive",
        });
        return;
      }

      if (room.started) {
        toast({
          title: "Game already started",
          description: "This game has already begun",
          variant: "destructive",
        });
        return;
      }

      // Try to join
      const joinedRoom = await joinRoom(code, username, "👤");
      if (!joinedRoom) {
        toast({
          title: "Cannot join",
          description: "The room is full or no longer available",
          variant: "destructive",
        });
        return;
      }

      setJoinDialogOpen(false);
      setInviteCode("");
      
      toast({
        title: "Joined successfully!",
        description: `Entered room ${code}`,
      });

      setLocation(`/waiting?code=${code}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join room",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl w-full items-center">
          
          {/* Hero Section */}
          <div className="space-y-6 text-center lg:text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-display font-black tracking-tight text-primary"
            >
              Connect.<br/>
              Close.<br/>
              <span className="text-foreground">Conquer.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-md mx-auto lg:mx-0"
            >
              The classic Dots & Boxes game reimagined for the modern web. Play solo, with friends, or compete online.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
            >
               <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full shadow-sm text-sm font-medium border">
                 <Users className="size-4 text-primary"/> 1-4 Players
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full shadow-sm text-sm font-medium border">
                 <Globe className="size-4 text-blue-500"/> Online Multiplayer
               </div>
            </motion.div>
          </div>

          {/* Game Setup Card */}
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.3 }}
          >
            <Card className="border-2 shadow-xl bg-white/80 dark:bg-card/80 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500"/>
              
              <CardHeader>
                <CardTitle className="text-2xl">New Match</CardTitle>
                <CardDescription>Configure your game settings</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                
                <div className="space-y-3">
                  <Label>Game Mode</Label>
                  <RadioGroup defaultValue="pvc" value={mode} onValueChange={setMode} className="grid grid-cols-2 gap-4">
                    <Label htmlFor="mode-pvc" className="cursor-pointer">
                      <RadioGroupItem value="pvc" id="mode-pvc" className="peer sr-only" />
                      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary transition-all">
                        <Bot className="size-6" />
                        <span className="font-semibold text-sm">Vs AI</span>
                      </div>
                    </Label>
                    
                    <Label htmlFor="mode-pvp" className="cursor-pointer">
                      <RadioGroupItem value="pvp" id="mode-pvp" className="peer sr-only" />
                      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary transition-all">
                        <Smartphone className="size-6" />
                        <span className="font-semibold text-sm">Pass & Play</span>
                      </div>
                    </Label>

                    <Label htmlFor="mode-online-2" className="cursor-pointer">
                      <RadioGroupItem value="online-2" id="mode-online-2" className="peer sr-only" />
                      <div 
                        className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary transition-all cursor-pointer"
                        onClick={() => setMode('online-2')}
                      >
                         <Globe className="size-6" />
                         <span className="font-semibold text-sm">Online (2P)</span>
                      </div>
                    </Label>
                    
                    <Label htmlFor="mode-online-4" className="cursor-pointer">
                      <RadioGroupItem value="online-4" id="mode-online-4" className="peer sr-only" />
                      <div 
                        className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary transition-all cursor-pointer"
                        onClick={() => setMode('online-4')}
                      >
                         <Users className="size-6" />
                         <span className="font-semibold text-sm">Online (4P)</span>
                      </div>
                    </Label>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label>Grid Size</Label>
                  <div className="flex gap-2">
                    {["3", "5", "7", "10"].map((size) => (
                      <Button 
                        key={size}
                        variant={gridSize === size ? "default" : "outline"}
                        onClick={() => setGridSize(size)}
                        className="flex-1 font-bold"
                      >
                        {size}×{size}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                   <Label>Username</Label>
                   <Input 
                     value={username} 
                     onChange={(e) => setUsername(e.target.value)} 
                     placeholder="Enter your name"
                     maxLength={12}
                   />
                </div>

                <div className="flex gap-2">
                  <Button onClick={startGame} size="lg" className="flex-1 text-lg h-12 gap-2 shadow-lg shadow-primary/20">
                    Start Match <ChevronRight className="size-5" />
                  </Button>
                  
                  <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="lg" className="text-lg h-12 gap-2">
                        <LogIn className="size-5" /> Join
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Join Game</DialogTitle>
                        <DialogDescription>
                          Enter the invite code from your friend to join their game
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="invite-code">Invite Code</Label>
                          <Input
                            id="invite-code"
                            placeholder="e.g., A7K2M9"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === "Enter" && handleJoinGame()}
                            maxLength={6}
                            className="font-mono text-lg tracking-widest text-center mt-2"
                          />
                        </div>
                        <Button 
                          onClick={handleJoinGame} 
                          size="lg" 
                          className="w-full gap-2"
                        >
                          <LogIn className="size-4" /> Join Game
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
