import { AuthForm } from '../features/auth/AuthForm'
import { AuthScene } from '../shared/ui/AuthScene'
export function SignupPage() { return <main className="auth-layout"><AuthForm mode="signup" /><AuthScene /></main> }
