"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { generateP5Code, fixP5CodeError } from "./actions";
import { motion, AnimatePresence } from "framer-motion";

// --- Constants and Enums ---
const EMPTY_CODE = `function setup() {
  // Setup code goes here.
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  // Frame drawing code goes here.
  background(175);
}`;

const STARTUP_CODE = `function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  let hue = (frameCount * 0.5) % 360;
  background(hue, 90, 90);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}`;

const EXAMPLE_PROMPTS = [
  "A simple particle system that reacts to mouse movement.",
  "A generative art piece with flowing lines and changing colors.",
  "A small game where you dodge falling obstacles.",
  "A visualizer for Perlin noise making abstract patterns.",
  "Bouncing balls with collision detection within the canvas.",
];

enum AppState {
  IDLE,
  GENERATING,
}

const p5jsCdnUrl =
  "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.3/p5.min.js";

export default function GamePage() {
  const [gamePrompt, setGamePrompt] = useState<string>("");
  const [code, setCode] = useState<string>(STARTUP_CODE);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [error, setError] = useState<{
    type: "api" | "runtime";
    text: string;
  } | null>(null);
  const [title, setTitle] = useState<string>("Interactive Sketch");
  const [info, setInfo] = useState<string>("");

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastErrorRef = useRef<string>("");

  // Initial setup
  useEffect(() => {
    setGamePrompt(
      EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)]
    );
  }, []);

  const runCode = useCallback(
    (currentCode: string) => {
      if (!iframeRef.current) return;
      lastErrorRef.current = "";
      setError(null);

      const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title} - p5.js Sketch</title>
          <style>
              body { margin: 0; overflow: hidden; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #121212; }
              main { display: flex; justify-content: center; align-items: center; }
              .console { position: absolute; bottom: 0; left: 0; width: 100%; background: rgba(0, 0, 0, 0.7); padding: 1em; margin: 0; color: red; font-family: monospace; white-space: pre-wrap; }
          </style>
          <script src="${p5jsCdnUrl}"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.3/addons/p5.sound.min.js"></script>
          <script>
            window.addEventListener('message', (event) => {
                if (event.data === 'stop' && typeof noLoop === 'function') { noLoop(); console.log('Sketch stopped (noLoop)'); }
                else if (event.data === 'resume' && typeof loop === 'function') { loop(); console.log('Sketch resumed (loop)'); }
            }, false);
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
      setIsRunning(true);
    },
    [title]
  );

  useEffect(() => {
    runCode(code);
  }, [code, runCode]);

  const handleIframeMessage = useCallback((event: MessageEvent) => {
    if (event.source !== iframeRef.current?.contentWindow) return;
    if (event.data && typeof event.data === "string") {
      try {
        const messageData = JSON.parse(event.data);
        if (messageData.type === "runtimeError" && messageData.message) {
          if (lastErrorRef.current === messageData.message) return;
          lastErrorRef.current = messageData.message;
          setError({
            type: "runtime",
            text: `Runtime Error: ${messageData.message}`,
          });
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

  const handleGenerateGame = async () => {
    if (appState !== AppState.IDLE || !gamePrompt.trim()) return;

    setAppState(AppState.GENERATING);
    setError(null);

    try {
      const result = await generateP5Code({ prompt: gamePrompt });

      if (result.success && result.code) {
        setCode(result.code);
        setTitle(result.title || "Interactive Sketch");
        setInfo(result.info || "");
      } else {
        setError({
          type: "api",
          text: "Failed to generate code. Please try a different prompt or rephrase.",
        });
      }
    } catch (e) {
      console.error("AI API Error:", e);
      setError({
        type: "api",
        text: "An error occurred with the AI service.",
      });
    } finally {
      setAppState(AppState.IDLE);
    }
  };

  const handleFixError = async () => {
    if (appState !== AppState.IDLE || !error) return;

    setAppState(AppState.GENERATING);

    try {
      const result = await fixP5CodeError({
        code: code,
        error: error.text,
      });

      if (result.success && result.code) {
        setCode(result.code);
        setError(null);
        if (result.title) setTitle(result.title);
        if (result.info) setInfo(result.info);
      } else {
        setError({
          type: "api",
          text: "Failed to fix code. Please try again or modify your prompt.",
        });
      }
    } catch (e) {
      console.error("AI API Error:", e);
      setError({
        type: "api",
        text: "An error occurred with the AI service.",
      });
    } finally {
      setAppState(AppState.IDLE);
    }
  };

  const handlePlay = () => {
    if (isRunning) return;
    iframeRef.current?.contentWindow?.postMessage("resume", "*");
    setIsRunning(true);
  };

  const handleStop = () => {
    if (!isRunning) return;
    iframeRef.current?.contentWindow?.postMessage("stop", "*");
    setIsRunning(false);
  };

  const handleReloadCode = () => {
    runCode(code);
  };

  const handleClear = () => {
    setGamePrompt("");
    setCode(EMPTY_CODE);
    setAppState(AppState.IDLE);
    setError(null);
    setTitle("Interactive Sketch");
    setInfo("");
    lastErrorRef.current = "";
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerateGame();
    }
  };

  return (
    <div
      className={`w-full min-h-screen flex flex-col 
        
           "bg-gray-900 text-gray-100"
      `}
    >
      <div className="w-full flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-[400px] flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="p-4 flex flex-col h-full">
            <h3 className="text-lg font-medium mb-3 text-black">
              Describe your game/sketch:
            </h3>
            <textarea
              value={gamePrompt}
              onChange={(e) => setGamePrompt(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="e.g., A flock of boids swimming around"
              rows={4}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md 
                        bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                        mb-4 flex-grow resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={appState === AppState.GENERATING}
            />
            <motion.button
              onClick={handleGenerateGame}
              disabled={appState === AppState.GENERATING || !gamePrompt.trim()}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white
                        rounded-md cursor-pointer text-base font-medium
                        disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              whileTap={{ scale: 0.98 }}
            >
              {appState === AppState.GENERATING ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating...
                </div>
              ) : (
                "Generate Sketch"
              )}
            </motion.button>

            {error && (
              <div
                className={`mt-4 p-3 rounded-md overflow-y-auto max-h-[200px] ${
                  error.type === "api"
                    ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-100"
                    : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-100"
                }`}
                role="alert"
              >
                <div className="flex justify-between items-start">
                  <strong className="text-sm">
                    {error.type === "api" ? "API Error: " : "Runtime Error: "}
                  </strong>
                  {error.type === "runtime" && (
                    <button
                      onClick={handleFixError}
                      disabled={appState === AppState.GENERATING}
                      className="ml-2 text-xs bg-yellow-200 dark:bg-yellow-800 px-2 py-1 rounded"
                    >
                      Fix Error
                    </button>
                  )}
                </div>
                <div className="mt-1 text-sm">{error.text}</div>
              </div>
            )}
          </div>
        </div>

        {/* Main Container */}
        <div className="flex-1 flex flex-col relative">
          {/* Title and Info Bar */}
          {(title !== "Interactive Sketch" || info) && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl text-center">{title}</h2>
              {info && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 max-h-24 overflow-y-auto">
                  {info}
                </div>
              )}
            </div>
          )}

          {/* Sketch Display */}
          <iframe
            ref={iframeRef}
            className="w-full flex-1 border-0"
            title="p5.js Preview"
            sandbox="allow-scripts allow-same-origin"
          ></iframe>

          {/* Control Bar */}
          <div className="h-16 flex items-center justify-center border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleReloadCode}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white disabled:opacity-50"
                title="Reload code"
                disabled={appState === AppState.GENERATING}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 -960 960 960"
                  fill="currentColor"
                >
                  <path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z" />
                </svg>
                <span className="sr-only">Reload</span>
              </button>

              <button
                onClick={handlePlay}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white disabled:opacity-50"
                disabled={isRunning || appState === AppState.GENERATING}
                title="Play/Resume sketch"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 -960 960 960"
                  fill="currentColor"
                >
                  <path d="m380-300 280-180-280-180v360ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
                </svg>
                <span className="sr-only">Play</span>
              </button>

              <button
                onClick={handleStop}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white disabled:opacity-50"
                disabled={!isRunning || appState === AppState.GENERATING}
                title="Stop/Pause sketch"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 -960 960 960"
                  fill="currentColor"
                >
                  <path d="M320-320h320v-320H320v320ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
                </svg>
                <span className="sr-only">Stop</span>
              </button>

              <button
                onClick={handleClear}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white disabled:opacity-50"
                disabled={appState === AppState.GENERATING}
                title="Clear prompt and reset sketch"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 -960 960 960"
                  fill="currentColor"
                >
                  <path d="m376-300 104-104 104 104 56-56-104-104 104-104-56-56-104 104-104-104-56 56 104 104-104 104 56 56Zm-96 180q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Z" />
                </svg>
                <span className="sr-only">Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {appState === AppState.GENERATING && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          >
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg max-w-sm">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-center text-neutral-200">
                  Generating your sketch...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
