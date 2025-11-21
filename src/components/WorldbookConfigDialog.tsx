import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { dbService, Chapter } from '../services/database';
import { X, Upload, FileText, Book, Plus, Play, Edit2, Trash2 } from 'lucide-react';
import { ChapterDialog } from './ChapterDialog';

interface WorldbookConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorldbookConfigDialog({ isOpen, onClose }: WorldbookConfigDialogProps) {
  const [activeTab, setActiveTab] = useState<'config' | 'chapters'>('config');
  const [worldDescription, setWorldDescription] = useState('');
  const [worldDefaultBg, setWorldDefaultBg] = useState('');
  const [worldDefaultMusic, setWorldDefaultMusic] = useState('');

  // Chapter states
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      loadData();
      loadChapters();
    }
  }, [isOpen]);

  async function loadData() {
    try {
      const defaults = await dbService.getWorldDefaults();
      if (defaults) {
        setWorldDescription(defaults.worldDescription || '');
        setWorldDefaultBg(defaults.backgroundImage || defaults.defaultBgImage || '');
        setWorldDefaultMusic(defaults.backgroundMusic || defaults.defaultBgMusic || '');
      }
    } catch (err) {
      console.error('Failed to load world config:', err);
    }
  }

  async function loadChapters() {
    try {
      const chaps = await dbService.getAllChapters();
      chaps.sort((a, b) => a.order - b.order);
      setChapters(chaps);
    } catch (err) {
      console.error('Failed to load chapters:', err);
    }
  }

  async function handleActivateChapter(chapterId: number) {
    try {
      const chapter = chapters.find(ch => ch.id === chapterId);
      if (chapter) {
        await dbService.saveChapter({ ...chapter, isActive: true });
        await loadChapters();
      }
    } catch (err) {
      console.error('Failed to activate chapter:', err);
    }
  }

  async function handleSaveDescription() {
    try {
      await dbService.saveWorldDefaults({
        worldDescription: worldDescription,
        backgroundImage: worldDefaultBg,
        backgroundMusic: worldDefaultMusic
      });
    } catch (err) {
      console.error('Failed to save description:', err);
    }
  }

  async function handleSaveWorldDefaults() {
    try {
      await dbService.saveWorldDefaults({
        worldDescription: worldDescription,
        backgroundImage: worldDefaultBg,
        backgroundMusic: worldDefaultMusic
      });
    } catch (err) {
      console.error('Failed to save defaults:', err);
    }
  }

  async function handleBgImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setWorldDefaultBg(base64);

      await dbService.saveWorldDefaults({
        worldDescription: worldDescription,
        backgroundImage: base64,
        backgroundMusic: worldDefaultMusic
      });
    };
    reader.readAsDataURL(file);
  }

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-xl w-[700px] max-h-[85vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">World Configuration</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'config'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText size={16} />
            Config
          </button>
          <button
            onClick={() => setActiveTab('chapters')}
            className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'chapters'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Book size={16} />
            Chapters ({chapters.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'config' ? (
            <div className="space-y-4">
              {/* World Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  World Description
                </label>
                <textarea
                  value={worldDescription}
                  onChange={(e) => setWorldDescription(e.target.value)}
                  onBlur={handleSaveDescription}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 h-24 resize-none text-sm"
                  placeholder="Describe the world setting, background, theme..."
                />
              </div>

              {/* World Defaults Section */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">World Defaults</h3>

                <div className="space-y-3">
                  {/* Default Background Image */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Default Background Image
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={worldDefaultBg}
                        onChange={(e) => setWorldDefaultBg(e.target.value)}
                        onBlur={handleSaveWorldDefaults}
                        className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-purple-500"
                        placeholder="Image URL or upload..."
                      />
                      <label className="px-3 py-1.5 bg-purple-600 text-white border border-purple-600 rounded-lg hover:bg-purple-700 cursor-pointer flex items-center gap-1">
                        <Upload size={14} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBgImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {worldDefaultBg && (
                      <img
                        src={worldDefaultBg}
                        alt="Preview"
                        className="mt-2 w-full h-32 object-cover rounded-lg"
                      />
                    )}
                  </div>

                  {/* Default Background Music */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Default Background Music
                    </label>
                    <select
                      value={worldDefaultMusic}
                      onChange={async (e) => {
                        const newMusic = e.target.value;
                        setWorldDefaultMusic(newMusic);
                        await dbService.saveWorldDefaults({
                          worldDescription: worldDescription,
                          backgroundImage: worldDefaultBg,
                          backgroundMusic: newMusic
                        });
                      }}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-purple-500"
                    >
                      <option value="">None</option>
                      <option value="peaceful-forest">Peaceful Forest</option>
                      <option value="calm-piano">Calm Piano</option>
                      <option value="ambient-space">Ambient Space</option>
                      <option value="medieval-lute">Medieval Lute</option>
                      <option value="gentle-rain">Gentle Rain</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Used when no chapter is active</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Chapters List */}
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Story Chapters</h3>
                <button
                  onClick={() => {
                    setEditingChapter(undefined);
                    setIsChapterDialogOpen(true);
                  }}
                  className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center gap-1"
                >
                  <Plus size={14} />
                  Add Chapter
                </button>
              </div>

              {chapters.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <p>No chapters yet. Create your first chapter!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        chapter.isActive
                          ? 'border-purple-500 bg-purple-50'
                          : chapter.isCompleted
                          ? 'border-gray-300 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-gray-500">Ch. {chapter.order}</span>
                            <h4 className="font-semibold text-sm text-gray-800 truncate">{chapter.title}</h4>
                            {chapter.isActive && (
                              <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">Active</span>
                            )}
                            {chapter.isCompleted && (
                              <span className="px-2 py-0.5 bg-gray-400 text-white text-xs rounded-full">Done</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">{chapter.description}</p>
                          <div className="flex gap-2 mt-1 text-xs text-gray-500">
                            <span>Trigger: {chapter.triggerType}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          {!chapter.isActive && !chapter.isCompleted && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                handleActivateChapter(chapter.id!);
                              }}
                              className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded cursor-pointer"
                              title="Activate"
                            >
                              <Play size={14} />
                            </div>
                          )}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingChapter(chapter);
                              setIsChapterDialogOpen(true);
                            }}
                            className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </div>
                          <div
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm(`Delete chapter "${chapter.title}"?`)) {
                                await dbService.deleteChapter(chapter.id!);
                                await loadChapters();
                              }
                            }}
                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium"
          >
            Done
          </button>
        </div>
      </div>

      {/* Chapter Dialog */}
      <ChapterDialog
        isOpen={isChapterDialogOpen}
        onClose={() => setIsChapterDialogOpen(false)}
        onSave={loadChapters}
        initialData={editingChapter}
      />
    </div>,
    document.body
  );
}
