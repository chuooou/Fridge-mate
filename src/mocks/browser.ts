import { setupWorker } from 'msw/browser'
import { createHandlers } from './handlers'
export async function startMocking() {
 if(!import.meta.env.DEV)return
 const auth=import.meta.env.VITE_MOCK_AUTH==='true',fridge=import.meta.env.VITE_MOCK_FRIDGE==='true'
 if(!auth && !fridge)return
 const worker=setupWorker(...createHandlers({auth,fridge}))
 await worker.start({onUnhandledRequest(request,print){
  const base=new URL(import.meta.env.VITE_API_BASE_URL || '/api',window.location.origin)
  const url=new URL(request.url)
  if(url.origin!==base.origin || !url.pathname.startsWith(`${base.pathname.replace(/\/$/,'')}/`))return
  const path=url.pathname.slice(base.pathname.replace(/\/$/,'').length)
  if((!auth && path.startsWith('/auth/')) || (!fridge && (path.startsWith('/fridge/') || path.startsWith('/ingredients/'))))return
  print.error()
 }})
}
