async function connect(){
  if(global.connection && global.connection.state !== 'disconnected')
      return global.connection

  const mysql = require("mysql2/promise")
  const connection = await mysql.createConnection("mysql://customer_185084_cookie:-L0GtuMNR~u4f8I$2f@S@na01-sql.pebblehost.com:3306/customer_185084_cookie")
  global.connection = connection
  return connection
}

async function selectTop15(){
    const conn = await connect()
    const [rows] = await connection.query('SELECT user_id, username, total FROM cookie_score ORDER BY total DESC LIMIT 15')
    return rows
}

async function selectTotalCookies(userId){
    const conn = await connect()
    const [rows] = await connection.query('SELECT total, updated_at FROM cookie_score WHERE user_id = ?', [userId])
    return rows
}

async function updateCookies(userId, userName, quantity){
  await execute('INSERT INTO cookie_score (user_id, username, total) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE total = ?, username = ?, updated_at = NOW()', [userId, userName, quantity, quantity, userName])
}

async function resetCookies(){
  await execute('DELETE FROM cookie_score')
}

async function execute(query, values){
  const conn = await connect()
  await conn.query(query, values)
}

async function existsSanta(userId){
  const conn = await connect()
  const [rows] = await connection.query('SELECT 1 FROM secret_santa WHERE user_id = ?', [userId])
  return rows
}

async function insertSanta(userId, userName){
  await execute('INSERT INTO secret_santa (user_id, username) VALUES (?, ?)', [userId, userName])
}

async function updateWants(userId, userName, wants){
  await execute('UPDATE secret_santa SET wants = ?, username = ? WHERE user_id = ?', [wants, userName, userId])
}

async function updateDontWants(userId, userName, dontWants){
  await execute('UPDATE secret_santa SET dont_wants = ?, username = ? WHERE user_id = ?', [dontWants, userName, userId])
}

async function resetSanta(){
  await execute('DELETE FROM secret_santa')
}

async function drawSanta(){
  const conn = await connect()
  const [rows] = await connection.query('SELECT user_id, username, wants, dont_wants FROM secret_santa')
  return rows
}

module.exports = {
  selectTop15,
  selectTotalCookies,
  updateCookies,
  resetCookies,
  existsSanta,
  insertSanta,
  updateWants,
  updateDontWants,
  resetSanta,
  drawSanta
}