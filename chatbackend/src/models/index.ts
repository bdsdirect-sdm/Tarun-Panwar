// // index.ts
// import sequelize from '../config/db';
// import User from '../models/User';
// import ChatRoom from '../models/ChatRoom';
// import Message from '../models/Message';

// // Define relationships
// User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
// User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
// ChatRoom.hasMany(Message, { foreignKey: 'chatRoomId' });
// Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
// Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });
// Message.belongsTo(ChatRoom, { foreignKey: 'chatRoomId' });

// const init = async () => {
//   await sequelize.sync({ force: true }); // Sync the models with the database
//   console.log('Database synced!');
// };

// init();
