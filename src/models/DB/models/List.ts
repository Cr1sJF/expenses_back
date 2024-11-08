import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  PrimaryKey,
} from 'sequelize-typescript';
import User from './User';

@Table({ tableName: 'Lists', timestamps: true })
export default class List extends Model<List> {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, autoIncrement: true })
  id!: number;

  @Column({ type: DataType.STRING(255), allowNull: false })
  listName!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  owner!: number;
}
