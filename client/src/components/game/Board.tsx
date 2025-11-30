import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GameState, GridSize } from "@/lib/game-engine";

interface BoardProps {
  gameState: GameState;
  onLineClick: (id: string) => void;
}

export function Board({ gameState, onLineClick }: BoardProps) {
  const { size, lines, boxes, players, activePlayerIndex } = gameState;
  
  // Calculate CSS grid style
  // We need (size) boxes, so (size + 1) dots
  // Grid template: dot line dot line dot ...
  // Let's use a simpler approach: SVG or relative positioning?
  // CSS Grid is great for the boxes, but lines are between.
  
  // Let's use a distinct approach: 
  // Render a container with relative sizing.
  
  // Gap between dots
  const GAP = 60;
  const DOT_SIZE = 12;
  const LINE_THICKNESS = 8;
  
  // Total width
  // const totalWidth = size * GAP; 
  // But we need to be responsive.
  
  // CSS Grid Approach:
  // Columns: dot line dot line ...
  // Rows: dot line dot line ...
  // 2 * size + 1 tracks
  
  return (
    <div className="flex items-center justify-center p-4 md:p-8 select-none overflow-auto">
      <div 
        className="grid bg-card p-6 rounded-xl shadow-soft border border-border/50"
        style={{
          gridTemplateColumns: `repeat(${size}, auto 1fr) auto`,
          gridTemplateRows: `repeat(${size}, auto 1fr) auto`,
          gap: '0px'
        }}
      >
        {/* We generate the grid cells row by row */}
        {Array.from({ length: 2 * size + 1 }).map((_, row) => (
          Array.from({ length: 2 * size + 1 }).map((_, col) => {
            const isDotRow = row % 2 === 0;
            const isDotCol = col % 2 === 0;
            
            const r = Math.floor(row / 2);
            const c = Math.floor(col / 2);

            // Case 1: Dot
            if (isDotRow && isDotCol) {
              return (
                <div key={`dot-${r}-${c}`} className="flex items-center justify-center z-20">
                  <div className="bg-foreground rounded-full transition-all duration-300" 
                       style={{ width: DOT_SIZE, height: DOT_SIZE }} />
                </div>
              );
            }

            // Case 2: Horizontal Line
            if (isDotRow && !isDotCol) {
              const id = `h-${r}-${c}`;
              const line = lines[id];
              const owner = line?.owner !== null ? players.find(p => p.id === line.owner) : null;
              const isActivePlayer = !owner && !gameState.isGameOver;
              
              return (
                <div key={id} className="flex items-center justify-center relative h-4 min-w-[40px] md:min-w-[60px] group">
                  <button
                    onClick={() => isActivePlayer && onLineClick(id)}
                    disabled={!!owner || gameState.isGameOver}
                    className={cn(
                      "w-full rounded-full transition-all duration-200",
                      owner ? "opacity-100" : "opacity-0 hover:opacity-100 cursor-pointer",
                      isActivePlayer && "hover:scale-y-150"
                    )}
                    style={{ 
                      height: LINE_THICKNESS,
                      backgroundColor: "#007BFF"
                    }}
                  />
                </div>
              );
            }

            // Case 3: Vertical Line
            if (!isDotRow && isDotCol) {
              const id = `v-${r}-${c}`;
              const line = lines[id];
              const owner = line?.owner !== null ? players.find(p => p.id === line.owner) : null;
              const isActivePlayer = !owner && !gameState.isGameOver;

              return (
                <div key={id} className="flex items-center justify-center relative w-4 min-h-[40px] md:min-h-[60px] group">
                  <button
                    onClick={() => isActivePlayer && onLineClick(id)}
                    disabled={!!owner || gameState.isGameOver}
                    className={cn(
                      "h-full rounded-full transition-all duration-200",
                      owner ? "opacity-100" : "opacity-0 hover:opacity-100 cursor-pointer",
                      isActivePlayer && "hover:scale-x-150"
                    )}
                    style={{ 
                      width: LINE_THICKNESS,
                      backgroundColor: "#007BFF"
                    }}
                  />
                </div>
              );
            }

            // Case 4: Box
            if (!isDotRow && !isDotCol) {
              const id = `b-${r}-${c}`;
              const box = boxes[id];
              const owner = box?.owner !== null ? players.find(p => p.id === box.owner) : null;

              return (
                <div key={id} className="flex items-center justify-center p-1 z-10">
                  <div 
                    className={cn(
                      "w-full h-full rounded-lg transition-all duration-500 flex items-center justify-center",
                      owner ? "scale-100 opacity-100" : "scale-90 opacity-0"
                    )}
                    style={{ 
                      backgroundColor: owner ? `hsl(${owner.color} / 0.3)` : 'transparent',
                    }}
                  >
                    {owner && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-2xl md:text-3xl"
                      >
                        {owner.avatar}
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            }
            
            return null;
          })
        ))}
      </div>
    </div>
  );
}
