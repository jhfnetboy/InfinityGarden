import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../services/database';
import { Maximize2 } from 'lucide-react';

export function WorldSelector() {
  const navigate = useNavigate();
  const [worlds, setWorlds] = useState<string[]>([]);
  const [newWorldName, setNewWorldName] = useState('');

  useEffect(() => {
    loadWorlds();
  }, []);

  async function loadWorlds() {
    const availableWorlds = await dbService.getAvailableWorlds();
    setWorlds(availableWorlds);
  }

  async function handleEnterWorld(name: string) {
    const success = await dbService.connect(name);
    if (success) {
      navigate('/chat');
    }
  }

  async function handleCreateWorld() {
    if (!newWorldName.trim()) return;
    await handleEnterWorld(newWorldName);
  }

  return (
    <div className="relative flex flex-col items-center justify-center h-full bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-8">
      <button 
        onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL("index.html") })}
        className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        title="Open in new tab"
      >
        <Maximize2 size={24} />
      </button>

      <div className="mb-8 text-center">
        <img src="assets/icon.png" alt="Logo" className="w-24 h-24 mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-2">XGarden</h1>
        <p className="text-white/70">Choose your reality</p>
      </div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>🌍</span> Select World
          </h2>
          <div className="space-y-2">
            {worlds.map(world => (
              <button
                key={world}
                onClick={() => handleEnterWorld(world)}
                className="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex justify-between items-center"
              >
                <span>{world}</span>
                <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">Ready</span>
              </button>
            ))}
            {worlds.length === 0 && (
              <p className="text-center text-white/50 py-4">No worlds found. Create one below.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>✨</span> Create World
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newWorldName}
              onChange={(e) => setNewWorldName(e.target.value)}
              placeholder="Enter world name..."
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-400"
            />
            <button
              onClick={handleCreateWorld}
              disabled={!newWorldName.trim()}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
