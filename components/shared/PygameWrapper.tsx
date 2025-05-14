"use client";

import { useEffect, useRef } from "react";

interface PygameWrapperProps {
  gameCode: string;
  gameId: string;
}

export default function PygameWrapper({
  gameCode,
  gameId,
}: PygameWrapperProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!gameCode || !gameId) return;

    // The URL to your Pygbag deployment
    // This assumes you have a server endpoint that hosts the Pygbag-compiled games
    const pygbagUrl = `/api/games/pygame/${gameId}`;

    if (iframeRef.current) {
      iframeRef.current.src = pygbagUrl;
    }

    return () => {
      // Cleanup if needed
    };
  }, [gameCode, gameId]);

  return (
    <div className="w-full h-full flex justify-center items-center">
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        allow="autoplay; fullscreen; microphone; gamepad; accelerometer; gyroscope; camera; xr-spatial-tracking"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        title="Pygame Game"
      ></iframe>
    </div>
  );
}
