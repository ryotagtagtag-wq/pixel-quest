import { ArrowRight, Crown, Gamepad2, HeartCrack, Pause, RotateCcw } from 'lucide-react';

export default function ScreenOverlay({ state, score, best, bossAlive, onStart, onRestart }) {
  if (state === 'playing') return null;

  if (state === 'title') {
    return <div className="screen-overlay title-overlay">
      <div className="title-content">
        <div className="eyebrow"><span className="live-dot"/> 8-BIT ACTION PLATFORMER</div>
        <div className="pixel-logo"><span>PIXEL</span><b>QUEST</b></div>
        <p className="tagline">A JOURNEY THROUGH THE NEON RUINS</p>
        <div className="title-rule"><i/><span>INSERT COURAGE</span><i/></div>
        <button className="primary-button" onClick={onStart}><Gamepad2 size={18}/> START ADVENTURE <ArrowRight size={16}/></button>
        <p className="overlay-hint">PRESS ENTER OR START</p>
      </div>
      <div className="overlay-bottom"><span>◈ 1 PLAYER</span><span>© PIXEL QUEST STUDIO</span><span>V 1.0.0</span></div>
    </div>;
  }

  if (state === 'paused') {
    return <div className="screen-overlay compact-overlay">
      <div className="overlay-card"><div className="overlay-icon cyan"><Pause size={24}/></div><p className="eyebrow">GAME PAUSED</p><h2>TAKE A BREATHER</h2><p>Your quest is waiting.</p><button className="primary-button" onClick={onStart}><ArrowRight size={17}/> RESUME GAME</button><small>PRESS P OR ESC TO RESUME</small></div>
    </div>;
  }

  if (state === 'won') {
    return <div className="screen-overlay compact-overlay win-overlay">
      <div className="overlay-card"><div className="overlay-icon gold"><Crown size={26}/></div><p className="eyebrow">MISSION COMPLETE</p><h2>YOU ARE A LEGEND!</h2><p>The Neon Ruins are safe again.</p><div className="result-score"><span>FINAL SCORE</span><strong>{String(score).padStart(6, '0')}</strong></div><div className="result-best"><span>PERSONAL BEST</span><b>{String(best).padStart(6, '0')}</b></div><button className="primary-button" onClick={onRestart}><RotateCcw size={16}/> PLAY AGAIN</button></div>
    </div>;
  }

  return <div className="screen-overlay compact-overlay gameover-overlay">
    <div className="overlay-card"><div className="overlay-icon pink"><HeartCrack size={25}/></div><p className="eyebrow">SIGNAL LOST</p><h2>GAME OVER</h2><p>The ruins are still waiting for you.</p><div className="result-score"><span>YOUR SCORE</span><strong>{String(score).padStart(6, '0')}</strong></div><div className="result-best"><span>PERSONAL BEST</span><b>{String(best).padStart(6, '0')}</b></div><button className="primary-button" onClick={onRestart}><RotateCcw size={16}/> TRY AGAIN</button><small>YOU CAN DO THIS, HERO.</small></div>
  </div>;
}
