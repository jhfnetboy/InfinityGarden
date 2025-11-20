import { openDB, IDBPDatabase } from 'idb';

export interface VectorDocument {
  id?: number;
  text: string;
  vector: number[];
  metadata?: any;
}

export interface VectorDBOptions {
  dbName?: string;
  objectStore?: string;
  vectorPath?: string;
}

export class VectorDB {
  private db: IDBPDatabase | null = null;
  private dbName: string;
  private objectStoreName: string;
  private vectorPath: string;

  constructor(options: VectorDBOptions = {}) {
    this.dbName = options.dbName || 'VectorDB';
    this.objectStoreName = options.objectStore || 'vectors';
    this.vectorPath = options.vectorPath || 'vector';
  }

  async connect(): Promise<void> {
    this.db = await openDB(this.dbName, 1, {
      upgrade: (db) => {
        if (!db.objectStoreNames.contains(this.objectStoreName)) {
          db.createObjectStore(this.objectStoreName, { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }

  async insert(doc: VectorDocument): Promise<number> {
    if (!this.db) await this.connect();
    return this.db!.put(this.objectStoreName, doc) as Promise<number>;
  }

  async batchInsert(docs: VectorDocument[]): Promise<number[]> {
    if (!this.db) await this.connect();
    const tx = this.db!.transaction(this.objectStoreName, 'readwrite');
    const store = tx.objectStore(this.objectStoreName);
    const ids: number[] = [];
    
    for (const doc of docs) {
      const id = await store.put(doc);
      ids.push(id as number);
    }
    
    await tx.done;
    return ids;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async query(queryVector: number[], options: { limit?: number; threshold?: number } = {}): Promise<VectorDocument[]> {
    if (!this.db) await this.connect();
    
    const limit = options.limit || 10;
    const threshold = options.threshold || 0.0;
    
    const allDocs = await this.db!.getAll(this.objectStoreName);
    
    const results = allDocs
      .map(doc => ({
        ...doc,
        similarity: this.cosineSimilarity(queryVector, doc[this.vectorPath])
      }))
      .filter(doc => doc.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
      
    return results;
  }

  async clear(): Promise<void> {
    if (!this.db) await this.connect();
    await this.db!.clear(this.objectStoreName);
  }
}

export const vectorDB = new VectorDB({ dbName: 'VectorDB_XGarden' });
