import { openDB, DBSchema, IDBPDatabase, deleteDB } from 'idb';
import { vectorDB } from './vector-db';

export interface Character {
  id?: number;
  name: string;
  persona: string;
  greeting: string;
  description?: string;
  avatar?: string;
  isPlayer?: boolean;
  isPublic?: boolean;
  allowEdit?: boolean;
  tachieUrl?: string;
}

export interface Group {
  id?: number;
  name: string;
  characterIds: number[];
}

export interface Worldbook {
  id?: number;
  keywords: string;
  content: string;
}

export interface Message {
  id?: number;
  role: 'user' | 'char';
  content: string;
  timestamp: number;
  characterId?: number | null;
  characterName?: string | null;
  sessionId: string;
  isSent?: boolean;
  isRead?: boolean;
  isThinking?: boolean;
}

export interface Config {
  provider?: 'openai' | 'gemini';
  apiKey: string;
  apiUrl: string;
  model: string;
}

export interface Chapter {
  id?: number;
  order: number;
  title: string;
  description: string;
  backgroundImage?: string;
  backgroundMusic?: string;
  isActive: boolean;
  isCompleted: boolean;
  triggerType: 'time' | 'keyword' | 'ai-judgment';
  triggerCondition?: {
    dialogueCount?: number;
    timeMinutes?: number;
    keywords?: string[];
  };
}

export interface WorldDefaults {
  worldDescription?: string;
  backgroundImage?: string;
  backgroundMusic?: string;
  defaultBgImage?: string;
  defaultBgMusic?: string;
}

interface XGardenDB extends DBSchema {
  characters: {
    key: number;
    value: Character;
    indexes: { 'by-name': string };
  };
  groups: {
    key: number;
    value: Group;
  };
  worldbooks: {
    key: number;
    value: Worldbook;
  };
  messages: {
    key: number;
    value: Message;
    indexes: { 'by-session': string };
  };
  config: {
    key: string;
    value: any;
  };
  chapters: {
    key: number;
    value: Chapter;
  };
  plugin_configs: {
    key: string;
    value: any;
  };
}

const DB_PREFIX = 'XGarden_';

export class DatabaseService {
  private db: IDBPDatabase<XGardenDB> | null = null;
  private currentWorldName: string = '';

  private async ensureConnection(): Promise<void> {
    if (this.db) return;
    
    // Try to recover connection from localStorage
    const lastWorld = localStorage.getItem('lastWorld');
    if (lastWorld) {
      console.log('Restoring connection to world:', lastWorld);
      await this.connect(lastWorld);
    }
    
    if (!this.db) {
      throw new Error('Database not connected');
    }
  }

  async connect(worldName: string): Promise<boolean> {
    try {
      this.db = await openDB<XGardenDB>(`${DB_PREFIX}${worldName}`, 2, {
        upgrade: (db) => {
          // Characters store
          if (!db.objectStoreNames.contains('characters')) {
            const charStore = db.createObjectStore('characters', { keyPath: 'id', autoIncrement: true });
            charStore.createIndex('by-name', 'name');
          }

          // Groups store
          if (!db.objectStoreNames.contains('groups')) {
            db.createObjectStore('groups', { keyPath: 'id', autoIncrement: true });
          }

          // Worldbooks store
          if (!db.objectStoreNames.contains('worldbooks')) {
            db.createObjectStore('worldbooks', { keyPath: 'id', autoIncrement: true });
          }

          // Messages store
          if (!db.objectStoreNames.contains('messages')) {
            const msgStore = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
            msgStore.createIndex('by-session', 'sessionId');
          }

          // Config store
          if (!db.objectStoreNames.contains('config')) {
            db.createObjectStore('config');
          }
          
          // Chapters store (added in version 2)
          if (!db.objectStoreNames.contains('chapters')) {
            db.createObjectStore('chapters', { keyPath: 'id', autoIncrement: true });
          }
          
          // Plugin configs store
          if (!db.objectStoreNames.contains('plugin_configs')) {
            db.createObjectStore('plugin_configs');
          }
        },
      });
      this.currentWorldName = worldName;
      localStorage.setItem('lastWorld', worldName);
      return true;
    } catch (error) {
      console.error('Failed to connect to database:', error);
      return false;
    }
  }

  disconnect() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.currentWorldName = '';
      localStorage.removeItem('lastWorld');
    }
  }

  async getAvailableWorlds(): Promise<string[]> {
    const dbs = await window.indexedDB.databases();
    return dbs
      .map(db => db.name!)
      .filter(name => name && name.startsWith(DB_PREFIX))
      .map(name => name.replace(DB_PREFIX, ''));
  }

  async deleteWorld(name: string): Promise<void> {
    const dbName = `${DB_PREFIX}${name}`;
    // Close connection if it's the current one
    if (this.currentWorldName === name) {
      this.disconnect();
    }
    await deleteDB(dbName);
  }

  // Character Operations
  async getAllCharacters(): Promise<Character[]> {
    await this.ensureConnection();
    return this.db!.getAll('characters');
  }

  async saveCharacter(character: Character): Promise<number> {
    await this.ensureConnection();
    
    // If setting as player, unset others
    if (character.isPlayer) {
      const allChars = await this.getAllCharacters();
      for (const char of allChars) {
        if (char.isPlayer && char.id !== character.id) {
          await this.db!.put('characters', { ...char, isPlayer: false });
        }
      }
    }
    
    return this.db!.put('characters', character);
  }

  async deleteCharacter(id: number): Promise<void> {
    await this.ensureConnection();
    await this.db!.delete('characters', id);
    
    // Also remove from groups
    const groups = await this.getAllGroups();
    for (const group of groups) {
      if (group.characterIds.includes(id)) {
        group.characterIds = group.characterIds.filter(cid => cid !== id);
        await this.saveGroup(group);
      }
    }
  }

  // Group Operations
  async getAllGroups(): Promise<Group[]> {
    await this.ensureConnection();
    return this.db!.getAll('groups');
  }

  async saveGroup(group: Group): Promise<number> {
    await this.ensureConnection();
    return this.db!.put('groups', group);
  }

  async deleteGroup(id: number): Promise<void> {
    await this.ensureConnection();
    await this.db!.delete('groups', id);
  }

  // Worldbook Operations
  async getAllWorldbooks(): Promise<Worldbook[]> {
    await this.ensureConnection();
    return this.db!.getAll('worldbooks');
  }

  async saveWorldbook(worldbook: Worldbook): Promise<number> {
    await this.ensureConnection();
    return this.db!.put('worldbooks', worldbook);
  }

  async deleteWorldbook(id: number): Promise<void> {
    await this.ensureConnection();
    await this.db!.delete('worldbooks', id);
  }

  // Message Operations
  async getChatHistory(sessionId: string): Promise<Message[]> {
    await this.ensureConnection();
    return this.db!.getAllFromIndex('messages', 'by-session', sessionId);
  }

  async saveMessage(message: Message): Promise<number> {
    await this.ensureConnection();
    return this.db!.put('messages', message);
  }

  async deleteChatHistory(sessionId: string): Promise<void> {
    await this.ensureConnection();
    const tx = this.db!.transaction('messages', 'readwrite');
    const index = tx.store.index('by-session');
    let cursor = await index.openCursor(sessionId);
    
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
  }

  // Config Operations
  async getConfig(): Promise<Partial<Config>> {
    await this.ensureConnection();
    const provider = await this.db!.get('config', 'provider');
    const apiKey = await this.db!.get('config', 'apiKey');
    const apiUrl = await this.db!.get('config', 'apiUrl');
    const model = await this.db!.get('config', 'model');
    return { provider, apiKey, apiUrl, model };
  }

  async saveConfig(config: Partial<Config>): Promise<void> {
    await this.ensureConnection();
    if (config.provider !== undefined) await this.db!.put('config', config.provider, 'provider');
    if (config.apiKey !== undefined) await this.db!.put('config', config.apiKey, 'apiKey');
    if (config.apiUrl !== undefined) await this.db!.put('config', config.apiUrl, 'apiUrl');
    if (config.model !== undefined) await this.db!.put('config', config.model, 'model');
  }

  async getWorldDescription(): Promise<string> {
    await this.ensureConnection();
    const description = await this.db!.get('config', 'worldDescription');
    return description || '';
  }

  async saveWorldDescription(description: string): Promise<void> {
    if (!this.db) return;
    await this.db.put('config', description, 'worldDescription');
  }

  async getWorldDefaults(): Promise<WorldDefaults> {
    if (!this.db) return {};
    const worldDescription = await this.db.get('config', 'worldDescription') as string | undefined;
    const backgroundImage = await this.db.get('config', 'worldDefaultBackground') as string | undefined;
    const backgroundMusic = await this.db.get('config', 'worldDefaultMusic') as string | undefined;
    const defaultBgImage = await this.db.get('config', 'defaultBgImage') as string | undefined;
    const defaultBgMusic = await this.db.get('config', 'defaultBgMusic') as string | undefined;
    return { worldDescription, backgroundImage, backgroundMusic, defaultBgImage, defaultBgMusic };
  }

  async saveWorldDefaults(defaults: WorldDefaults): Promise<void> {
    if (!this.db) return;
    if (defaults.worldDescription !== undefined) {
      await this.db.put('config', defaults.worldDescription, 'worldDescription');
    }
    if (defaults.backgroundImage !== undefined) {
      await this.db.put('config', defaults.backgroundImage, 'worldDefaultBackground');
    }
    if (defaults.backgroundMusic !== undefined) {
      await this.db.put('config', defaults.backgroundMusic, 'worldDefaultMusic');
    }
    if (defaults.defaultBgImage !== undefined) {
      await this.db.put('config', defaults.defaultBgImage, 'defaultBgImage');
    }
    if (defaults.defaultBgMusic !== undefined) {
      await this.db.put('config', defaults.defaultBgMusic, 'defaultBgMusic');
    }
  }

  // Chapter Operations
  async getAllChapters(): Promise<Chapter[]> {
    await this.ensureConnection();
    return this.db!.getAll('chapters');
  }

  async saveChapter(chapter: Chapter): Promise<number> {
    await this.ensureConnection();
    // If saving a new active chapter, deactivate all others
    if (chapter.isActive) {
      const allChapters = await this.getAllChapters();
      for (const ch of allChapters) {
        if (ch.id !== chapter.id && ch.isActive) {
          ch.isActive = false;
          await this.db!.put('chapters', ch);
        }
      }
    }
    return this.db!.put('chapters', chapter);
  }

  async deleteChapter(id: number): Promise<void> {
    await this.ensureConnection();
    await this.db!.delete('chapters', id);
  }

  async getActiveChapter(): Promise<Chapter | null> {
    await this.ensureConnection();
    const chapters = await this.getAllChapters();
    return chapters.find(ch => ch.isActive) || null;
  }

  async advanceToNextChapter(): Promise<Chapter | null> {
    await this.ensureConnection();
    const chapters = await this.getAllChapters();
    chapters.sort((a, b) => a.order - b.order);
    
    const activeChapter = chapters.find(ch => ch.isActive);
    if (!activeChapter) return null;
    
    // Mark current as completed
    activeChapter.isActive = false;
    activeChapter.isCompleted = true;
    await this.db!.put('chapters', activeChapter);
    
    // Find next chapter
    const nextChapter = chapters.find(ch => ch.order > activeChapter.order && !ch.isCompleted);
    if (nextChapter) {
      nextChapter.isActive = true;
      await this.db!.put('chapters', nextChapter);
      return nextChapter;
    }
    
    return null;
  }

  // Export/Import
  async exportWorld(worldName?: string): Promise<any> {
    // If worldName is provided and different from current, or if not connected, connect first
    if (worldName && worldName !== this.currentWorldName) {
      await this.connect(worldName);
    } else {
      await this.ensureConnection();
    }

    const characters = await this.getAllCharacters();
    const groups = await this.getAllGroups();
    const worldbooks = await this.getAllWorldbooks();
    const chapters = await this.getAllChapters();
    const config = await this.getConfig();
    const worldDefaults = await this.getWorldDefaults();

    return {
      worldName: this.currentWorldName,
      version: 2,
      characters,
      groups,
      worldbooks,
      chapters,
      config,
      worldDefaults
    };
  }

  async importWorld(data: any, worldName: string): Promise<boolean> {
    console.log('dbService.importWorld called for:', worldName);
    try {
      const success = await this.connect(worldName);
      if (!success || !this.db) {
        console.error('Failed to connect to DB for import');
        return false;
      }

      console.log('Starting transaction...');
      const tx = this.db.transaction(['characters', 'groups', 'worldbooks', 'chapters', 'config'], 'readwrite');

      if (data.characters) {
        console.log('Importing characters:', data.characters.length);
        for (const char of data.characters) {
          // Remove ID to allow auto-increment
          const { id, ...rest } = char;
          await tx.objectStore('characters').put(rest);
        }
      }

      if (data.groups) {
        console.log('Importing groups:', data.groups.length);
        for (const group of data.groups) {
          const { id, ...rest } = group;
          await tx.objectStore('groups').put(rest);
        }
      }

      if (data.worldbooks) {
        console.log('Importing worldbooks:', data.worldbooks.length);
        for (const wb of data.worldbooks) {
          const { id, ...rest } = wb;
          await tx.objectStore('worldbooks').put(rest);
        }
      }

      if (data.chapters) {
        console.log('Importing chapters:', data.chapters.length);
        for (const chapter of data.chapters) {
          const { id, ...rest } = chapter;
          await tx.objectStore('chapters').put(rest);
        }
      }

      if (data.config) {
        console.log('Importing config');
        if (data.config.apiKey) await tx.objectStore('config').put(data.config.apiKey, 'apiKey');
        if (data.config.apiUrl) await tx.objectStore('config').put(data.config.apiUrl, 'apiUrl');
        if (data.config.model) await tx.objectStore('config').put(data.config.model, 'model');
        if (data.config.provider) await tx.objectStore('config').put(data.config.provider, 'provider');
      }

      if (data.worldDefaults) {
        console.log('Importing world defaults');
        if (data.worldDefaults.worldDescription !== undefined) {
          await tx.objectStore('config').put(data.worldDefaults.worldDescription, 'worldDescription');
        }
        if (data.worldDefaults.backgroundImage !== undefined) {
          await tx.objectStore('config').put(data.worldDefaults.backgroundImage, 'worldDefaultBackground');
        }
        if (data.worldDefaults.backgroundMusic !== undefined) {
          await tx.objectStore('config').put(data.worldDefaults.backgroundMusic, 'worldDefaultMusic');
        }
      }

      await tx.done;
      console.log('Transaction committed');

      // Index Worldbooks into VectorDB
      if (data.worldbooks) {
        try {
          console.log('Indexing worldbooks to VectorDB...');
          const vectorDocs = data.worldbooks.map((wb: any) => ({
            text: `${wb.keywords}: ${wb.content}`,
            vector: [], // TODO: Generate real embeddings. For now, we rely on keyword matching or need an embedding service.
            metadata: {
              type: 'worldbook',
              worldName: worldName,
              keywords: wb.keywords
            }
          }));
          
          await vectorDB.batchInsert(vectorDocs);
          console.log('VectorDB indexing complete');
        } catch (vecError) {
          console.error('VectorDB indexing failed (non-fatal):', vecError);
        }
      }

      return true;
    } catch (err) {
      console.error('importWorld fatal error:', err);
      return false;
    }
  }
}

export const dbService = new DatabaseService();
