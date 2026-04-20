import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import Apply from "./pages/Apply";
import UserDashboard from "./pages/UserDashboard";
import HRDashboard from "./pages/HRDashboard";
import Profile from "./pages/Profile";
import SavedJobs from "./pages/SavedJobs";
import Features from "./pages/Features";
import AIAnalyzer from "./pages/AIAnalyzer";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/features" element={<Features />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/analyzer" element={<AIAnalyzer />} />
        <Route path="/apply/:id" element={<Apply />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/hr-dashboard" element={<HRDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/saved-jobs" element={<SavedJobs />} />
      </Routes>
    </Router>
  );
}

export default App;