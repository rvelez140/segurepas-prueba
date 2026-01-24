import { Route, Routes } from 'react-router-dom';
import Dashboard from './pages/main/Dashboard';
import Authorizations from './pages/main/Authorizations';
import Settings from './pages/main/Settings';
import History from './pages/main/History';
import { SidebarProvider } from './contexts/SidebarContext';
import Home from './pages/login/Home';
import Report from './pages/main/Report';
import Setup from './pages/setup/Setup';
import CreateAdmin from './pages/setup/CreateAdmin';
import Subscriptions from './pages/main/Subscriptions';
import Analytics from './pages/main/Analytics';
import { ThemeProvider } from './contexts/ThemeContext';
import './styles/theme.css';

const App = () => {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/create-admin" element={<CreateAdmin />} />
          <Route path="/home" element={<Dashboard />} />
          <Route path="/authorizations" element={<Authorizations />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/visit-history" element={<History />} />
          <Route path="/admin/report" element={<Report />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/admin/analytics" element={<Analytics />} />
        </Routes>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default App;
