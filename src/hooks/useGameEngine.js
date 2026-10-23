import { useCallback, useEffect, useRef } from 'react';
import { GameEngine } from '../engine/GameEngine.js';

/** Owns the imperative Canvas engine lifecycle while React renders the UI. */
export function useGameEngine(canvasRef, onState) {
  const engineRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const engine = new GameEngine(canvas, onState);
    engineRef.current = engine;
    engine.startLoop();
    return () => {
      engine.destroy();
      if (engineRef.current === engine) engineRef.current = null;
    };
  }, [canvasRef, onState]);

  const start = useCallback(() => engineRef.current?.start(), []);
  const restart = useCallback(() => engineRef.current?.restart(), []);
  const togglePause = useCallback(() => engineRef.current?.togglePause(), []);
  const toggleSound = useCallback(() => engineRef.current?.toggleSound(), []);
  const setInput = useCallback((action, down) => engineRef.current?.setInput(action, down), []);

  return { engineRef, start, restart, togglePause, toggleSound, setInput };
}
