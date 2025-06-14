"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  RefreshCw,
  Maximize,
  Minimize,
  Gamepad2,
} from "lucide-react";
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
                background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              }
              canvas { 
                display: block;
                max-width: 100vw;
                max-height: 100vh;
                object-fit: contain;
                border-radius: 8px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
              }
              .console { 
                position: absolute; 
                bottom: 0; 
                left: 0; 
                width: 100%; 
                background: rgba(239, 68, 68, 0.9);
                backdrop-filter: blur(8px);
                padding: 1rem; 
                margin: 0; 
                color: white; 
                font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace; 
                white-space: pre-wrap; 
                font-size: 14px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
              }
          </style>
          <script src="${p5jsCdnUrl}"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.3/addons/p5.sound.min.js"></script>
          <script>
            let isInFullscreen = false;
            
            window.addEventListener('load', function() {
              parent.postMessage(JSON.stringify({ type: 'sketchLoaded' }), "*");
            });
            
            window.addEventListener('message', (event) => {
                if (event.data === 'stop' && typeof noLoop === 'function') { 
                  noLoop(); 
                }
                else if (event.data === 'resume' && typeof loop === 'function') { 
                  loop(); 
                }
                else if (event.data === 'fullscreen') {
                  isInFullscreen = true;
                  const overlay = document.querySelector('.non-fullscreen-overlay');
                  if (overlay) overlay.remove();
                  
                  if (typeof windowResized === 'function') {
                    windowResized();
                  } else {
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
                  addNonFullscreenOverlay();
                  
                  if (typeof windowResized === 'function') {
                    windowResized();
                  }
                }
            }, false);
            
            function addNonFullscreenOverlay() {
              if (!document.querySelector('.non-fullscreen-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'non-fullscreen-overlay';
                document.body.appendChild(overlay);
              }
            }
            
            if (typeof window.windowResized !== 'function') {
              window.windowResized = function() {
                if (typeof resizeCanvas === 'function' && typeof width !== 'undefined' && typeof height !== 'undefined') {
                  if (isInFullscreen) {
                    resizeCanvas(windowWidth, windowHeight);
                  } else {
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
                }
              };
            }
            
            window.addEventListener('DOMContentLoaded', function() {
              addNonFullscreenOverlay();
            });
            
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

  // Handle iframe messages
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
        console.error("Error parsing message:", e);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("message", handleIframeMessage);
    return () => window.removeEventListener("message", handleIframeMessage);
  }, [handleIframeMessage]);

  // Set a timeout to hide the loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Handle fullscreen change
  const handleFullscreenChange = () => {
    const isNowFullscreen = !!document.fullscreenElement;
    setIsFullscreen(isNowFullscreen);

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
    <div className="my-3 sm:my-4 md:my-6 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 shadow-2xl border border-zinc-700/50">
      {/* Enhanced Header */}
      <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-r from-zinc-800/80 to-zinc-700/80 backdrop-blur-sm border-b border-zinc-700/50">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center">
            <Gamepad2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white text-sm sm:text-base md:text-lg truncate">
              {game.title}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              Interactive Learning Game
            </p>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className={cn(
          "relative group",
          isFullscreen ? "bg-black fixed inset-0 z-50" : ""
        )}
      >
        {/* Enhanced Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center z-30">
            <div className="flex flex-col items-center space-y-3 sm:space-y-4">
              <div className="relative">
                <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 border-4 border-pink-500/20 border-b-pink-500 rounded-full animate-spin animate-reverse"></div>
              </div>
              <div className="text-center">
                <p className="text-white font-medium text-xs sm:text-sm md:text-base">
                  Loading Game...
                </p>
                <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                  Preparing your interactive experience
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Non-fullscreen interaction blocker */}
        {!isFullscreen && !isLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="text-center p-4 sm:p-6 md:p-8 bg-zinc-800/90 rounded-xl sm:rounded-2xl backdrop-blur-md border border-zinc-700/50 shadow-2xl max-w-xs sm:max-w-sm mx-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Maximize className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2 text-base sm:text-lg md:text-xl">
                Ready to Play?
              </h4>
              <p className="text-zinc-300 text-xs sm:text-sm md:text-base mb-4 sm:mb-6 leading-relaxed">
                Enter fullscreen mode to start playing and interacting with this
                educational game
              </p>
              <button
                onClick={toggleFullscreen}
                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg sm:rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 text-sm sm:text-base"
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {/* Game iframe */}
        <iframe
          ref={iframeRef}
          className={cn(
            "w-full border-0",
            isFullscreen
              ? "h-screen"
              : "h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px]"
          )}
          title={`Interactive Game - ${game.title}`}
          sandbox="allow-scripts allow-same-origin"
        ></iframe>
        {/* Enhanced Controls Overlay */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 sm:p-3 md:p-4 transition-opacity duration-300",
            "opacity-100 z-10"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
              {/* Play/Pause button */}
              <button
                onClick={isPlaying ? handleStop : handlePlay}
                className="p-1.5 sm:p-2 md:p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-white/20"
                aria-label={isPlaying ? "Pause" : "Play"}
                disabled={isLoading}
              >
                {isPlaying ? (
                  <Pause className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                ) : (
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                )}
              </button>

              {/* Reload button */}
              <button
                onClick={handleReloadCode}
                className="p-1.5 sm:p-2 md:p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-white/20"
                aria-label="Reload game"
                disabled={isLoading}
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </button>
            </div>

            {/* Fullscreen button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 sm:p-2 md:p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-white/20"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              disabled={isLoading}
            >
              {isFullscreen ? (
                <Minimize className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              ) : (
                <Maximize className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Enhanced Error display */}
        {error && (
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/80 via-red-800/60 to-red-900/80 backdrop-blur-sm flex items-center justify-center z-20 p-3 sm:p-4">
            <div className="bg-red-900/50 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl max-w-sm sm:max-w-md mx-4 border border-red-500/30 backdrop-blur-md">
              <h4 className="text-red-300 font-semibold mb-2 sm:mb-3 text-base sm:text-lg">
                Game Error
              </h4>
              <pre className="text-red-100 text-xs sm:text-sm whitespace-pre-wrap mb-3 sm:mb-4 bg-red-950/50 p-2 sm:p-3 rounded-lg border border-red-500/20 max-h-32 sm:max-h-40 overflow-y-auto">
                {error}
              </pre>
              <button
                onClick={handleReloadCode}
                className="w-full px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 text-sm sm:text-base"
              >
                Restart Game
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Info section */}
      {!isFullscreen && (
        <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-r from-zinc-800/50 to-zinc-700/50 backdrop-blur-sm border-t border-zinc-700/50">
          <h4 className="font-semibold mb-2 sm:mb-3 text-white text-sm sm:text-base">
            About this Game
          </h4>
          <div className="text-xs sm:text-sm md:text-base text-zinc-300 leading-relaxed">
            <p>
              {game.info ||
                `This is an interactive educational game about ${game.topic}. Click "Start Game" above to play in fullscreen mode.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameTool;
