require('dotenv').config();
const { Sequelize, DataTypes, Op, QueryTypes } = require('sequelize');
const { USER, HOST, DATABASE, PASSWORD, POSTGRESQL_PORT } = process.env;
console.log(USER, HOST, DATABASE, PASSWORD, POSTGRESQL_PORT)


const sequelize = new Sequelize(DATABASE, USER, PASSWORD, { host: 'localhost', dialect: 'postgres'});

const dbConnectionTest = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}
dbConnectionTest();

//   ======> ONE TO ONE <=========== 
const Foo = sequelize.define('foos', {
  id: { 
    type: DataTypes.UUID, 
    defaultValue: Sequelize.UUIDV4, 
    primaryKey: true,
  }
});

const Bar = sequelize.define('bars', {
  id: { 
    type: DataTypes.UUID, 
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  }
});

Foo.hasOne(Bar, {
  foreignKey: {
    name: 'myFooId',
    allowNull: false
  }
  // onDelete: 'RESTRICT',
  // onUpdate: 'RESTRICT'
});
Bar.belongsTo(Foo, {
  foreignKey: {
    name: 'myFooId',
    allowNull: false
  }
});



//   ======> ONE TO MANY <=========== 

const Player = sequelize.define('teams', {
  id: { 
    type: DataTypes.UUID, 
    defaultValue: Sequelize.UUIDV4, 
    primaryKey: true,
  }
});

const Team = sequelize.define('players', {
  id: { 
    type: DataTypes.UUID, 
    defaultValue: Sequelize.UUIDV4, 
    primaryKey: true,
  }
});

Team.hasMany(Player, { foreignKey: 'clubId' });
Player.belongsTo(Team, { foreignKey: 'clubId' });


// ============> MANY TO MANY <==========
const Movie = sequelize.define('movie', { name: DataTypes.STRING });
const Actor = sequelize.define('actor', { name: DataTypes.STRING });

// If you wanna create the junction table manually:
// const ActorMovies = sequelize.define('actors_movies', {
//   // MovieId: {
//   //   type: DataTypes.INTEGER,
//   //   references: {
//   //     model: Movie, // 'Movies' would also work
//   //     key: 'id'
//   //   }
//   // },
//   // ActorId: {
//   //   type: DataTypes.INTEGER,
//   //   references: {
//   //     model: Actor, // 'Actors' would also work
//   //     key: 'id'
//   //   }
//   // }
// });

// looks like the uniqueKey option didn't work for naming
Movie.belongsToMany(Actor, { through: 'actors_movies', unique: false, uniqueKey: 'movie_id' });
Actor.belongsToMany(Movie, { through: 'actors_movies', uniqueKey: "actor_id" }); 



// ===========> BASIC QUERIES <============
// These models are going to be used for queries, one-to-one

const Ship = sequelize.define('ship', {
  name: DataTypes.TEXT,
  crewCapacity: DataTypes.INTEGER,
  amountOfSails: DataTypes.INTEGER
}, { timestamps: false });

const Captain = sequelize.define('captain', {
  name: DataTypes.TEXT,
  skillLevel: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 10 }
  }
}, { timestamps: false });

Captain.hasOne(Ship, 
  //{foreignKey: 'bossId'}
);
Ship.belongsTo(Captain, 
  //{foreignKey: 'bossId'}
);



try {
  setTimeout(async() => {

    // await Movie.sync()
    // await Actor.sync()
    // await ActorMovies.sync()
    // THE SYNC() ETHODS ABOVE DON'T CREATE THE JUNCTION TABLE     
    await sequelize.sync({ alter: { drop : false }});

    // ======> ONE-TO-MANY
    // await Team.sync();
    // await Player.sync();

    // ======> ONE-TO-ONE
    // await Foo.sync();
    // await Bar.sync();
    // the one below worked also for me in this case
    // await sequelize.sync({ alter: { drop : false }});

    // ======> BASIC QUERIES
    
    // Example query, { include: Ship } option gets the associated ship data, cool, keeping this as an example for EAGER LOADING
    // const awesomeCaptain = await Captain.findOne({
    //   where: {
    //     name: "Jack Sparrow"
    //   },
    //   include: Ship
    // });
    // // Now the ship comes with it
    // console.log('Name:', awesomeCaptain.name);
    // console.log('Skill Level:', awesomeCaptain.skillLevel);
    // console.log('Ship Name:', awesomeCaptain.ship.name);
    // console.log('Amount of Sails:', awesomeCaptain.ship.amountOfSails);


    // LAZY LOADING EXAMPLE, get the info when you need it, getShip() method is automatically created by sequelize, how cool is that!
    // const awesomeCaptain = await Captain.findOne({
    //   where: {
    //     name: "Jack Sparrow"
    //   }
    // });
    // // Do stuff with the fetched captain
    // console.log('Name:', awesomeCaptain.name);
    // console.log('Skill Level:', awesomeCaptain.skillLevel);
    // // Now we want information about his ship!
    // const hisShip = await awesomeCaptain.getShip();
    // // Do stuff with the ship
    // console.log('Ship Name:', hisShip.name);
    // console.log('Amount of Sails:', hisShip.amountOfSails);

  }, 1500)
} catch (error) {
  console.log(error)
}


// ====================> IMPORTANT NOTES <========================
// When a Sequelize association is defined between two models, only the source model knows about it.
// So, for example, when using Foo.hasOne(Bar) (so Foo is the source model and Bar is the target model), 
// only Foo knows about the existence of this association. This is why in this case, as shown above, Foo 
// instances gain the methods getBar(), setBar() and createBar(), while on the other hand Bar instances get 
// nothing. So Foo.findOne({ include: Bar }) is possible but Bar.findOne({ include: Foo }) throws an error.
// For this reason the associations appear in pairs (Foo.hasOne(Bar) and Bar.belongsTo(Foo)).

// =================================================================

// A model can be used mutiple times like this, person for email from and to for example or:
// Team.hasOne(Game, { as: 'HomeTeam', foreignKey: 'homeTeamId' });
// Team.hasOne(Game, { as: 'AwayTeam', foreignKey: 'awayTeamId' });
// Game.belongsTo(Team);

// =================================================================

// User.findAll({
//   include: {
//     model: Tool,
//     as: 'Instruments'
//     where: {
//       size: {
//         [Op.ne]: 'small'
//       }
//     }
//   }
// });

// is equal to:

// SELECT
//   `user`.`id`,
//   `user`.`name`,
//   `Instruments`.`id` AS `Instruments.id`,
//   `Instruments`.`name` AS `Instruments.name`,
//   `Instruments`.`size` AS `Instruments.size`,
//   `Instruments`.`userId` AS `Instruments.userId`
// FROM `users` AS `user`
// INNER JOIN `tools` AS `Instruments` ON
//   `user`.`id` = `Instruments`.`userId` AND
//   `Instruments`.`size` != 'small';

// =================================================================

// If you don't want anything from the junction table keep the attributes array empty:
// Foo.findOne({
//   include: {
//     model: Bar,
//     through: {
//       attributes: []
//     }
//   }
// });

// Filter on the juntion table, for the data you wanna get
// User.findAll({
//   include: [{
//     model: Project,
//     through: {
//       where: {
//         // Here, `completed` is a column present at the junction table
//         completed: true
//       }
//     }
//   }]
// });


// ===========================================================

// Adding a where clause to the include automatically makes it required:
// User.findAndCountAll({
//   include: [
//     { model: Profile, where: { active: true } }
//   ],
//   limit: 3
// });


// ================================================================
// Associate a product with many tags

// class Tag extends Model {}
// Tag.init({
//   name: Sequelize.STRING
// }, { sequelize, modelName: 'tag' });

// Product.hasMany(Tag);
// Also works for `belongsToMany`.

// Now we can create a product with multiple tags in the following way:

// Product.create({
//   id: 1,
//   title: 'Chair',
//   As easy as adding the tags here and including down below
//   tags: [
//     { name: 'Alpha'},
//     { name: 'Beta'}
//   ]
// }, {
//   include: [ Tag ]
// })

// Or can be modified like this:
// const Categories = Product.hasMany(Tag, { as: 'categories' });

// Product.create({
//   id: 1,
//   title: 'Chair',
//   categories: [
//     { id: 1, name: 'Alpha' },
//     { id: 2, name: 'Beta' }
//   ]
// }, {
//   include: [{
//     association: Categories,
//     as: 'categories'
//   }]
// })

// ===============================================================

// One of the adhantages of defining the junction table manually

// const User_Profile = sequelize.define('User_Profile', {
//   selfGranted: DataTypes.BOOLEAN
// }, { timestamps: false });
// User.belongsToMany(Profile, { through: User_Profile });
// Profile.belongsToMany(User, { through: User_Profile });

// const amidala = await User.create({ username: 'p4dm3', points: 1000 });
// const queen = await Profile.create({ name: 'Queen' });
// await amidala.addProfile(queen, { through: { selfGranted: false } });
// const result = await User.findOne({
//   where: { username: 'p4dm3' },
//   include: Profile
// });
// console.log(result);


// const amidala = await User.create({ username: 'p4dm3', points: 1000 });
// const queen = await Profile.create({ name: 'Queen' });

//========> Now I can alter the value, could be used for a lot of things
// await amidala.addProfile(queen, { through: { selfGranted: false } });
// const result = await User.findOne({
//   where: { username: 'p4dm3' },
//   include: Profile
// });
// console.log(result);

// ===============================================================

// ====> SUPER MANY-TO-MANY
// User.belongsToMany(Profile, { through: Grant });
// Profile.belongsToMany(User, { through: Grant });
// User.hasMany(Grant);
// Grant.belongsTo(User);
// Profile.hasMany(Grant);
// Grant.belongsTo(Profile);

// This way, we can do all kinds of eager loading:

// User.findAll({ include: Profile });
// Profile.findAll({ include: User });
// User.findAll({ include: Grant });
// Profile.findAll({ include: Grant });
// Grant.findAll({ include: User });
// Grant.findAll({ include: Profile });

// Even a ridiculous deep nested one like this one here:

// User.findAll({
//   include: [
//     {
//       model: Grant,
//       include: [User, Profile]
//     },
//     {
//       model: Profile,
//       include: {
//         model: User,
//         include: {
//           model: Grant,
//           include: [User, Profile]
//         }
//       }
//     }
//   ]
// });

// =====> Aliasing in super many-to-many

// "as" changes the target's alias, aliases are not foreign keys don't forget
// In the database they still get saved as "productId" and "categoryId"

// Product.belongsToMany(Category, { as: 'groups', through: 'product_categories' });
// Category.belongsToMany(Product, { as: 'items', through: 'product_categories' });

// await Product.findAll({ include: Category }); // This doesn't work

// await Product.findAll({ // This works, passing the alias
//   include: {
//     model: Category,
//     as: 'groups'
//   }
// });

// await Product.findAll({ include: 'groups' }); // This also works


// The "foreignKey" defines the key for the source model in the through relation, 
// and "otherKey" defines it for the target model

// with the foreign keys here:
// Product.belongsToMany(Category, {
//   through: 'product_categories',
//   foreignKey: 'objectId', // replaces `productId`, for the source model
//   otherKey: 'typeId' // replaces `categoryId`, for the target model
// });
// Category.belongsToMany(Product, {
//   through: 'product_categories',
//   foreignKey: 'typeId', // replaces `categoryId`, for the source model
//   otherKey: 'objectId' // replaces `productId`, for the target model
// });


// Self referencing with aliases
// Person.belongsToMany(Person, { as: 'Children', through: 'PersonChildren' })


// add joinTableAttributes if you wanna use mixins to do a query and get some attribute from a junction table
// someUser.getProfiles({ joinTableAttributes: ['selfGranted'] });