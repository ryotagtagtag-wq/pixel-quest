import { useCallback, useRef, useState } from 'react';
import { Github, Keyboard, Maximize2, ShieldCheck, Star, Zap } from 'lucide-react';
import Hud from './components/Hud.jsx';
import ScreenOverlay from './components/ScreenOverlay.jsx';
import TouchControls from './components/TouchControls.jsx';
import { useGameEngine } from './hooks/useGameEngine.js';

const INITIAL_GAME = { state: 'title', score: 0, best: 0, coins: 0, totalCoins: 17, hp: 3, bossHp: 5, bossAlive: true, checkpoint: 0, soundOn: true, x: 0 };

export default function App() {
  const canvasRef = useRef(null);
  const [game, setGame] = useState(INITIAL_GAME);
  const onState = useCallback((snapshot) => setGame(snapshot), []);
  const { start, restart, togglePause, toggleSound, setInput } = useGameEngine(canvasRef, onState);
  const [fullscreenMessage, setFullscreenMessage] = useState('');

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await document.querySelector('.game-shell')?.requestFullscreen?.();
      else await document.exitFullscreen?.();
      setFullscreenMessage('');
    } catch { setFullscreenMessage('全画面表示はこのブラウザでは使えません。'); }
  };

  return <main className="app-shell">
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Pixel Quest home"><span className="brand-mark">P<span>Q</span></span><span className="brand-word">PIXEL<span>QUEST</span><small>RETRO ARCADE / VOL. 01</small></span></a>
      <div className="topbar-right"><span className="edition-tag"><span className="live-dot"/> PLAYABLE BUILD <b>1.0.0</b></span><a className="source-link" href="https://github.com/" target="_blank" rel="noreferrer"><Github size={15}/> OPEN SOURCE READY</a></div>
    </header>

    <section className="intro-row" id="top">
      <div><p className="section-kicker">THE ADVENTURE STARTS HERE <span>✦</span></p><h1>One hero.<em> One epic quest.</em></h1><p className="intro-copy">Run, jump, collect ancient pixels, and take down the guardian of the Neon Ruins.</p></div>
      <div className="intro-sticker"><span className="sticker-star">✦</span><strong>8-BIT</strong><small>ORIGINAL<br/>ADVENTURE</small></div>
    </section>

    <section className="game-layout" aria-label="PIXEL QUEST ゲーム">
      <div className="main-game-column">
        <div className="game-shell">
          <div className="screen-topline"><span><i/> LIVE SESSION</span><span>480 × 270 <b>PIXEL DISPLAY</b></span></div>
          <div className="screen-stage">
            <canvas ref={canvasRef} aria-label="Pixel Quest 2Dアクションゲーム画面" />
            <ScreenOverlay state={game.state} score={game.score} best={game.best} bossAlive={game.bossAlive} onStart={start} onRestart={restart}/>
          </div>
          <Hud game={game} onPause={togglePause} onRestart={restart} onToggleSound={toggleSound}/>
        </div>
        <TouchControls setInput={setInput}/>
        {fullscreenMessage && <p className="inline-message" role="status">{fullscreenMessage}</p>}
        <div className="below-game-row"><span><span className="tiny-dot"/> YOUR PROGRESS SAVES LOCALLY</span><button className="text-action" onClick={toggleFullscreen}><Maximize2 size={14}/> FULLSCREEN</button></div>
      </div>

      <aside className="side-panel">
        <div className="side-panel-head"><div><p className="panel-kicker">MISSION BRIEF</p><h2>THE NEON RUINS</h2></div><span className="level-badge">LV.01</span></div>
        <p className="mission-copy">A long-lost power core has awakened the ancient guardian. Cross the ruins, collect treasure, and restore the signal.</p>
        <div className="mission-progress"><div className="progress-label"><span>EXPLORATION</span><strong>{Math.min(100, Math.floor((game.x / 2860) * 100))}%</strong></div><div className="progress-track"><span style={{ width: `${Math.min(100, (game.x / 2860) * 100)}%` }}/></div><div className="progress-foot"><span>START</span><span>FINAL GATE</span></div></div>
        <div className="mission-stat-grid"><div className="mini-stat"><span>RELICS FOUND</span><strong>{String(game.coins).padStart(2, '0')}<small> / {game.totalCoins}</small></strong></div><div className="mini-stat"><span>CHECKPOINT</span><strong>{String(game.checkpoint).padStart(2, '0')}<small> / 02</small></strong></div></div>
        <div className="boss-panel"><div className="boss-icon">☠</div><div className="boss-info"><div className="boss-heading"><span>FINAL GUARDIAN</span><strong>{game.bossAlive ? 'ACTIVE' : 'DEFEATED'}</strong></div><div className="boss-health">{Array.from({ length: 5 }, (_, i) => <i key={i} className={game.bossAlive && i < game.bossHp ? 'filled' : ''}/>)}</div></div></div>
        <div className="control-guide"><div className="guide-heading"><Keyboard size={15}/> CONTROLS <span>KEYBOARD</span></div><div className="key-row"><span className="keycap">A</span><span className="keycap">D</span><span className="keycap wide">←</span><span className="keycap wide">→</span><span>Move</span></div><div className="key-row"><span className="keycap wide">SPACE</span><span className="keycap">↑</span><span>Jump</span></div><div className="key-row"><span className="keycap">Z</span><span className="keycap">X</span><span>Attack</span></div><div className="key-row"><span className="keycap">P</span><span className="keycap">ESC</span><span>Pause</span></div></div>
        <div className="side-tip"><Zap size={15}/><p><strong>PRO TIP</strong><br/>Stomp enemies from above or strike them at close range. Look for teal flags to save your checkpoint.</p></div>
      </aside>
    </section>

    <footer className="footer"><div className="footer-left"><span className="footer-brand">PQ</span><span>BUILT WITH <b>REACT</b> + <b>CANVAS</b></span></div><div className="footer-badges"><span><ShieldCheck size={13}/> NO TRACKING</span><span><Star size={13}/> MADE FOR PIXEL FANS</span></div><span className="footer-copy">© 2026 PIXEL QUEST</span></footer>
  </main>;
}
