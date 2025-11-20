import { useState, useEffect } from 'react';
import { dbService, Character } from '../services/database';
import { X } from 'lucide-react';



interface CharacterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: Character;
}

export function CharacterDialog({ isOpen, onClose, onSave, initialData }: CharacterDialogProps) {
  const [name, setName] = useState('');
  const [persona, setPersona] = useState('');
  const [greeting, setGreeting] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  // The original code had isPlayer state, but the instruction's handleSave
  // hardcodes isPlayer: false. I will keep the state for now but it won't be used
  // in the handleSave as per the instruction.
  const [isPlayer, setIsPlayer] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name);
      setPersona(initialData.persona);
      setGreeting(initialData.greeting);
      setAvatar(initialData.avatar || '');
      setIsPublic(initialData.isPublic || false);
      setIsPlayer(initialData.isPlayer || false); // Populate isPlayer if editing
    } else if (isOpen) {
      // Reset for new character
      setName('');
      setPersona('');
      setGreeting('');
      setAvatar('');
      setIsPublic(false);
      setIsPlayer(false); // Reset isPlayer for new character
    }
  }, [isOpen, initialData]);

  async function handleSave() {
    if (!name || !persona) return;

    const char: Character = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      name,
      persona,
      greeting,
      avatar,
      isPublic,
      isPlayer
    };

    await dbService.saveCharacter(char);
    onSave();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-96 p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">New Character</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
              placeholder="Character Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Persona</label>
            <textarea
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 h-24 resize-none"
              placeholder="Describe the character's personality..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Greeting</label>
            <input
              type="text"
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
              placeholder="First message..."
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPlayer}
              onChange={(e) => setIsPlayer(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Is Player Character?</span>
          </label>
          {isPlayer && (
            <p className="text-xs text-purple-600 mt-1">
              This is your character. NPCs will use the name you set above to address you in conversations.
            </p>
          )}
          <button
            onClick={handleSave}
            disabled={!name || !persona}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
          >
            Create Character
          </button>
        </div>
      </div>
    </div>
  );
}
