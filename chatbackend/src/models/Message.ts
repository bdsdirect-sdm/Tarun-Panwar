// models/Message.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';
import User from './User'; // Import User model
import ChatRoom from './ChatRoom'; // Import ChatRoom model

class Message extends Model {
  public id!: number;
  public content!: string;
  public senderId!: number;
  public receiverId!: number;
  public chatRoomId!: number;
  public createdAt!: Date;
}

Message.init({
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  chatRoomId: {
    type: DataTypes.INTEGER,
    // references: {
    //   model: ChatRoom, // References ChatRoom model
    //   key: 'id',
    // },
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Message',
  tableName: 'messages',
  timestamps: true, // Add createdAt and updatedAt fields
});

// Define associations
// Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
// Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });


export default Message;
