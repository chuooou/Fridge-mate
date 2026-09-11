import { Icon } from './Icon'
export function LoadingState({ text = '잠시만 기다려주세요' }: { text?: string }) {
  return <div className="async-state" role="status"><span className="spinner" />{text}</div>
}
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="async-state error-panel" role="alert"><Icon name="clock" size={28} /><p>{message}</p>{onRetry && <button className="button secondary" onClick={onRetry}>다시 시도</button>}</div>
}
