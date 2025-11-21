import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../services/database';
import { i18nService, Language } from '../services/i18n';
import { Maximize2, Upload, Download, Trash2, Sparkles } from 'lucide-react';

export function WorldSelector() {
  const navigate = useNavigate();
  const [worlds, setWorlds] = useState<string[]>([]);
  const [newWorldName, setNewWorldName] = useState('');
  const [language, setLanguage] = useState<Language>(i18nService.getLanguage());

  const t = (key: string) => i18nService.t(key);

  const handleLanguageChange = (lang: Language) => {
    i18nService.setLanguage(lang);
    setLanguage(lang);
  };

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

  const handleLoadExample = async () => {
    try {
      const response = await fetch(chrome.runtime.getURL('CypherPink.json'));
      const data = await response.json();

      const worldName = data.worldName || 'CypherPink';
      const success = await dbService.importWorld(data, worldName);

      if (success) {
        loadWorlds();
        alert('CypherPink example world loaded successfully!');
      } else {
        alert('Failed to load example world');
      }
    } catch (error) {
      console.error('Error loading example:', error);
      alert('Error loading example: ' + (error as Error).message);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-screen h-screen bg-gradient-to-br from-sky-200 to-blue-300 text-gray-800 p-8">
      <div className="absolute top-4 right-4 flex gap-2">
        <div className="flex gap-1 bg-white/50 backdrop-blur-sm rounded-lg p-1">
          {(['en', 'zh', 'th'] as Language[]).map(lang => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`px-3 py-1 rounded transition-colors text-sm font-medium ${
                language === lang
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 hover:bg-white/50'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL("index.html") })}
          className="text-gray-600 hover:text-gray-900 transition-colors"
          title={t('worldSelector.openInNewTab')}
        >
          <Maximize2 size={24} />
        </button>
      </div>

      <div className="mb-3 text-center">
        <img src="assets/icon.png" alt="Logo" className="w-24 h-24 mx-auto mb-4 mt-8 pt-0.5 drop-shadow-lg" />
        <h1 className="text-4xl font-bold mb-2 text-gray-900">XGarden</h1>
        <p className="text-gray-700">{t('app.subtitle')}</p>
      </div>

      <div className="w-full max-w-xs space-y-4">
        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2">
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
                  title={t('worldSelector.exportWorld')}
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={(e) => handleDelete(world, e)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title={t('worldSelector.deleteWorld')}
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
                placeholder={t('worldSelector.newWorldName')}
                className="w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-purple-500 bg-white/80 backdrop-blur-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateWorld()}
              />
            </div>
            <button
              onClick={handleCreateWorld}
              disabled={!newWorldName.trim()}
              className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-purple-500/30"
            >
              {t('worldSelector.create')}
            </button>
          </div>
          
          <div className="mt-4 flex flex-col gap-2">
            <label className="flex items-center justify-center gap-2 text-gray-700 hover:text-gray-900 cursor-pointer px-4 py-2 rounded-lg hover:bg-white/50 transition-colors">
              <Upload size={18} />
              <span className="text-sm font-medium">{t('worldSelector.importWorld')}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <button
              onClick={handleLoadExample}
              className="flex items-center justify-center gap-2 text-purple-700 hover:text-purple-900 cursor-pointer px-4 py-2 rounded-lg hover:bg-purple-100/50 transition-colors"
            >
              <Sparkles size={18} />
              <span className="text-sm font-medium">{t('worldSelector.loadExample')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
