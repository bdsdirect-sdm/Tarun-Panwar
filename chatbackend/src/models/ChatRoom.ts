import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import Message from './Message';

class ChatRoom extends Model {
  public id!: number;
  public agencyId!: number;
  public jobSeekerId!: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ChatRoom.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'ChatRoom',
});

// ChatRoom.hasMany(Message, { foreignKey: 'chatRoomId' });
// Message.belongsTo(ChatRoom, { foreignKey: 'chatRoomId' });
export default ChatRoom;
