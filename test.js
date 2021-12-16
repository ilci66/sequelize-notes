require('dotenv').config();
const { Sequelize, DataTypes, Op, QueryTypes } = require('sequelize');

const { USER, HOST, DATABASE, PASSWORD, POSTGRESQL_PORT } = process.env;
const sequelize = new Sequelize(DATABASE, USER, PASSWORD, { host: 'localhost', dialect: 'postgres', define: { timestamps: false }});

// const sequelize = new Sequelize('sqlite::memory:', {
//   define: { timestamps: false } // Just for less clutter in this example
// });

const dbConnectionTest = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}
dbConnectionTest();

const Player = sequelize.define('player', { username: DataTypes.STRING });


(async () => {
  console.log('sdasd')
    await sequelize.sync();

    await Player.bulkCreate([
      { username: 's0me0ne' },
      { username: 'empty' },
      { username: 'greenhead' },
      { username: 'not_spock' },
      { username: 'bowl_of_petunias' }
    ]);
})();

console.log("this is the end of the code")
// this concludes my test, I was checking the ids given by sequelize by default