import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../services/database';
import { Maximize2, Upload, Download, Trash2 } from 'lucide-react';

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
    console.log('Entering world:', name);
    try {
      const success = await dbService.connect(name);
      console.log('Connection success:', success);
      if (success) {
        navigate('/chat');
      } else {
        console.error('Failed to connect to world');
        alert('Failed to connect to world');
      }
    } catch (error) {
      console.error('Error entering world:', error);
      alert('Error entering world: ' + (error as Error).message);
    }
  }

  async function handleCreateWorld() {
    if (!newWorldName.trim()) return;
    await handleEnterWorld(newWorldName);
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Starting import for file:', file.name);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        console.log('File read successfully');
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        console.log('JSON parsed:', data);
        
        // Use filename as default world name if not present
        const worldName = data.worldName || file.name.replace('.json', '');
        console.log('Importing into world:', worldName);
        
        const success = await dbService.importWorld(data, worldName);
        console.log('Import result:', success);
        
        if (success) {
          loadWorlds();
          alert('World imported successfully!');
        } else {
          alert('Failed to import world');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('Invalid world file: ' + (error as Error).message);
      }
      // Reset input
      event.target.value = '';
    };
    reader.onerror = (e) => {
      console.error('File reading error:', e);
      alert('Error reading file');
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleExport = async (worldName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const data = await dbService.exportWorld(worldName);
    if (!data) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${worldName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (worldName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete world "${worldName}"? This cannot be undone.`)) {
      await dbService.deleteWorld(worldName);
      loadWorlds();
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-full bg-gradient-to-br from-sky-200 to-blue-300 text-gray-800 p-8">
      <button 
        onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL("index.html") })}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors"
        title="Open in new tab"
      >
        <Maximize2 size={24} />
      </button>

      <div className="mb-8 text-center">
        <img src="assets/icon.png" alt="Logo" className="w-24 h-24 mx-auto mb-4 drop-shadow-lg" />
        <h1 className="text-4xl font-bold mb-2 text-gray-900">XGarden</h1>
        <p className="text-gray-700">Choose your reality</p>
      </div>

      <div className="w-full max-w-xs space-y-4">
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
          {worlds.map(world => (
            <button
              key={world}
              onClick={() => handleEnterWorld(world)}
              className="w-full p-4 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all font-medium text-left flex justify-between items-center group"
            >
              <span>{world}</span>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleExport(world, e)}
                  className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                  title="Export World"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={(e) => handleDelete(world, e)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete World"
                >
                  <Trash2 size={16} />
                </button>
                <span className="text-purple-500">→</span>
              </div>
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-400/30">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={newWorldName}
                onChange={(e) => setNewWorldName(e.target.value)}
                placeholder="New World Name"
                className="w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-purple-500 bg-white/80 backdrop-blur-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateWorld()}
              />
            </div>
            <button
              onClick={handleCreateWorld}
              disabled={!newWorldName.trim()}
              className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-purple-500/30"
            >
              Create
            </button>
          </div>
          
          <div className="mt-4 flex justify-center">
            <label className="flex items-center gap-2 text-gray-700 hover:text-gray-900 cursor-pointer px-4 py-2 rounded-lg hover:bg-white/50 transition-colors">
              <Upload size={18} />
              <span className="text-sm font-medium">Import World JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
