import { AuthForm } from '../features/auth/AuthForm'
import { AuthScene } from '../shared/ui/AuthScene'
export function LoginPage() { return <main className="auth-layout"><AuthForm mode="login" /><AuthScene /></main> }
