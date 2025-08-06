// Wordle数据库操作接口
// 支持SQLite数据库的增删改查操作

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export interface WordleRecord {
  id?: number;
  gameNumber: number;
  date: string;
  word: string;
  verified: boolean;
  sources: string[];
  createdAt?: string;
  updatedAt?: string;
  verificationTime?: string;
  confidenceScore: number;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface SourceRecord {
  id?: number;
  gameNumber: number;
  sourceName: string;
  word: string;
  url?: string;
  scrapedAt?: string;
  success: boolean;
  rawData?: string;
}

class WordleDatabase {
  private db: Database.Database;
  private dbPath: string;

  constructor() {
    // 数据库文件路径
    this.dbPath = path.join(process.cwd(), 'data', 'wordle.db');
    
    // 确保数据目录存在
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // 初始化数据库
    this.db = new Database(this.dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase() {
    try {
      // 读取并执行SQL schema
      const schemaPath = path.join(process.cwd(), 'lib', 'database', 'wordle-schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        this.db.exec(schema);
        console.log('✅ 数据库初始化成功');
      } else {
        // 如果schema文件不存在，直接创建表
        this.createTables();
      }
    } catch (error) {
      console.error('❌ 数据库初始化失败:', error);
      this.createTables(); // 备用方案
    }
  }

  private createTables() {
    // 创建基本表结构
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS wordle_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_number INTEGER UNIQUE NOT NULL,
        date TEXT UNIQUE NOT NULL,
        word TEXT NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        sources TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        verification_time DATETIME,
        confidence_score INTEGER DEFAULT 0,
        category TEXT DEFAULT 'General',
        difficulty TEXT DEFAULT 'Medium'
      );

      CREATE TABLE IF NOT EXISTS wordle_sources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_number INTEGER,
        source_name TEXT NOT NULL,
        word TEXT NOT NULL,
        url TEXT,
        scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        success BOOLEAN DEFAULT TRUE,
        raw_data TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_game_number ON wordle_answers(game_number);
      CREATE INDEX IF NOT EXISTS idx_date ON wordle_answers(date);
    `);
  }

  // 获取今日答案
  getTodayAnswer(): WordleRecord | null {
    const today = new Date().toISOString().split('T')[0];
    const stmt = this.db.prepare(`
      SELECT * FROM wordle_answers 
      WHERE date = ? 
      ORDER BY confidence_score DESC, updated_at DESC 
      LIMIT 1
    `);
    
    const row = stmt.get(today) as any;
    return row ? this.mapRowToRecord(row) : null;
  }

  // 根据游戏编号获取答案
  getAnswerByGameNumber(gameNumber: number): WordleRecord | null {
    const stmt = this.db.prepare(`
      SELECT * FROM wordle_answers 
      WHERE game_number = ?
    `);
    
    const row = stmt.get(gameNumber) as any;
    return row ? this.mapRowToRecord(row) : null;
  }

  // 获取历史答案
  getHistoricalAnswers(days: number = 30): WordleRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM wordle_answers 
      WHERE date < date('now') 
      ORDER BY game_number DESC 
      LIMIT ?
    `);
    
    const rows = stmt.all(days) as any[];
    return rows.map(row => this.mapRowToRecord(row));
  }

  // 插入或更新答案
  upsertAnswer(record: Omit<WordleRecord, 'id' | 'createdAt' | 'updatedAt'>): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO wordle_answers 
      (game_number, date, word, verified, sources, confidence_score, category, difficulty, verification_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      record.gameNumber,
      record.date,
      record.word.toUpperCase(),
      record.verified,
      JSON.stringify(record.sources),
      record.confidenceScore,
      record.category,
      record.difficulty,
      record.verificationTime || null
    );

    console.log(`✅ 更新答案: #${record.gameNumber} ${record.word} (${record.verified ? '已验证' : '未验证'})`);
  }

  // 记录数据源抓取结果
  recordSourceData(sourceRecord: Omit<SourceRecord, 'id' | 'scrapedAt'>): void {
    const stmt = this.db.prepare(`
      INSERT INTO wordle_sources 
      (game_number, source_name, word, url, success, raw_data)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      sourceRecord.gameNumber,
      sourceRecord.sourceName,
      sourceRecord.word.toUpperCase(),
      sourceRecord.url || null,
      sourceRecord.success,
      sourceRecord.rawData || null
    );
  }

  // 获取最新的游戏编号
  getLatestGameNumber(): number {
    const stmt = this.db.prepare(`
      SELECT MAX(game_number) as max_number FROM wordle_answers
    `);
    
    const result = stmt.get() as any;
    return result?.max_number || 1500; // 默认起始编号
  }

  // 计算今日应该的游戏编号
  calculateTodayGameNumber(): number {
    const today = new Date();
    const startDate = new Date('2021-06-19'); // Wordle开始日期
    const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff + 1; // 第一天是#1
  }

  // 数据库统计信息
  getStats(): { totalAnswers: number; verifiedAnswers: number; latestGameNumber: number } {
    const totalStmt = this.db.prepare('SELECT COUNT(*) as count FROM wordle_answers');
    const verifiedStmt = this.db.prepare('SELECT COUNT(*) as count FROM wordle_answers WHERE verified = TRUE');
    
    const total = (totalStmt.get() as any).count;
    const verified = (verifiedStmt.get() as any).count;
    const latest = this.getLatestGameNumber();

    return { totalAnswers: total, verifiedAnswers: verified, latestGameNumber: latest };
  }

  // 辅助方法：将数据库行映射为记录对象
  private mapRowToRecord(row: any): WordleRecord {
    return {
      id: row.id,
      gameNumber: row.game_number,
      date: row.date,
      word: row.word,
      verified: Boolean(row.verified),
      sources: row.sources ? JSON.parse(row.sources) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      verificationTime: row.verification_time,
      confidenceScore: row.confidence_score || 0,
      category: row.category || 'General',
      difficulty: row.difficulty || 'Medium'
    };
  }

  // 关闭数据库连接
  close(): void {
    this.db.close();
  }
}

// 单例模式，确保全局只有一个数据库实例
let dbInstance: WordleDatabase | null = null;

export function getWordleDB(): WordleDatabase {
  if (!dbInstance) {
    dbInstance = new WordleDatabase();
  }
  return dbInstance;
}

export default WordleDatabase;