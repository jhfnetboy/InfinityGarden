import { useState, useEffect } from 'react';
import { dbService, Group, Character } from '../services/database';
import { X } from 'lucide-react';

interface GroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: Group;
}

export function GroupDialog({ isOpen, onClose, onSave, initialData }: GroupDialogProps) {
  const [name, setName] = useState('');
  const [characterIds, setCharacterIds] = useState<number[]>([]);
  const [availableCharacters, setAvailableCharacters] = useState<Character[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadCharacters();
      if (initialData) {
        setName(initialData.name);
        setCharacterIds(initialData.characterIds || []);
      } else {
        setName('');
        setCharacterIds([]);
      }
    }
  }, [isOpen, initialData]);

  async function loadCharacters() {
    const chars = await dbService.getAllCharacters();
    // Filter out player characters
    setAvailableCharacters(chars.filter(c => !c.isPlayer));
  }

  function toggleCharacter(charId: number) {
    if (characterIds.includes(charId)) {
      setCharacterIds(characterIds.filter(id => id !== charId));
    } else {
      setCharacterIds([...characterIds, charId]);
    }
  }

  async function handleSave() {
    if (!name) return;

    const group: Group = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      name,
      characterIds
    };

    await dbService.saveGroup(group);
    onSave();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-96 max-h-[80vh] flex flex-col p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            {initialData ? 'Edit Group' : 'New Group'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
              placeholder="e.g., Main Party, Villains"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Members ({characterIds.length} selected)
            </label>
            <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
              {availableCharacters.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No characters available. Create characters first.
                </div>
              ) : (
                availableCharacters.map(char => (
                  <label
                    key={char.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={characterIds.includes(char.id!)}
                      onChange={() => toggleCharacter(char.id!)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      {char.avatar && (
                        <img 
                          src={char.avatar} 
                          alt={char.name} 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{char.name}</p>
                        <p className="text-xs text-gray-500 truncate">{char.persona.slice(0, 40)}...</p>
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!name}
          className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 mt-4"
        >
          Save Group
        </button>
      </div>
    </div>
  );
}
