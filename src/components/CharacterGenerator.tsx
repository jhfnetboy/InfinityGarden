import { useState, useEffect } from 'react';
import { X, Wand2, Loader2, Image as ImageIcon, Save } from 'lucide-react';
import { jimengService } from '../services/jimeng';
import { dbService as databaseService } from '../services/database';

interface CharacterGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  character: { id?: number; name: string; persona: string; } | null;
  onImageGenerated: (url: string) => void;
}

export function CharacterGenerator({ 
  isOpen, 
  onClose, 
  character,
  onImageGenerated 
}: CharacterGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Update prompt when character changes
  useEffect(() => {
    if (character) {
      const characterName = character.name || '';
      const characterDescription = character.persona || '';
      setPrompt(`A high quality anime style character portrait of ${characterName}, ${characterDescription}, transparent background, PNG format, 4k resolution, detailed face`);
    }
  }, [character]);

  
  const downloadAndConvertImage = async (url: string): Promise<string> => {
    try {
      // Use background script to download image (bypass CORS)
      const response = await chrome.runtime.sendMessage({
        type: 'DOWNLOAD_IMAGE',
        url: url
      });
      
      if (response.success) {
        return response.base64;
      } else {
        throw new Error(response.error || 'Failed to download image');
      }
    } catch (err) {
      console.error('Failed to download and convert image:', err);
      throw new Error('Failed to download image');
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const url = await jimengService.generateImage(prompt, 1024, 1024);
      setGeneratedUrl(url);
    } catch (err: any) {
      setError(err.message || 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  }

  const handleUseImage = async () => {
    if (generatedUrl) {
      try {
        // Download and convert image to base64
        const base64Image = await downloadAndConvertImage(generatedUrl);
        
        // Save to database
        const characters = await databaseService.getAllCharacters();
        const char = character?.id ? characters.find(c => c.id === character.id) : characters.find(c => c.name === character?.name);
        if (char) {
          char.tachieUrl = base64Image; // Save base64 instead of URL
          await databaseService.saveCharacter(char);
          onImageGenerated(base64Image);
          onClose();
        } else {
          setError('Character not found in database');
        }
      } catch (err: any) {
        console.error('Failed to save character portrait:', err);
        setError('Failed to save portrait');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-xl w-[600px] max-h-[80vh] overflow-y-auto p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >  {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-purple-50 to-white">
          <div className="flex items-center gap-2 text-purple-800">
            <Wand2 size={20} />
            <h3 className="font-bold">Generate Portrait</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-purple-100 rounded-full text-gray-500 hover:text-purple-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none h-32 text-sm"
              placeholder="Describe the character appearance..."
            />
          </div>

          {/* Preview Area */}
          <div className="aspect-square rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-3 text-purple-600">
                <Loader2 size={32} className="animate-spin" />
                <span className="text-sm font-medium animate-pulse">Dreaming up your character...</span>
              </div>
            ) : generatedUrl ? (
              <img 
                src={generatedUrl} 
                alt="Generated Portrait" 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <ImageIcon size={32} />
                <span className="text-sm">Preview will appear here</span>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 bg-white/90 flex items-center justify-center p-4 text-center text-red-500 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="flex-1 py-2.5 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Wand2 size={18} />
            Generate
          </button>
          <button
            onClick={handleUseImage}
            disabled={!generatedUrl || isGenerating}
            className="flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Save & Use
          </button>
        </div>
      </div>
    </div>
  );
}
