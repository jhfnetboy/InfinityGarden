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
      this.db = await openDB<XGardenDB>(`${DB_PREFIX}${worldName}`, 1, {
        upgrade(db) {
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
    await this.ensureConnection();
    await this.db!.put('config', description, 'worldDescription');
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
    const config = await this.getConfig();
    
    return {
      worldName: this.currentWorldName,
      version: 1,
      characters,
      groups,
      worldbooks,
      config
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
      const tx = this.db.transaction(['characters', 'groups', 'worldbooks', 'config'], 'readwrite');
      
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
      
      if (data.config) {
        console.log('Importing config');
        if (data.config.apiKey) await tx.objectStore('config').put(data.config.apiKey, 'apiKey');
        if (data.config.apiUrl) await tx.objectStore('config').put(data.config.apiUrl, 'apiUrl');
        if (data.config.model) await tx.objectStore('config').put(data.config.model, 'model');
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
