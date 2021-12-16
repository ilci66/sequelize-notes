// SUPER MANY TO MANY EXAMPLE
// seemed a little confusing in the docs so copied here to play with it a little

require('dotenv').config();
const { Sequelize, DataTypes, Op, QueryTypes } = require('sequelize');

const { USER, HOST, DATABASE, PASSWORD, POSTGRESQL_PORT } = process.env;
console.log(USER, HOST, DATABASE, PASSWORD, POSTGRESQL_PORT);
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
const Team = sequelize.define('team', { name: DataTypes.STRING });
const Game = sequelize.define('game', { name: DataTypes.STRING });

// // We apply a Super Many-to-Many relationship between Game and Team
const GameTeam = sequelize.define('game_team', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  }
});
Team.belongsToMany(Game, { through: GameTeam });
Game.belongsToMany(Team, { through: GameTeam });
GameTeam.belongsTo(Game);
GameTeam.belongsTo(Team);
Game.hasMany(GameTeam);
Team.hasMany(GameTeam);

// // We apply a Super Many-to-Many relationship between Player and GameTeam
const PlayerGameTeam = sequelize.define('player_game_team', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  }
});
Player.belongsToMany(GameTeam, { through: PlayerGameTeam });
GameTeam.belongsToMany(Player, { through: PlayerGameTeam });
PlayerGameTeam.belongsTo(Player);
PlayerGameTeam.belongsTo(GameTeam);
Player.hasMany(PlayerGameTeam);
GameTeam.hasMany(PlayerGameTeam);

(async () => {
  try {
  //   await sequelize.sync();
  //   await Player.bulkCreate([
  //     { username: 's0me0ne' },
  //     { username: 'empty' },
  //     { username: 'greenhead' },
  //     { username: 'not_spock' },
  //     { username: 'bowl_of_petunias' }
  //   ]);
  //   await Game.bulkCreate([
  //     { name: "The Big Clash" },
  //     { name: 'Winter Showdown' },
  //     { name: 'Summer Beatdown' }
  //   ]);
  //   await Team.bulkCreate([
  //     { name: 'The Martians' },
  //     { name: 'The Earthlings' },
  //     { name: 'The Plutonians' }
  //   ]);

  // //   // Let's start defining which teams were in which games. This can be done
  // //   // in several ways, such as calling `.setTeams` on each game. However, for
  // //   // brevity, we will use direct `create` calls instead, referring directly
  // //   // to the IDs we want. We know that IDs are given in order starting from 1.
  //   await GameTeam.bulkCreate([
  //     { gameId: 1, teamId: 1 },   // this GameTeam will get id 1
  //     { gameId: 1, teamId: 2 },   // this GameTeam will get id 2
  //     { gameId: 2, teamId: 1 },   // this GameTeam will get id 3
  //     { gameId: 2, teamId: 3 },   // this GameTeam will get id 4
  //     { gameId: 3, teamId: 2 },   // this GameTeam will get id 5
  //     { gameId: 3, teamId: 3 }    // this GameTeam will get id 6
  //   ]);

  // //   // Now let's specify players.
  // //   // For brevity, let's do it only for the second game (Winter Showdown).
  // //   // Let's say that that s0me0ne and greenhead played for The Martians, while
  // //   // not_spock and bowl_of_petunias played for The Plutonians:
  //   await PlayerGameTeam.bulkCreate([
  //     // In 'Winter Showdown' (i.e. gameTeamIds 3 and 4):
  //     { playerId: 1, gameTeamId: 3 },   // s0me0ne played for The Martians
  //     { playerId: 3, gameTeamId: 3 },   // greenhead played for The Martians
  //     { playerId: 4, gameTeamId: 4 },   // not_spock played for The Plutonians
  //     { playerId: 5, gameTeamId: 4 }    // bowl_of_petunias played for The Plutonians
  //   ]);

  //   // Now we can make queries!
    const game = await Game.findOne({
      // I added "raw:true" and "nested:true" here, wasn't in the given example
      // raw: true,
      // nest: true,
      where: {
        name: "Winter Showdown"
      },
      include: {
        model: GameTeam,
        include: [
          {
            model: Player,
            through: { attributes: [] } // Hide unwanted `PlayerGameTeam` nested object from results
          },
          Team
        ]
      }
    });

    console.log(`Found game: "${game.name}"`, ", game keys >", Object.keys(game), ", game >" , game);
    console.log("teams =>", Object.keys(game.game_teams))
    // these are for "raw: false":
    // console.log("game.dataValues.game_teams[0].team.dataValues ==>", game.dataValues.game_teams[0].team.dataValues)
    // console.log("Object.keys(game.dataValues.game_teams.dataValues) ==>", Array.isArray(game.dataValues.game_teams.dataValues))

    if(Array.isArray(game.dataValues.game_teams) === true){
      console.log("team array length ==> ",game.dataValues.game_teams.length)
      game.dataValues.game_teams.map(t => {
        // console.log("t.dataValues.players ==>", t.dataValues.players.map(p => p.dataValues.username))
        // console.log("t.dataValues.team.dataValues.name ==>", t.dataValues.team.dataValues.name)
        console.log("team =>",t.dataValues.team.dataValues.name, "with the players =>", t.dataValues.players.map(p => p.dataValues.username))
      })
    }else {
      console.log("it's an object")
    }

    // These will be for raw true
    // console.log("game.game_teams ==>", JSON.stringify(game))
    // WELL WHEN raw:true IS ADDED ONLY ONE TEAM APPEARS

} catch (error) {
   console.log("there is an error ===>", error) 
}
})();


// Wanted to add this, a simple query I did to see it clearly in sql
// SELECT * FROM player_game_teams JOIN game_teams On "player_game_teams"."gameTeamId" = game_teams."gameId" ;
