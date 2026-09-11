import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app/App'
import { AppProviders } from './app/providers/AppProviders'
import './app/styles.css'

async function bootstrap() {
  if (import.meta.env.DEV) {
    const { startMocking } = await import('./mocks/browser')
    await startMocking()
  }
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode><AppProviders><BrowserRouter><App /></BrowserRouter></AppProviders></React.StrictMode>,
  )
}
void bootstrap().catch(() => {
  const root = document.getElementById('root')!
  root.textContent = '화면을 준비하지 못했어요. 네트워크 연결을 확인한 뒤 새로고침해 주세요.'
})
