const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../../filmdizi.db'));
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL'); // Performans/güvenilirlik dengesi

// Kullanıcılar tablosu
db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Medya öğeleri tablosu
db.exec(`CREATE TABLE IF NOT EXISTS media_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  tmdb_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  original_title TEXT,
  poster_path TEXT,
  backdrop_path TEXT,
  overview TEXT,
  release_date TEXT,
  genres TEXT,
  vote_average REAL DEFAULT 0,
  total_seasons INTEGER,
  current_season INTEGER DEFAULT 1,
  current_episode INTEGER DEFAULT 1,
  status TEXT DEFAULT 'watchlist',
  user_rating REAL,
  watch_link TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Mevcut tabloya eksik sütunları ekle (migrate)
const tryAdd = (sql) => { try { db.exec(sql); } catch (_) { } };
tryAdd('ALTER TABLE media_items ADD COLUMN user_id INTEGER REFERENCES users(id)');
tryAdd('ALTER TABLE media_items ADD COLUMN watch_link TEXT');

// Sunucu kapanırken WAL checkpoint yaparak veriyi ana dosyaya kaydet
function gracefulShutdown() {
  try {
    db.pragma('wal_checkpoint(TRUNCATE)');
    db.close();
    console.log('✅ Veritabanı güvenli şekilde kapatıldı.');
  } catch (e) {
    console.error('DB kapatma hatası:', e.message);
  }
}
process.on('exit', gracefulShutdown);
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
process.on('uncaughtException', (err) => {
  console.error('Kritik hata:', err);
  process.exit(1);
});

module.exports = db;
