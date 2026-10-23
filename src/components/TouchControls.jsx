import { ArrowLeft, ArrowRight, ArrowUp, Sword } from 'lucide-react';

function TouchButton({ action, label, children, setInput, className = '' }) {
  const press = (event) => { event.preventDefault(); event.currentTarget.setPointerCapture?.(event.pointerId); setInput(action, true); };
  const release = (event) => { event.preventDefault(); setInput(action, false); };
  return <button className={`touch-button ${className}`} type="button" aria-label={label}
    onPointerDown={press} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={() => setInput(action, false)} onContextMenu={(event) => event.preventDefault()}>
    {children}
  </button>;
}

export default function TouchControls({ setInput }) {
  return <div className="touch-controls" aria-label="タッチゲーム操作">
    <div className="touch-movement"><TouchButton action="left" label="左へ移動" setInput={setInput}><ArrowLeft/></TouchButton><TouchButton action="right" label="右へ移動" setInput={setInput}><ArrowRight/></TouchButton></div>
    <div className="touch-actions"><TouchButton action="attack" label="攻撃" setInput={setInput} className="attack-touch"><Sword/></TouchButton><TouchButton action="jump" label="ジャンプ" setInput={setInput} className="jump-touch"><ArrowUp/></TouchButton></div>
    <span className="touch-caption">MOVE <i/> JUMP <i/> ATTACK</span>
  </div>;
}
