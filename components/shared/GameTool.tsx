"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, RefreshCw, Maximize, Minimize } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameToolResult {
  type: string;
  status: string;
  topic: string;
  title: string;
  code: string;
  info: string;
}

const p5jsCdnUrl =
  "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.3/p5.min.js";

const GameTool = ({ game }: { game: GameToolResult }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastErrorRef = useRef<string>("");

  // Run the p5.js code in the iframe
  const runCode = useCallback(
    (currentCode: string) => {
      if (!iframeRef.current) return;
      lastErrorRef.current = "";
      setError(null);
      setIsLoading(true);

      const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${game.title} - p5.js Sketch</title>
          <style>
              body { 
                margin: 0; 
                overflow: hidden; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100vh; 
                width: 100vw;
                background-color: #121212; 
              }
              canvas { 
                display: block;
                max-width: 100vw;
                max-height: 100vh;
                object-fit: contain;
              }
              .console { 
                position: absolute; 
                bottom: 0; 
                left: 0; 
                width: 100%; 
                background: rgba(0, 0, 0, 0.7); 
                padding: 1em; 
                margin: 0; 
                color: red; 
                font-family: monospace; 
                white-space: pre-wrap; 
              }
          </style>
          <script src="${p5jsCdnUrl}"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.3/addons/p5.sound.min.js"></script>
          <script>
            let isInFullscreen = false;
            
            // Signal when the sketch is ready
            window.addEventListener('load', function() {
              parent.postMessage(JSON.stringify({ type: 'sketchLoaded' }), "*");
            });
            
            // Listen for messages from parent
            window.addEventListener('message', (event) => {
                if (event.data === 'stop' && typeof noLoop === 'function') { 
                  noLoop(); 
                  console.log('Sketch stopped (noLoop)'); 
                }
                else if (event.data === 'resume' && typeof loop === 'function') { 
                  loop(); 
                  console.log('Sketch resumed (loop)'); 
                }
                else if (event.data === 'fullscreen') {
                  isInFullscreen = true;
                  console.log('Fullscreen mode activated');
                  // Remove interaction blocker
                  const overlay = document.querySelector('.non-fullscreen-overlay');
                  if (overlay) overlay.remove();
                  
                  if (typeof windowResized === 'function') {
                    windowResized();
                  } else {
                    // If windowResized is not defined, try to resize the canvas
                    try {
                      if (typeof resizeCanvas === 'function') {
                        resizeCanvas(window.innerWidth, window.innerHeight);
                      }
                    } catch(e) {
                      console.error('Error resizing canvas:', e);
                    }
                  }
                }
                else if (event.data === 'exitFullscreen') {
                  isInFullscreen = false;
                  console.log('Exited fullscreen mode');
                  // Add interaction blocker back
                  addNonFullscreenOverlay();
                  
                  if (typeof windowResized === 'function') {
                    windowResized();
                  }
                }
            }, false);
            
            // Add overlay to block interactions when not in fullscreen
            function addNonFullscreenOverlay() {
              if (!document.querySelector('.non-fullscreen-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'non-fullscreen-overlay';
                document.body.appendChild(overlay);
              }
            }
            
            // Add windowResized function if it doesn't exist in the sketch
            if (typeof window.windowResized !== 'function') {
              window.windowResized = function() {
                if (typeof resizeCanvas === 'function' && typeof width !== 'undefined' && typeof height !== 'undefined') {
                  if (isInFullscreen) {
                    resizeCanvas(windowWidth, windowHeight);
                  } else {
                    // Maintain aspect ratio for non-fullscreen
                    const aspectRatio = width / height;
                    let newWidth = windowWidth;
                    let newHeight = windowHeight;
                    
                    if (windowWidth / windowHeight > aspectRatio) {
                      newWidth = windowHeight * aspectRatio;
                    } else {
                      newHeight = windowWidth / aspectRatio;
                    }
                    
                    resizeCanvas(newWidth, newHeight);
                  }
                  console.log('Canvas resized to window dimensions');
                }
              };
            }
            
            // Initially add overlay to block interactions
            window.addEventListener('DOMContentLoaded', function() {
              addNonFullscreenOverlay();
            });
            
            // Handle errors
            window.onerror = function(message, source, lineno, colno, error) {
              const errorMessage = error ? error.toString() : message;
              parent.postMessage(JSON.stringify({ type: 'runtimeError', message: errorMessage }), "*");
              try {
                document.body.innerHTML = '<pre class="console">Runtime Error: ' + errorMessage.replace(/</g, "&lt;").replace(/>/g, "&gt;") + '\\nCheck the browser console for details.</pre>';
              } catch(e) { /*ignore*/ }
              return true;
            };
          </script>
      </head>
      <body>
          <script>
              try {
                  ${currentCode}
              } catch (error) {
                  console.error("Error in sketch:", error);
                  parent.postMessage(JSON.stringify({ type: 'runtimeError', message: error.toString() }));
                  try {
                     document.body.innerHTML = '<pre class="console">Initialization Error: ' + error.message.replace(/</g, "&lt;").replace(/>/g, "&gt;") + '\\nCheck the browser console for details.</pre>';
                  } catch(e) { /*ignore*/ }
              }
          </script>
      </body>
      </html>
    `;
      iframeRef.current.srcdoc = htmlContent;
      setIsPlaying(true);
    },
    [game.title]
  );

  // Initialize the game
  useEffect(() => {
    runCode(game.code);
  }, [game.code, runCode]);

  // Handle iframe messages (errors and loading)
  const handleIframeMessage = useCallback((event: MessageEvent) => {
    if (event.source !== iframeRef.current?.contentWindow) return;
    if (event.data && typeof event.data === "string") {
      try {
        const messageData = JSON.parse(event.data);
        if (messageData.type === "sketchLoaded") {
          setIsLoading(false);
        } else if (messageData.type === "runtimeError" && messageData.message) {
          if (lastErrorRef.current === messageData.message) return;
          lastErrorRef.current = messageData.message;
          setError(`Runtime Error: ${messageData.message}`);
          setIsLoading(false);
        }
      } catch (e) {
        // Non-JSON message from iframe or parse error
        console.error("Error parsing message:", e);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("message", handleIframeMessage);
    return () => window.removeEventListener("message", handleIframeMessage);
  }, [handleIframeMessage]);

  // Set a timeout to hide the loading state even if no message is received
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000); // 5 seconds timeout

    return () => clearTimeout(timer);
  }, []);

  // Handle fullscreen change
  const handleFullscreenChange = () => {
    const isNowFullscreen = !!document.fullscreenElement;
    setIsFullscreen(isNowFullscreen);

    // Notify the iframe about fullscreen change
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        isNowFullscreen ? "fullscreen" : "exitFullscreen",
        "*"
      );
    }
  };

  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Control functions
  const handlePlay = () => {
    if (isPlaying) return;
    iframeRef.current?.contentWindow?.postMessage("resume", "*");
    setIsPlaying(true);
  };

  const handleStop = () => {
    if (!isPlaying) return;
    iframeRef.current?.contentWindow?.postMessage("stop", "*");
    setIsPlaying(false);
  };

  const handleReloadCode = () => {
    runCode(game.code);
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      handleReloadCode();
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch((err) => {
          console.error(
            `Error attempting to enable fullscreen: ${err.message}`
          );
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden bg-zinc-900 shadow-lg">
      <div className="p-3 bg-zinc-800 border-b border-zinc-700">
        <h3 className="font-medium text-white">{game.title}</h3>
      </div>

      <div
        ref={containerRef}
        className={cn(
          "relative group",
          isFullscreen ? "bg-black fixed inset-0 z-50" : ""
        )}
      >
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center z-30">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-zinc-300">Loading sketch...</p>
            </div>
          </div>
        )}

        {/* Non-fullscreen interaction blocker */}
        {!isFullscreen && !isLoading && (
          <div className="absolute inset-0 bg-black flex items-center justify-center z-20">
            <div className="text-center p-6 bg-zinc-800/90 rounded-lg backdrop-blur-sm">
              <Maximize size={48} className="text-white mx-auto mb-4" />
              <h4 className="text-white font-medium mb-2">Interactive Mode</h4>
              <p className="text-zinc-300 text-sm mb-4">
                Click fullscreen to play and interact with this sketch
              </p>
              <button
                onClick={toggleFullscreen}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
              >
                Enter Fullscreen
              </button>
            </div>
          </div>
        )}

        {/* Game iframe */}
        <iframe
          ref={iframeRef}
          className={cn(
            "w-full border-0",
            isFullscreen ? "h-screen" : "h-[400px]"
          )}
          title={`p5.js - ${game.title}`}
          sandbox="allow-scripts allow-same-origin"
        ></iframe>

        {/* Controls Overlay */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 transition-opacity duration-300",
            "opacity-100 z-10"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Play/Pause button */}
              <button
                onClick={isPlaying ? handleStop : handlePlay}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
                disabled={isLoading}
              >
                {isPlaying ? (
                  <Pause size={18} className="text-white" />
                ) : (
                  <Play size={18} className="text-white" />
                )}
              </button>

              {/* Reload button */}
              <button
                onClick={handleReloadCode}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Reload sketch"
                disabled={isLoading}
              >
                <RefreshCw size={18} className="text-white" />
              </button>
            </div>

            {/* Fullscreen button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              disabled={isLoading}
            >
              {isFullscreen ? (
                <Minimize size={18} className="text-white" />
              ) : (
                <Maximize size={18} className="text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20 p-4">
            <div className="bg-red-900/50 p-4 rounded-md max-w-full max-h-full overflow-auto">
              <h4 className="text-red-300 font-medium mb-2">
                Error in sketch:
              </h4>
              <pre className="text-red-100 text-sm whitespace-pre-wrap">
                {error}
              </pre>
              <button
                onClick={handleReloadCode}
                className="mt-4 px-3 py-1 bg-red-700 hover:bg-red-600 text-white rounded-md text-sm"
              >
                Reload Sketch
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info section - Hide in fullscreen mode */}
      {!isFullscreen && (
        <div className="p-4 bg-zinc-800 text-white border-t border-zinc-700">
          <h4 className="font-medium mb-2">About this interactive sketch</h4>
          <div className="text-sm text-zinc-300">
            <p>
              {game.info ||
                `This is an interactive demonstration of ${game.topic}.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameTool;
