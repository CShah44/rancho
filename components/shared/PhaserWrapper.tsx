"use client";

import { useEffect, useRef } from "react";

interface PhaserWrapperProps {
  gameCode: string;
}

export default function PhaserWrapper({ gameCode }: PhaserWrapperProps) {
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameCode) return;

    // Clean up escaped newlines
    const cleanedGameCode = gameCode.replace(/\\n/g, "\n");

    // Create a script element to execute the game code
    const scriptElement = document.createElement("script");
    scriptElement.type = "text/javascript";

    // Add Phaser CDN script first if not already loaded
    const loadPhaser = new Promise<void>((resolve) => {
      if (window.Phaser) {
        resolve();
        return;
      }

      const phaserScript = document.createElement("script");
      phaserScript.src =
        "https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js";
      phaserScript.onload = () => resolve();
      document.head.appendChild(phaserScript);
    });

    // Create a safe environment for the game code
    const gameCodeWrapper = `
      (function() {
        // Create a reference to store the game instance
        if (window.gameInstance) {
          window.gameInstance.destroy(true);
          window.gameInstance = null;
        }
        
        // Make sure the phaser-game element is empty
        const gameContainer = document.getElementById('phaser-game');
        if (gameContainer) {
          gameContainer.innerHTML = '';
        }
        
        try {
          // Add a patch for the 'interactive' property in text objects
          // This will run before the game code and monkey patch the Text class
          if (window.Phaser && window.Phaser.GameObjects && window.Phaser.GameObjects.Text) {
            const originalTextFactory = Phaser.GameObjects.GameObjectFactory.prototype.text;
            Phaser.GameObjects.GameObjectFactory.prototype.text = function(x, y, text, style) {
              if (style && style.interactive) {
                delete style.interactive;
                const textObj = originalTextFactory.call(this, x, y, text, style);
                textObj.setInteractive();
                return textObj;
              }
              return originalTextFactory.call(this, x, y, text, style);
            };
          }
          
          ${cleanedGameCode}
          
          // Store the game instance if possible
          if (typeof game !== 'undefined') {
            window.gameInstance = game;
          }
        } catch (error) {
          console.error("Error in Phaser game:", error);
          const errorElement = document.createElement('div');
          errorElement.className = 'game-error';
          errorElement.innerHTML = '<p>Error in game code:</p><pre>' + error.message + '</pre>';
          document.getElementById('phaser-game').innerHTML = '';
          document.getElementById('phaser-game').appendChild(errorElement);
        }
      })();
    `;

    loadPhaser.then(() => {
      // Create a blob from the game code
      const blob = new Blob([gameCodeWrapper], { type: "text/javascript" });
      scriptElement.src = URL.createObjectURL(blob);

      // Ensure the phaser-game element exists
      if (!document.getElementById("phaser-game")) {
        const gameElement = document.createElement("div");
        gameElement.id = "phaser-game";
        gameElement.style.width = "100%";
        gameElement.style.height = "100%";
        gameElement.style.display = "flex";
        gameElement.style.justifyContent = "center";
        gameElement.style.alignItems = "center";

        if (gameContainerRef.current) {
          gameContainerRef.current.innerHTML = "";
          gameContainerRef.current.appendChild(gameElement);
        }
      }

      // Append the script to the body
      document.body.appendChild(scriptElement);
    });

    // Clean up function
    return () => {
      if (window.gameInstance) {
        window.gameInstance.destroy(true);
        window.gameInstance = null;
      }

      if (scriptElement.parentNode) {
        document.body.removeChild(scriptElement);
        URL.revokeObjectURL(scriptElement.src);
      }
    };
  }, [gameCode]);

  return (
    <div className="phaser-wrapper w-full h-full">
      <div ref={gameContainerRef} className="w-full h-full"></div>

      <style jsx>{`
        .phaser-wrapper {
          position: relative;
          overflow: hidden;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </div>
  );
}

// Add this to make TypeScript happy with the global gameInstance
declare global {
  interface Window {
    Phaser: any;
    gameInstance: any;
  }
}
