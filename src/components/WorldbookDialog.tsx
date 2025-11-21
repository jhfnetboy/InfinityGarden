import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { dbService, Worldbook } from '../services/database';
import { X } from 'lucide-react';

interface WorldbookDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: Worldbook;
}

export function WorldbookDialog({ isOpen, onClose, onSave, initialData }: WorldbookDialogProps) {
  const [keywords, setKeywords] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (isOpen && initialData) {
      setKeywords(initialData.keywords);
      setContent(initialData.content);
    } else if (isOpen) {
      setKeywords('');
      setContent('');
    }
  }, [isOpen, initialData]);

  async function handleSave() {
    if (!keywords || !content) return;

    const wb: Worldbook = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      keywords,
      content
    };

    await dbService.saveWorldbook(wb);
    onSave();
    onClose();
  }

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={onClose}>
      <div 
        className="bg-white rounded-xl w-96 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            {initialData ? 'Edit Worldbook Entry' : 'New Worldbook Entry'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
              placeholder="e.g., The Great War, Magic System"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 h-32 resize-none"
              placeholder="Description of the entry..."
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!keywords || !content}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
          >
            Save Entry
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
