import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from '../features/auth/RequireAuth'
import { LoginPage } from '../pages/LoginPage'
import { SignupPage } from '../pages/SignupPage'
import { FridgePage } from '../pages/FridgePage'
import { AddIngredientPage } from '../pages/AddIngredientPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { AppLayout } from './layouts/AppLayout'

export function App() {
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route element={<RequireAuth />}>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/fridge" replace />} />
        <Route path="/fridge" element={<FridgePage />} />
        <Route path="/ingredients/new" element={<AddIngredientPage />} />
      </Route>
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
}
