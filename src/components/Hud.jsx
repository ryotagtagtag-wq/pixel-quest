import { Heart, Coins, Trophy, Volume2, VolumeX, Pause, Play, RotateCcw } from 'lucide-react';

function Stat({ icon: Icon, label, children, tone = '' }) {
  return <div className={`stat ${tone}`}><Icon size={15} strokeWidth={2.5} aria-hidden="true"/><span className="stat-label">{label}</span><strong>{children}</strong></div>;
}

export default function Hud({ game, onPause, onRestart, onToggleSound }) {
  return (
    <div className="hud" aria-label="ゲームステータス">
      <Stat icon={Trophy} label="SCORE">{String(game.score || 0).padStart(6, '0')}</Stat>
      <Stat icon={Coins} label="COINS">{game.coins || 0}<span className="muted">/{game.totalCoins || 17}</span></Stat>
      <div className="stat health-stat"><Heart size={15} fill="currentColor" aria-hidden="true"/><span className="stat-label">HP</span><strong>{'♥'.repeat(Math.max(0, game.hp || 0))}<span className="empty-hearts">{'♥'.repeat(Math.max(0, 3 - (game.hp || 0)))}</span></strong></div>
      <div className="hud-actions">
        <button className="icon-button" onClick={onToggleSound} aria-label={game.soundOn ? '音をオフ' : '音をオン'} title={game.soundOn ? 'Sound on (M)' : 'Sound off (M)'}>{game.soundOn ? <Volume2 size={17}/> : <VolumeX size={17}/>}</button>
        <button className="icon-button" onClick={onPause} aria-label={game.state === 'paused' ? '再開' : '一時停止'} title="Pause (P / Esc)">{game.state === 'paused' ? <Play size={17}/> : <Pause size={17}/>}</button>
        <button className="icon-button" onClick={onRestart} aria-label="最初からやり直す" title="Restart"><RotateCcw size={17}/></button>
      </div>
    </div>
  );
}
