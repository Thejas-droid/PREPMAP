import { HashRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import TodayPage from './pages/TodayPage'
import PlanPage from './pages/PlanPage'
import ProgressPage from './pages/ProgressPage'
import LibraryPage from './pages/LibraryPage'
import SettingsPage from './pages/SettingsPage'
export default function App(){return <HashRouter><Routes><Route element={<Layout/>}><Route index element={<TodayPage/>}/><Route path="plan" element={<PlanPage/>}/><Route path="progress" element={<ProgressPage/>}/><Route path="library" element={<LibraryPage/>}/><Route path="settings" element={<SettingsPage/>}/></Route></Routes></HashRouter>}
