// const con = require(".db_connect");

// async function createTable(){
//     let sql = `CREATE TABLE IF NOT EXISTS songs(
//         song_id INT NOT NULL AUTO_INCREMENT, 
//         song_uri VARCHAR(30) NOT NULL UNIQUE, 
//         CONSTRAINT song_pk PRIMARY KEY(song_id)
//     )`;
//     await con.query(sql);
// }

// createTable();

// let getSongUris = async () => {
//     const sql = `SELECT song_uri FROM songs`;
//     return await con.query(sql);
//   };

// async function songExists(uri){
//     const sql = `SELECT * FROM songs WHERE song_uri = "${uri}"`;
//     let u = await con.query(sql); 
//     console.log(u); 
//     return u; 
// }

// async function getSong(uri) {
//     const user = await songExists(uri); 
//     if(!songExists[0]) throw Error('Song not found'); 
//     return song[0];
// }

// async function deleteSingle(uri){
//     const sql = `DELETE FROM songs 
//     WHERE song_uri = ${uri}
//     `;
//     await con.query(sql); 
// }

// async function deleteList(uri_list){ //uri_list is an array of uris 
//     const uriList = uris.map(uri => `"${uri}"`).join(", "); // Convert URIs to a comma-separated string
//     const sql = `DELETE FROM songs 
//     WHERE song_uri IN (${uriList})`;
//     await con.query(sql);
// }

// async function addSingle(uri){
//     const u = songExists(uri); 
//     if(u.length>0) throw error('Song already in database');

//     const sql = `INSERT INTO songs (song_uri) 
//     VALUES ("${uri}"
//     )`;
//     const insert = await con.query(sql); 
//     const newSong = await getSong(uri); 
//     return newSong[0];
// }

// async function addList(uri_list){ //passing list of uris 
//     const valueStrings = uris.map(uri => `("${uri}")`).join(", ");

//     //ignore ignores duplicate songs 
//     const sql = `INSERT IGNORE INTO songs (song_uri)
//                  VALUES ${valueStrings}`;
  
//     await con.query(sql);
// }

// module.exports = {createTable, getSongUris, songExists, getSong, deleteList, deleteSingle, addSingle, addList};