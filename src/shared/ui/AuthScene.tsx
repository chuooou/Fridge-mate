import { Icon } from './Icon'
export function AuthScene() {
  return <aside className="auth-scene" aria-label="재료를 기억하는 작은 습관">
    <div className="scene-top"><Icon name="leaf" /><span>LESS WASTE, MORE TASTE</span></div>
    <div className="fridge-illustration" aria-hidden="true"><div className="fridge-door top"><span className="handle" /><span className="fridge-sticker">stay<br />fresh.</span></div><div className="fridge-door bottom"><span className="handle" /><div className="produce-row"><span>🥕</span><span>🥬</span><span>🍎</span></div></div><i /><i /></div>
    <div className="floating-note"><span className="note-icon"><Icon name="check" /></span><div>오늘도 신선하게<small>작은 기록이 만드는 좋은 습관</small></div></div>
    <div className="scene-copy"><h2>잊고 있던 재료가,<br />기다려지는 한 끼로.</h2><p>무엇이 있는지 기억하는 것부터.<br />낭비는 줄이고, 일상은 더 신선하게.</p></div>
    <span className="scene-bottom">A LITTLE CARE FOR YOUR EVERYDAY.</span>
  </aside>
}
