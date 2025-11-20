import { useState, useEffect } from 'react';
import { globalConfigService } from '../services/globalConfig';
import { X } from 'lucide-react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const [provider, setProvider] = useState<'openai' | 'gemini'>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [model, setModel] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  async function loadConfig() {
    const config = await globalConfigService.getConfig();
    setProvider(config.provider || 'gemini');
    setApiKey(config.apiKey || '');
    setApiUrl(config.apiUrl || (config.provider === 'gemini' ? '' : 'https://api.openai.com/v1'));
    setModel(config.model || (config.provider === 'gemini' ? 'gemini-2.0-flash' : 'gpt-3.5-turbo'));
  }

  async function handleSave() {
    await globalConfigService.saveConfig({ provider, apiKey, apiUrl, model });
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-96 p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
            <select
              value={provider}
              onChange={(e) => {
                const newProvider = e.target.value as 'openai' | 'gemini';
                setProvider(newProvider);
                // Set defaults when switching
                if (newProvider === 'gemini') {
                  setApiUrl('');
                  setModel('gemini-pro');
                } else {
                  setApiUrl('https://api.openai.com/v1');
                  setModel('gpt-3.5-turbo');
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
            >
              <option value="openai">OpenAI Compatible</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
              placeholder="sk-..."
            />
          </div>

          {provider === 'openai' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API URL</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                placeholder="https://api.openai.com/v1"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            {provider === 'gemini' ? (
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
              >
                <optgroup label="Gemini 2.5 (Preview)">
                  <option value="gemini-2.5-pro-preview-03-25">gemini-2.5-pro-preview-03-25</option>
                  <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  <option value="gemini-2.5-pro-preview-05-06">gemini-2.5-pro-preview-05-06</option>
                  <option value="gemini-2.5-pro-preview-06-05">gemini-2.5-pro-preview-06-05</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                </optgroup>
                <optgroup label="Gemini 2.0 (Flash & Pro)">
                  <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp</option>
                  <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                  <option value="gemini-2.0-flash-001">gemini-2.0-flash-001</option>
                  <option value="gemini-2.0-flash-lite-001">gemini-2.0-flash-lite-001</option>
                  <option value="gemini-2.0-flash-lite">gemini-2.0-flash-lite</option>
                  <option value="gemini-2.0-pro-exp">gemini-2.0-pro-exp</option>
                  <option value="gemini-2.0-pro-exp-02-05">gemini-2.0-pro-exp-02-05</option>
                </optgroup>
                <optgroup label="Gemini 1.5 & Others">
                  <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                  <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                  <option value="gemini-pro">gemini-pro</option>
                </optgroup>
              </select>
            ) : (
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                placeholder="gpt-3.5-turbo"
              />
            )}
          </div>

          <div className="text-xs text-gray-500 mt-2">
            <p>Need an API Key?</p>
            {provider === 'gemini' ? (
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                Get Gemini API Key
              </a>
            ) : (
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                Get OpenAI API Key
              </a>
            )}
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
