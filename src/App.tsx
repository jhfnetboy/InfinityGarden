import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WorldSelector } from './components/WorldSelector';
import { ChatInterface } from './components/ChatInterface';
import './App.css';

function App() {
  return (
    <HashRouter>
      <div className="w-full h-full overflow-hidden">
        <Routes>
          <Route path="/" element={<WorldSelector />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
