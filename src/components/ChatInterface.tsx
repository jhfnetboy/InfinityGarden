import { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Send, Menu, MoreVertical, Volume2, VolumeX, LogOut, Settings } from 'lucide-react';
import { aiService } from '../services/ai';
import { dbService as databaseService, Message, Character, Chapter, Group, WorldDefaults } from '../services/database';
import { i18nService, Language } from '../services/i18n';
import ReactMarkdown from 'react-markdown';
import { CharacterGenerator } from './CharacterGenerator';
import { WorldbookPanel } from './WorldbookPanel';
import { WorldbookConfigDialog } from './WorldbookConfigDialog';
import { Sidebar } from './Sidebar';

export function ChatInterface() {
  // const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeCharacterId, setActiveCharacterId] = useState<number | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [worldDefaults, setWorldDefaults] = useState<WorldDefaults>({});
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(i18nService.getLanguage());

  // Monitor language changes
  useEffect(() => {
    const checkLanguage = setInterval(() => {
      const newLang = i18nService.getLanguage();
      setCurrentLanguage(newLang);
    }, 500);
    return () => clearInterval(checkLanguage);
  }, []);

  // Dialog States
  const [isWorldbookOpen, setIsWorldbookOpen] = useState(false);
  const [isWorldConfigOpen, setIsWorldConfigOpen] = useState(false);
  
  // Tachie State
  const [tachieUrl, setTachieUrl] = useState<string | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedCharacterForPortrait, setSelectedCharacterForPortrait] = useState<Character | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const init = async () => {
      await loadCharacters();
      await loadWorldDefaults();
      await loadActiveChapter(); 
    };
    init();
  }, []);

  // Load messages when active character or group changes
  useEffect(() => {
    if (activeCharacterId) {
      setActiveGroup(null);
      loadMessages(activeCharacterId, 'private');
    } else if (activeGroupId) {
      loadActiveGroup(activeGroupId);
      loadMessages(activeGroupId, 'group');
    } else {
      setMessages([]);
      setActiveGroup(null);
    }
  }, [activeCharacterId, activeGroupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    playBackgroundMusic();
  }, [activeChapter, worldDefaults, isMusicPlaying]);

  async function loadWorldDefaults() {
    const defaults = await databaseService.getWorldDefaults();
    if (defaults) {
      setWorldDefaults(defaults);
    }
  }

  async function loadCharacters() {
    const chars = await databaseService.getAllCharacters();
    setCharacters(chars);
    if (chars.length > 0 && !activeCharacterId && !activeGroupId) {
      setActiveCharacterId(chars[0].id!);
    }
  }

  async function loadActiveGroup(groupId: number) {
    const groups = await databaseService.getAllGroups();
    const group = groups.find(g => g.id === groupId);
    setActiveGroup(group || null);
  }

  async function loadMessages(id: number, type: 'private' | 'group') {
    const sessionId = type === 'private' ? `chat_${id}` : `group_${id}`;
    const msgs = await databaseService.getChatHistory(sessionId);
    setMessages(msgs);
    
    if (type === 'private') {
      // Load tachie for this character
      const char = characters.find(c => c.id === id);
      if (char?.tachieUrl) {
        setTachieUrl(char.tachieUrl);
      } else {
        setTachieUrl(null);
      }
    } else {
      setTachieUrl(null);
    }
  }

  async function loadActiveChapter() {
    const active = await databaseService.getActiveChapter();
    setActiveChapter(active || null);
  }

  function getMusicUrl() {
    let musicName = null;
    if (activeChapter?.backgroundMusic) {
      musicName = activeChapter.backgroundMusic;
    } else if (worldDefaults.backgroundMusic) {
      musicName = worldDefaults.backgroundMusic;
    }
    
    if (!musicName) return null;
    
    // If it's already a full URL or data URI, return as-is
    if (musicName.startsWith('http') || musicName.startsWith('data:')) {
      return musicName;
    }
    
    // Convert music name to asset path
    return chrome.runtime.getURL(`assets/music/${musicName}.mp3`);
  }

  function playBackgroundMusic() {
    if (!audioRef.current) return;

    const musicUrl = getMusicUrl();

    if (isMusicPlaying && musicUrl) {
      const currentSrc = audioRef.current.src;
      // Check if src needs update or if it's paused
      if (!currentSrc.includes(encodeURI(musicUrl).replace(/%20/g, ' '))) {
         audioRef.current.src = musicUrl;
         audioRef.current.play().catch(e => {
             console.warn("Music playback failed:", e);
             // Don't auto-disable music on failure, might be interaction policy
         });
      } else if (audioRef.current.paused) {
          audioRef.current.play().catch(() => {});
      }
    } else {
      audioRef.current.pause();
    }
  }

  function toggleMusic() {
    setIsMusicPlaying(!isMusicPlaying);
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function handleSend() {
    if (!input.trim() || (!activeCharacterId && !activeGroupId)) return;

    const sessionId = activeCharacterId ? `chat_${activeCharacterId}` : `group_${activeGroupId}`;
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
      sessionId: sessionId,
      characterId: null, // User
    };

    // Optimistic update
    setMessages(prev => [...prev, userMessage]);
    await databaseService.saveMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      let response: string;
      let responderName: string;
      let responderId: number | undefined;

      if (activeCharacterId) {
        const activeChar = characters.find(c => c.id === activeCharacterId);
        if (!activeChar) throw new Error('Character not found');
        responderName = activeChar.name;
        responderId = activeChar.id;

        const contextMessages = messages.slice(-10);
        response = await aiService.chat({
          messages: contextMessages,
          userMessage: input,
          character: activeChar,
          worldContext: activeChapter?.description || '',
          language: currentLanguage
        });
      } else {
        // Group chat logic
        if (!activeGroup || activeGroup.characterIds.length === 0) throw new Error('Group empty');
        
        // Pick random character from group
        const randomCharId = activeGroup.characterIds[Math.floor(Math.random() * activeGroup.characterIds.length)];
        const activeChar = characters.find(c => c.id === randomCharId);
        if (!activeChar) throw new Error('Character not found');
        
        responderName = activeChar.name;
        responderId = activeChar.id;
        
        const contextMessages = messages.slice(-10);
        response = await aiService.chat({
          messages: contextMessages,
          userMessage: input,
          character: activeChar,
          worldContext: activeChapter?.description || '',
          language: currentLanguage
        });
      }

      const aiMessage: Message = {
        role: 'char',
        content: response,
        timestamp: Date.now(),
        sessionId: sessionId,
        characterId: responderId,
        characterName: responderName
      };

      setMessages(prev => [...prev, aiMessage]);
      await databaseService.saveMessage(aiMessage);
      
      await checkChapterTriggers(input);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'char',
        content: 'Error: Failed to generate response. Please check your API key.',
        timestamp: Date.now(),
        sessionId: sessionId,
        characterName: 'System'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  async function checkChapterTriggers(userInput: string) {
    const chapters = await databaseService.getAllChapters();
    const nextChapter = chapters.find((c: Chapter) => 
      c.triggerType === 'keyword' && 
      c.triggerCondition?.keywords?.some(k => userInput.includes(k)) &&
      c.id !== activeChapter?.id
    );

    if (nextChapter) {
      nextChapter.isActive = true;
      await databaseService.saveChapter(nextChapter);
      setActiveChapter(nextChapter);
      
      const sessionId = activeCharacterId ? `chat_${activeCharacterId}` : `group_${activeGroupId}`;
      const systemMsg: Message = {
        role: 'char',
        content: `*** Chapter Started: ${nextChapter.title} ***\n${nextChapter.description}`,
        timestamp: Date.now(),
        sessionId: sessionId,
        characterName: 'System'
      };
      setMessages(prev => [...prev, systemMsg]);
      await databaseService.saveMessage(systemMsg);
    }
  }
  
  function handleExitWorld() {
    if (confirm('Exit current world and return to world selection?')) {
      // Clear current world state
      databaseService.disconnect();
      // Navigate back to world selector
      window.location.href = chrome.runtime.getURL('index.html');
    }
  }
  
  function handleGeneratePortraitForChar(char: Character) {
    setSelectedCharacterForPortrait(char);
    setIsGeneratorOpen(true);
  }

  const activeCharacter = characters.find(c => c.id === activeCharacterId);
  
  const bgImage = activeChapter?.backgroundImage || 
                  worldDefaults.backgroundImage || 
                  chrome.runtime.getURL('assets/default-background.png');

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative">
      {/* Background Image Layer */}
      <div
        className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-all duration-1000"
        style={{
            backgroundImage: `url("${bgImage}")`,
        }}
      />
      
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[0.5px]" />

      {/* Tachie (Character Portrait) Layer */}
      {tachieUrl && (
        <div className="absolute bottom-0 right-10 z-0 pointer-events-none transition-all duration-500 animate-in fade-in slide-in-from-bottom-10">
          <img 
            src={tachieUrl} 
            alt="Character Portrait" 
            className="max-h-[80vh] w-auto object-contain drop-shadow-2xl"
          />
        </div>
      )}

      {/* Audio Element for Background Music */}
      <audio ref={audioRef} loop />

      {/* Sidebar */}
      <div className={`relative z-10 h-full transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
        <Sidebar
          onSelectChat={(id, type) => {
            if (type === 'private') {
              setActiveCharacterId(id);
              setActiveGroupId(null);
              // Show character avatar if available
              const char = characters.find(c => c.id === id);
              if (char?.avatar) {
                setTachieUrl(char.avatar);
              } else if (char?.tachieUrl) {
                setTachieUrl(char.tachieUrl);
              } else {
                setTachieUrl(null);
              }
            } else {
              setActiveGroupId(id);
              setActiveCharacterId(null);
              setTachieUrl(null);
            }
          }}
          currentChat={{ 
            id: activeCharacterId || activeGroupId, 
            type: activeCharacterId ? 'private' : activeGroupId ? 'group' : '' 
          }}
          onGeneratePortrait={handleGeneratePortraitForChar}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <div className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="font-bold text-gray-800">
                {activeCharacter?.name || activeGroup?.name || 'Select a Character'}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                {activeGroup && (
                  <span className="text-xs text-gray-600">
                    {characters.filter(c => activeGroup.characterIds.includes(c.id!)).map(c => c.name).join(', ')}
                  </span>
                )}
                {activeChapter && (
                  <div className="flex items-center gap-1 text-xs text-gray-700">
                    <span className="font-medium">Chapter:</span>
                    <span className="text-purple-600 font-medium px-2 py-0.5 bg-purple-50 rounded-full border border-purple-100">
                      {activeChapter.title}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExitWorld}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Exit World"
            >
              <LogOut size={18} className="text-gray-600" />
            </button>
            <button
              onClick={toggleMusic}
              className={`p-2 rounded-lg transition-colors ${isMusicPlaying ? 'text-purple-600 hover:bg-purple-50' : 'text-gray-400 hover:bg-gray-100'}`}
              title={isMusicPlaying ? "Pause Music" : "Play Music"}
            >
              {isMusicPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <button
              onClick={() => setIsWorldConfigOpen(true)}
              className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
              title="World Settings"
            >
              <Settings size={20} className="text-purple-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
          {messages.map(msg => (
            <div 
              key={msg.timestamp + msg.content.substring(0, 5)} // Using timestamp + content snippet as key for now, ideally message ID
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[80%] rounded-2xl px-4 py-3 shadow-sm
                  ${msg.role === 'user'
                    ? 'bg-purple-600 text-white rounded-tr-none'
                    : msg.characterName === 'System'
                    ? 'bg-gray-200 text-gray-600 text-center text-sm w-full'
                    : 'bg-white text-gray-800 rounded-tl-none'
                  }
                `}
              >
                {msg.characterName !== 'System' && msg.role !== 'user' && msg.characterName && (
                  <div className="font-semibold text-purple-600 text-sm mb-1">{msg.characterName}</div>
                )}
                {msg.characterName !== 'System' && (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
                {msg.characterName === 'System' && msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 shadow-sm bg-white text-gray-800 rounded-tl-none">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/70 backdrop-blur-md">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={activeCharacter ? `Message ${activeCharacter.name}...` : activeGroup ? `Message ${activeGroup.name}...` : "Select a character to start chatting"}
              disabled={(!activeCharacter && !activeGroupId) || isLoading}
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-400"
            />
            <button
              onClick={handleSend}
              disabled={(!activeCharacter && !activeGroupId) || isLoading || !input.trim()}
              className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Character Generator Dialog */}
      <CharacterGenerator
        isOpen={isGeneratorOpen}
        onClose={() => {
          setIsGeneratorOpen(false);
          setSelectedCharacterForPortrait(null);
        }}
        character={selectedCharacterForPortrait}
        onImageGenerated={(url) => {
          setTachieUrl(url);
          // Update local character state to reflect the new URL immediately
          setCharacters(prev => prev.map(c => 
            c.id === selectedCharacterForPortrait?.id ? { ...c, tachieUrl: url } : c
          ));
          setSelectedCharacterForPortrait(null);
        }}
      />

      {/* Worldbook Panel */}
      <WorldbookPanel
        isOpen={isWorldbookOpen}
        onClose={() => setIsWorldbookOpen(false)}
      />

      <WorldbookConfigDialog
        isOpen={isWorldConfigOpen}
        onClose={() => setIsWorldConfigOpen(false)}
      />
    </div>
  );
}
