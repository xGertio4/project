// src/App.jsx
import DervishiGroup from './DervishiGroup'
import Admin from './admin/Admin'
import { useHashRoute, useTheme } from './lib/store'

export default function App() {
  const [route, navigate] = useHashRoute()
  const [dark, setDark] = useTheme()
  const isAdmin = route.startsWith("/admin")
  return isAdmin
    ? <Admin navigate={navigate} dark={dark} setDark={setDark} />
    : <DervishiGroup navigate={navigate} dark={dark} setDark={setDark} />
}