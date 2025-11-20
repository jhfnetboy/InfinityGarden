import { useState, useEffect } from 'react';
import { dbService, Group } from '../services/database';
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

  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name);
      setCharacterIds(initialData.characterIds || []);
    } else if (isOpen) {
      setName('');
      setCharacterIds([]);
    }
  }, [isOpen, initialData]);

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
      <div className="bg-white rounded-xl w-96 p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            {initialData ? 'Edit Group' : 'New Group'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
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

          <button
            onClick={handleSave}
            disabled={!name}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
          >
            Save Group
          </button>
        </div>
      </div>
    </div>
  );
}
