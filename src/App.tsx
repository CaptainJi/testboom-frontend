import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Files from './pages/Files';
import Cases from './pages/Cases';
import Tasks from './pages/Tasks';
import './styles/globals.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="files" element={<Files />} />
          <Route path="cases" element={<Cases />} />
          <Route path="tasks" element={<Tasks />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
