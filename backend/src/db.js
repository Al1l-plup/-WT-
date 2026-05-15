const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const INITIAL_DB = path.join(__dirname, '../../BD/WeldTeam_DataBase.db');
const VOLUME_DIR = process.env.DB_VOLUME_PATH;

let DB_PATH;
if (process.env.DB_PATH) {
  DB_PATH = process.env.DB_PATH;
} else if (VOLUME_DIR) {
  DB_PATH = path.join(VOLUME_DIR, 'WeldTeam_DataBase.db');
  // первый запуск на volume — копируем начальную БД
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(VOLUME_DIR, { recursive: true });
    fs.copyFileSync(INITIAL_DB, DB_PATH);
    console.log('DB copied to volume:', DB_PATH);
  }
} else {
  DB_PATH = INITIAL_DB;
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = DELETE');
db.pragma('foreign_keys = ON');

module.exports = db;
