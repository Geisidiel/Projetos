//const mysql = require('mysql2');
//const { Sequelize } = require('sequelize');
/*const connection = mysql.createConnection({
    host: 'localhost', // ou o IP do seu servidor MySQL
    user: 'root',
    password: '11942400251',
    database: 'FBI'
});*/

const { Sequelize } = require('sequelize');
const sequelize_db = new Sequelize('sgcli', 'root', '11942400251', {
  host: 'localhost',
  dialect: 'mysql', // ou outro dialeto como 'postgres', 'sqlite', etc.
  logging: console.log // Habilita o logging SQL
});

try {
    sequelize_db.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
/* Option 3: Passing parameters separately (other dialects)
const Sequelize = new Sequelize('FBI', 'rot', '11942400251', {
    host: 'localhost',
    dialect: 'mysql'
 });*/
// Conecte-se ao banco de dados
/*connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL.');
});*/ 

module.exports = sequelize_db;
