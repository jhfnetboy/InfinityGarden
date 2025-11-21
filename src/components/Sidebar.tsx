import { useState, useEffect } from 'react';
import { dbService, Character, Group, Worldbook } from '../services/database';
import { Plus, Users, User, Maximize2, Edit2, Trash2, Book, ChevronDown, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { CharacterDialog } from './CharacterDialog';
import { WorldbookDialog } from './WorldbookDialog';
import { GroupDialog } from './GroupDialog';
import { SettingsDialog } from './SettingsDialog';

interface SidebarProps {
  onSelectChat: (id: number, type: 'private' | 'group') => void;
  currentChat: { id: number | null; type: 'private' | 'group' | '' };
  onGeneratePortrait?: (char: Character) => void;
}

export function Sidebar({ onSelectChat, currentChat, onGeneratePortrait }: SidebarProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [worldbooks, setWorldbooks] = useState<Worldbook[]>([]);
  
  const [isGroupsCollapsed, setIsGroupsCollapsed] = useState(false);
  const [isCharsCollapsed, setIsCharsCollapsed] = useState(false);
  const [isWorldbookCollapsed, setIsWorldbookCollapsed] = useState(false);
  
  const [isCharDialogOpen, setIsCharDialogOpen] = useState(false);
  const [editingChar, setEditingChar] = useState<Character | undefined>(undefined);
  
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | undefined>(undefined);
  
  const [isWorldbookDialogOpen, setIsWorldbookDialogOpen] = useState(false);
  const [editingWorldbook, setEditingWorldbook] = useState<Worldbook | undefined>(undefined);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const chars = await dbService.getAllCharacters();
    const grps = await dbService.getAllGroups();
    const wbs = await dbService.getAllWorldbooks();
    setCharacters(chars);
    setGroups(grps);
    setWorldbooks(wbs);
  }

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src={chrome.runtime.getURL('assets/icon.png')} alt="XGarden" className="w-10 h-10" />
          <p className="text-xs text-gray-500">Connected to: {dbService['currentWorldName']}</p>
        </div>
        <button 
          onClick={() => {
            const worldName = dbService['currentWorldName'];
            const url = chrome.runtime.getURL(`index.html#/chat?world=${encodeURIComponent(worldName)}`);
            chrome.tabs.create({ url });
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Open in new tab"
        >
          <Maximize2 size={20} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Groups */}
        <div>
          <div className="flex justify-between items-center px-2 mb-2">
            <button
              onClick={() => setIsGroupsCollapsed(!isGroupsCollapsed)}
              className="flex items-center gap-1 flex-1 text-left group"
            >
              <ChevronDown 
                size={14} 
                className={cn(
                  "text-gray-400 transition-transform",
                  isGroupsCollapsed && "-rotate-90"
                )}
              />
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider group-hover:text-gray-600">
                Groups ({groups.length})
              </h3>
            </button>
            <button 
              onClick={() => {
                setEditingGroup(undefined);
                setIsGroupDialogOpen(true);
              }}
              className="text-gray-400 hover:text-purple-600"
              title="Add Group"
            >
              <Plus size={14} />
            </button>
          </div>
          {!isGroupsCollapsed && (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {groups.map(group => (
                <button
                  key={group.id}
                  onClick={() => onSelectChat(group.id!, 'group')}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors group relative",
                    currentChat.type === 'group' && currentChat.id === group.id
                      ? "bg-purple-100 text-purple-900"
                      : "hover:bg-gray-200 text-gray-700"
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 flex-shrink-0">
                    <Users size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium truncate">{group.name}</span>
                  </div>
                  
                  {/* Actions */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-md p-1 shadow-sm">
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingGroup(group);
                        setIsGroupDialogOpen(true);
                      }}
                      className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </div>
                    <div 
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm(`Delete group "${group.name}"?`)) {
                          await dbService.deleteGroup(group.id!);
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
          )}
        </div>

        {/* Characters */}
        <div>
          <div className="flex justify-between items-center px-2 mb-2">
            <button
              onClick={() => setIsCharsCollapsed(!isCharsCollapsed)}
              className="flex items-center gap-1 flex-1 text-left group"
            >
              <ChevronDown 
                size={14} 
                className={cn(
                  "text-gray-400 transition-transform",
                  isCharsCollapsed && "-rotate-90"
                )}
              />
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider group-hover:text-gray-600">
                Characters ({characters.filter(c => !c.isPlayer).length})
              </h3>
            </button>
            <button 
              onClick={() => {
                setEditingChar(undefined);
                setIsCharDialogOpen(true);
              }}
              className="text-gray-400 hover:text-purple-600"
              title="Add Character"
            >
              <Plus size={14} />
            </button>
          </div>
          {!isCharsCollapsed && (
            <div className="max-h-64 overflow-y-auto space-y-1">
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
          )}
        </div>

        {/* Worldbook */}
        <div>
          <div className="flex justify-between items-center px-2 mb-2">
            <button
              onClick={() => setIsWorldbookCollapsed(!isWorldbookCollapsed)}
              className="flex items-center gap-1 flex-1 text-left group"
            >
              <ChevronDown 
                size={14} 
                className={cn(
                  "text-gray-400 transition-transform",
                  isWorldbookCollapsed && "-rotate-90"
                )}
              />
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider group-hover:text-gray-600">
                Worldbook ({worldbooks.length})
              </h3>
            </button>
            <button
              onClick={() => {
                setEditingWorldbook(undefined);
                setIsWorldbookDialogOpen(true);
              }}
              className="text-gray-400 hover:text-purple-600"
              title="Add Entry"
            >
              <Plus size={14} />
            </button>
          </div>
          {!isWorldbookCollapsed && (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {worldbooks.map(wb => (
                <div
                  key={wb.id}
                  className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 hover:bg-gray-200 text-gray-700 transition-colors group relative"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
                    <Book size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{wb.keywords}</p>
                    <p className="text-xs text-gray-500 truncate">{wb.content}</p>
                  </div>

                  {/* Actions */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-md p-1 shadow-sm">
                    <div 
                      onClick={() => {
                        setEditingWorldbook(wb);
                        setIsWorldbookDialogOpen(true);
                      }}
                      className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </div>
                    <div 
                      onClick={async () => {
                        if (confirm(`Delete entry "${wb.keywords}"?`)) {
                          await dbService.deleteWorldbook(wb.id!);
                          loadData();
                        }
                      }}
                      className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Config */}
        <div>
          <div className="flex justify-between items-center px-2 mb-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Config</h3>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 flex-shrink-0">
              <Settings size={16} />
            </div>
            <span className="font-medium">AI Settings</span>
          </button>
        </div>
      </div>

      <CharacterDialog 
        isOpen={isCharDialogOpen} 
        onClose={() => setIsCharDialogOpen(false)} 
        onSave={loadData}
        initialData={editingChar}
        onGeneratePortrait={editingChar && onGeneratePortrait ? () => {
          onGeneratePortrait(editingChar);
          setIsCharDialogOpen(false);
        } : undefined}
      />
      
      <GroupDialog
        isOpen={isGroupDialogOpen}
        onClose={() => setIsGroupDialogOpen(false)}
        onSave={loadData}
        initialData={editingGroup}
      />
      
      <WorldbookDialog
        isOpen={isWorldbookDialogOpen}
        onClose={() => setIsWorldbookDialogOpen(false)}
        onSave={loadData}
        initialData={editingWorldbook}
      />

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
