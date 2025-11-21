import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { dbService, Chapter } from '../services/database';
import { X, Upload } from 'lucide-react';

interface ChapterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: Chapter;
}

export function ChapterDialog({ isOpen, onClose, onSave, initialData }: ChapterDialogProps) {
  const [order, setOrder] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [backgroundMusic, setBackgroundMusic] = useState('');
  const [triggerType, setTriggerType] = useState<'time' | 'keyword' | 'ai-judgment'>('time');
  const [dialogueCount, setDialogueCount] = useState(10);
  const [timeMinutes, setTimeMinutes] = useState(5);
  const [keywords, setKeywords] = useState('');

  useEffect(() => {
    if (isOpen && initialData) {
      setOrder(initialData.order);
      setTitle(initialData.title);
      setDescription(initialData.description);
      setBackgroundImage(initialData.backgroundImage || '');
      setBackgroundMusic(initialData.backgroundMusic || '');
      setTriggerType(initialData.triggerType);
      setDialogueCount(initialData.triggerCondition?.dialogueCount || 10);
      setTimeMinutes(initialData.triggerCondition?.timeMinutes || 5);
      setKeywords(initialData.triggerCondition?.keywords?.join(', ') || '');
    } else if (isOpen) {
      // Reset for new chapter
      setOrder(1);
      setTitle('');
      setDescription('');
      setBackgroundImage('');
      setBackgroundMusic('');
      setTriggerType('time');
      setDialogueCount(10);
      setTimeMinutes(5);
      setKeywords('');
    }
  }, [isOpen, initialData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleSave() {
    if (!title) return;

    const triggerCondition: any = {};
    if (triggerType === 'time') {
      triggerCondition.dialogueCount = dialogueCount;
      triggerCondition.timeMinutes = timeMinutes;
    } else if (triggerType === 'keyword') {
      triggerCondition.keywords = keywords.split(',').map(k => k.trim()).filter(k => k);
    }

    const chapter: Chapter = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      order,
      title,
      description,
      backgroundImage,
      backgroundMusic,
      isActive: initialData?.isActive || false,
      isCompleted: initialData?.isCompleted || false,
      triggerType,
      triggerCondition
    };

    await dbService.saveChapter(chapter);
    onSave();
    onClose();
  }

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={onClose}>
      <div 
        className="bg-white rounded-xl w-[600px] max-h-[85vh] flex flex-col p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            {initialData ? 'Edit Chapter' : 'New Chapter'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chapter Order</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                min="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Type</label>
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
              >
                <option value="time">Time-based</option>
                <option value="keyword">Keyword</option>
                <option value="ai-judgment">AI Judgment</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chapter Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
              placeholder="e.g., The Beginning, The Journey, The Climax"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 h-20 resize-none"
              placeholder="Describe what happens in this chapter..."
            />
          </div>

          {/* Trigger Conditions */}
          {triggerType === 'time' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dialogue Count</label>
                <input
                  type="number"
                  value={dialogueCount}
                  onChange={(e) => setDialogueCount(parseInt(e.target.value) || 10)}
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time (minutes)</label>
                <input
                  type="number"
                  value={timeMinutes}
                  onChange={(e) => setTimeMinutes(parseInt(e.target.value) || 5)}
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {triggerType === 'keyword' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (comma-separated)</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                placeholder="e.g., dragon, castle, treasure"
              />
            </div>
          )}

          {triggerType === 'ai-judgment' && (
            <p className="text-sm text-gray-500 italic">
              AI will automatically determine when to advance based on story progression.
            </p>
          )}

          {/* Background Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Background Image</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={backgroundImage}
                onChange={(e) => setBackgroundImage(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                placeholder="Image URL or upload below"
              />
              <label className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 cursor-pointer flex items-center gap-2">
                <Upload size={16} />
                <span className="text-sm">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            {backgroundImage && (
              <img src={backgroundImage} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
            )}
          </div>

          {/* Background Music */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Background Music</label>
            <select
              value={backgroundMusic}
              onChange={(e) => setBackgroundMusic(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
            >
              <option value="">None</option>
              <option value="peaceful-forest">Peaceful Forest</option>
              <option value="calm-piano">Calm Piano</option>
              <option value="ambient-space">Ambient Space</option>
              <option value="medieval-lute">Medieval Lute</option>
              <option value="gentle-rain">Gentle Rain</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!title}
          className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 mt-4"
        >
          Save Chapter
        </button>
      </div>
    </div>,
    document.body
  );
}
