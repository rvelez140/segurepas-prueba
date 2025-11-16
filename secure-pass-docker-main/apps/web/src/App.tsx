import { Route, Routes } from "react-router-dom";
import Dashboard from "./pages/main/Dashboard";
import Authorizations from "./pages/main/Authorizations";
import Settings from "./pages/main/Settings";
import History from "./pages/main/History";
import { SidebarProvider } from "./contexts/SidebarContext";
import Home from "./pages/login/Home";
import Report from "./pages/main/Report";
import GoogleCallback from "./components/login/GoogleCallback";
import MicrosoftCallback from "./components/login/MicrosoftCallback";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./styles/theme.css";

const App = () => {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/google/success" element={<GoogleCallback />} />
          <Route path="/auth/microsoft/success" element={<MicrosoftCallback />} />
          <Route path="/home" element={<Dashboard />} />
          <Route path="/authorizations" element={<Authorizations />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/visit-history" element={<History />} />
          <Route path="/admin/report" element={<Report />} />
        </Routes>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default App;