import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbService, Message, Character } from '../services/database';
import { globalConfigService } from '../services/globalConfig';
import { aiService } from '../services/ai';
import { Sidebar } from './Sidebar';
import { SettingsDialog } from './SettingsDialog';
import ReactMarkdown from 'react-markdown';
import { Send, ArrowLeft, MoreVertical } from 'lucide-react';
import { cn } from '../lib/utils';

export function ChatInterface() {
  const navigate = useNavigate();
  const [currentChat, setCurrentChat] = useState<{ id: number | null; type: 'private' | 'group' | '' }>({ id: null, type: '' });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [participants, setParticipants] = useState<Character[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentChat.id && currentChat.type) {
      loadChatSession();
    }
  }, [currentChat]);

  useEffect(() => {
    const checkConfig = async () => {
      const config = await globalConfigService.getConfig();
      if (!config.apiKey) {
        setIsSettingsOpen(true);
      }
    };
    checkConfig();
  }, []); // This useEffect runs once on mount for config check

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  async function loadChatSession() {
    if (!currentChat.id) return;
    
    const sessionId = `${currentChat.type}_${currentChat.id}`;
    const history = await dbService.getChatHistory(sessionId);
    setMessages(history);

    // Load participants
    if (currentChat.type === 'private') {
      const char = await dbService.getAllCharacters().then(chars => chars.find(c => c.id === currentChat.id));
      if (char) setParticipants([char]);
    } else {
      const group = await dbService.getAllGroups().then(groups => groups.find(g => g.id === currentChat.id));
      if (group) {
        const allChars = await dbService.getAllCharacters();
        const groupChars = allChars.filter(c => group.characterIds.includes(c.id!));
        setParticipants(groupChars);
      }
    }
  }

  async function handleSendMessage() {
    if (!input.trim() || !currentChat.id || isLoading) return;

    const sessionId = `${currentChat.type}_${currentChat.id}`;
    const allChars = await dbService.getAllCharacters();
    const playerChar = allChars.find(c => c.isPlayer);
    
    // User message
    const userMsg: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
      sessionId,
      characterName: playerChar ? playerChar.name : 'User',
      isSent: true
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      await dbService.saveMessage(userMsg);

      // Get context
      const worldbooks = await dbService.getAllWorldbooks();
      const config = await globalConfigService.getConfig();
      const worldDescription = await dbService.getWorldDescription();

      if (!config.apiKey) {
        const errorMsg: Message = {
          role: 'char',
          content: 'Error: API Key not set. Please configure it in settings.',
          timestamp: Date.now(),
          sessionId,
          characterName: 'System'
        };
        setMessages(prev => [...prev, errorMsg]);
        setIsLoading(false);
        return;
      }

      // Generate response
      const prompt = await aiService.constructPrompt(
        participants,
        [...messages, userMsg],
        worldbooks,
        playerChar || null,
        participants.length === 1 ? participants[0].name : null,
        currentChat.type === 'group',
        worldDescription
      );

      const responseText = await aiService.getAIResponse(prompt, config as any);
      
      // Parse response (simple parsing for now)
      let charName = participants[0]?.name || 'AI';
      let content = responseText;
      
      // If response starts with "Name: content", parse it
      const match = responseText.match(/^([^:]+):\s*(.+)$/s);
      if (match) {
        charName = match[1].trim();
        content = match[2].trim();
      }

      const aiMsg: Message = {
        role: 'char',
        content: content,
        timestamp: Date.now(),
        sessionId,
        characterName: charName,
        characterId: participants.find(p => p.name === charName)?.id
      };

      await dbService.saveMessage(aiMsg);
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMsg: Message = {
        role: 'char',
        content: `Error: ${(error as Error).message}`,
        timestamp: Date.now(),
        sessionId,
        characterName: 'System'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar 
        onSelectChat={(id, type) => setCurrentChat({ id, type })} 
        currentChat={currentChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div className="flex-1 flex flex-col h-full min-h-0">
        {/* Chat Header */}
        <div className="h-14 border-b border-gray-200 flex items-center px-4 justify-between bg-white">
          <div className="flex items-center gap-3">
            {currentChat.id ? (
              <>
                <div className="font-semibold text-gray-800">
                  {participants.map(p => p.name).join(', ')}
                </div>
              </>
            ) : (
              <div className="text-gray-500">Select a chat to begin</div>
            )}
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => { dbService.disconnect(); navigate('/'); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
               <ArrowLeft size={20} />
             </button>
             <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
               <MoreVertical size={20} />
             </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
          {!currentChat.id ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <p>Select a character from the sidebar</p>
              <p className="text-sm">or create a new one</p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex w-full",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2 shadow-sm",
                      msg.role === 'user'
                        ? "bg-purple-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                    )}
                  >
                    {msg.role !== 'user' && (
                      <div className="text-xs font-bold mb-1 opacity-70 text-purple-600">
                        {msg.characterName}
                      </div>
                    )}
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    <div className="text-[10px] opacity-50 text-right mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start w-full">
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-gray-200">
          <div className="flex gap-2 items-end bg-gray-50 p-3 rounded-2xl border border-gray-200 focus-within:border-purple-400 focus-within:ring-1 focus-within:ring-purple-400 transition-all shadow-sm">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-48 min-h-[72px] py-2 px-3 text-gray-800 text-base"
              rows={3}
              disabled={!currentChat.id || isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || !currentChat.id || isLoading}
              className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-1"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
      <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
