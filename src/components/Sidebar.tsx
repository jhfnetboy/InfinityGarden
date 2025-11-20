import { useState, useEffect } from 'react';
import { dbService, Character, Group } from '../services/database';
import { Plus, Users, User, Settings, Maximize2, Edit2, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
// import { SettingsDialog } from './SettingsDialog'; // Keep import if needed or remove
import { CharacterDialog } from './CharacterDialog';

interface SidebarProps {
  onSelectChat: (id: number, type: 'private' | 'group') => void;
  currentChat: { id: number | null; type: 'private' | 'group' | '' };
  onOpenSettings: () => void;
}

export function Sidebar({ onSelectChat, currentChat, onOpenSettings }: SidebarProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeTab, setActiveTab] = useState<'chats' | 'contacts'>('chats');
  // const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Moved to parent
  const [isCharDialogOpen, setIsCharDialogOpen] = useState(false);
  const [editingChar, setEditingChar] = useState<Character | undefined>(undefined);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const chars = await dbService.getAllCharacters();
    const grps = await dbService.getAllGroups();
    setCharacters(chars);
    setGroups(grps);
  }

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
        <div>
          <h2 className="font-bold text-gray-800 text-lg">XGarden</h2>
          <p className="text-xs text-gray-500">Connected to: {dbService['currentWorldName']}</p>
        </div>
        <button 
          onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL("index.html") })}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Open in new tab"
        >
          <Maximize2 size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab('chats')}
          className={cn(
            "flex-1 py-2 text-sm font-medium transition-colors",
            activeTab === 'chats' ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Chats
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={cn(
            "flex-1 py-2 text-sm font-medium transition-colors",
            activeTab === 'contacts' ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Contacts
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Groups */}
        {groups.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Groups</h3>
            {groups.map(group => (
              <button
                key={group.id}
                onClick={() => onSelectChat(group.id!, 'group')}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors",
                  currentChat.type === 'group' && currentChat.id === group.id
                    ? "bg-purple-100 text-purple-900"
                    : "hover:bg-gray-200 text-gray-700"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-700">
                  <Users size={16} />
                </div>
                <span className="font-medium truncate">{group.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Characters */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Characters</h3>
          {characters.filter(c => !c.isPlayer).map(char => (
            <button
              key={char.id}
              onClick={() => onSelectChat(char.id!, 'private')}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors group relative",
                currentChat.type === 'private' && currentChat.id === char.id
                  ? "bg-purple-100 text-purple-900"
                  : "hover:bg-gray-200 text-gray-700"
              )}
            >
              <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 overflow-hidden flex-shrink-0">
                {char.avatar ? (
                  <img src={char.avatar} alt={char.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={16} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{char.name}</p>
                <p className="text-xs text-gray-500 truncate">{char.persona.slice(0, 30)}...</p>
              </div>
              
              {/* Actions */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-md p-1 shadow-sm">
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingChar(char);
                    setIsCharDialogOpen(true);
                  }}
                  className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded cursor-pointer"
                  title="Edit"
                >
                  <Edit2 size={14} />
                </div>
                <div 
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (confirm(`Delete ${char.name}?`)) {
                      await dbService.deleteCharacter(char.id!);
                      loadData();
                    }
                  }}
                  className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 bg-white flex justify-between">
        <button 
          onClick={onOpenSettings}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" 
          title="Settings"
        >
          <Settings size={20} />
        </button>
        <button 
          onClick={() => {
            setEditingChar(undefined);
            setIsCharDialogOpen(true);
          }}
          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg flex items-center gap-2" 
          title="Add Character"
        >
          <Plus size={20} />
          <span className="text-sm font-medium">New</span>
        </button>
      </div>

      {/* <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} /> */ }
      <CharacterDialog 
        isOpen={isCharDialogOpen} 
        onClose={() => setIsCharDialogOpen(false)} 
        onSave={loadData}
        initialData={editingChar}
      />
    </div>
  );
}
