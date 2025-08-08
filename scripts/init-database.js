const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// 创建数据库文件
const dbPath = path.join(process.cwd(), 'lib/database/wordle.db');
console.log('创建数据库文件:', dbPath);

const db = new Database(dbPath);

// 读取并执行 schema
const schemaPath = path.join(process.cwd(), 'lib/database/wordle-schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

console.log('执行数据库 schema...');
db.exec(schema);

// 插入一些测试数据
console.log('插入测试数据...');
const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO wordle_predictions 
  (game_number, date, predicted_word, verified_word, status, confidence_score, verification_sources, hints, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// 插入今天的数据
const today = new Date().toISOString().split('T')[0];
const gameNumber = 1511; // 基于 2025-08-08

insertStmt.run(
  gameNumber,
  today,
  'INFUS',
  'INFUS',
  'verified',
  1.0,
  JSON.stringify(['tomsguide']),
  JSON.stringify({
    category: 'daily',
    difficulty: 'confirmed',
    clues: ['Today\'s Wordle answer is INFUS'],
    letterHints: ['Starts with "I"', 'Ends with "S"']
  }),
  new Date().toISOString(),
  new Date().toISOString()
);

// 插入一些历史数据
const historicalData = [
  { game: 1510, date: '2025-08-07', word: 'WORLD', status: 'verified' },
  { game: 1509, date: '2025-08-06', word: 'HELLO', status: 'verified' },
  { game: 1508, date: '2025-08-05', word: 'REACT', status: 'verified' },
  { game: 1507, date: '2025-08-04', word: 'GAMES', status: 'verified' },
  { game: 1506, date: '2025-08-03', word: 'TYPES', status: 'verified' }
];

historicalData.forEach(item => {
  insertStmt.run(
    item.game,
    item.date,
    item.word,
    item.word,
    item.status,
    1.0,
    JSON.stringify(['historical']),
    JSON.stringify({
      category: 'historical',
      difficulty: 'confirmed',
      clues: [`Historical answer #${item.game}`],
      letterHints: []
    }),
    new Date().toISOString(),
    new Date().toISOString()
  );
});

console.log('数据库初始化完成！');
console.log('插入的记录数:', db.prepare('SELECT COUNT(*) as count FROM wordle_predictions').get().count);

db.close();