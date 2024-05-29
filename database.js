const mysql = require("mysql2");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

async function getAllUsers() {
  const [rows] = await pool.query(`SELECT * FROM userinfos`);
  return rows;
}

async function getUserInfo(username) {
  const [rows] = await pool.query(
    `SELECT * FROM userinfos WHERE user_name = ?`,
    [username]
  );
  return rows[0];
}

async function getUserInfoByEmail(email) {
  const [rows] = await pool.query(
    `SELECT * FROM userinfos WHERE user_email = ?`,
    [email]
  );
  return rows[0];
}

async function createUser(username, email, gender, birthdate, password) {
  await pool.query(
    `INSERT INTO userinfos (user_name, user_email, user_gender, user_birthdate, user_pass, user_rating, user_status, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [username, email, gender, birthdate, password, "5", "0", "1"]
  );
}

async function updateUserInfo(
  username,
  updatedusername,
  email,
  gender,
  birthdate
) {
  await pool.query(
    `UPDATE userinfos SET user_name = ?, user_email = ?, user_gender = ?, user_birthdate = ? WHERE user_name = ?`,
    [updatedusername, email, gender, birthdate, username]
  );
}

async function updateNativeLanguage(username, nlanguage) {
  await pool.query(
    `UPDATE userinfos SET user_nlanguage = ? WHERE user_name = ?`,
    [nlanguage, username]
  );
}

async function updateLearningLanguage(username, llanguage) {
  await pool.query(
    `UPDATE userinfos SET user_llanguage = ? WHERE user_name = ?`,
    [llanguage, username]
  );
}

async function updateInterest(username, interest) {
  await pool.query(
    `UPDATE userinfos SET user_interest = ? WHERE user_name = ?`,
    [interest, username]
  );
}
async function updateUserRating(username, newRating) {
  await pool.query(`UPDATE userinfos SET user_rating = ? WHERE user_name = ?`, [
    newRating,
    username,
  ]);
}
async function updateUserActiveStatus(username, active) {
  await pool.query(`UPDATE userinfos SET isActive = ? WHERE user_name = ?`, [
    active,
    username,
  ]);
}

async function updatePassword(username, password) {
  await pool.query(`UPDATE userinfos SET password = ? WHERE user_name = ?`, [
    password,
    username,
  ]);
}

async function getAllInterests() {
  const [rows] = await pool.query(`SELECT * FROM interests`);
  return rows;
}

async function getAllLanguages() {
  const [rows] = await pool.query(`SELECT * FROM languages`);
  return rows;
}

async function getAllNotes(created_by) {
  const [rows] = await pool.query(`SELECT * FROM notes where created_by = ?`, [
    created_by,
  ]);
  return rows;
}

async function getNote(note_title) {
  const [rows] = await pool.query(`SELECT * FROM notes where note_title = ?`, [
    note_title,
  ]);
  return rows[0];
}

async function saveNote(note_title, note_content, created_by) {
  await pool.query(
    `INSERT INTO notes (note_title, note_content, created_by) VALUES (?, ?, ?)`,
    [note_title, note_content, created_by]
  );
}

async function deleteNote(note_id) {
  await pool.query(`DELETE FROM notes WHERE note_id = ?`, [note_id]);
}

async function updateNote(note_id, note_title, note_content) {
  await pool.query(
    `UPDATE notes SET note_title = ?, note_content = ? WHERE note_id = ?`,
    [note_title, note_content, note_id]
  );
}
async function newFriends(user_id1, user_id2) {
  await pool.query(`INSERT INTO friends (user_id1, user_id2) VALUES (?, ?)`, [
    user_id1,
    user_id2,
  ]);
  await pool.query(`INSERT INTO friends (user_id1, user_id2) VALUES (?, ?)`, [
    user_id2,
    user_id1,
  ]);
}
async function selectFriends(user_id) {
  const [rows] = await pool.query(`SELECT * FROM friends WHERE user_id1 = ?`, [
    user_id,
  ]);
  return rows;
}

async function getFriendsInfo(user_id) {
  const [rows] = await pool.query(`SELECT * FROM userinfos WHERE user_id = ?`, [
    user_id,
  ]);
  return rows;
}

async function deleteFriend(user_id1, user_id2) {
  await pool.query(`DELETE FROM friends WHERE user_id1 = ? AND user_id2 = ?`, [
    user_id1,
    user_id2,
  ]);
}

module.exports = {
  getAllUsers,
  getUserInfo,
  createUser,
  getUserInfoByEmail,
  getAllInterests,
  getAllLanguages,
  getAllNotes,
  updateUserInfo,
  updateUserRating,
  updateNativeLanguage,
  updateLearningLanguage,
  updateInterest,
  getNote,
  updateUserActiveStatus,
  saveNote,
  deleteNote,
  updateNote,
  newFriends,
  selectFriends,
  getFriendsInfo,
  deleteFriend,
};
