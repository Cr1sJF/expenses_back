import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  PrimaryKey,
} from 'sequelize-typescript';
import List from './List';

@Table({ tableName: 'ListItems', timestamps: true })
export default class ListItem extends Model<ListItem> {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, autoIncrement: true })
  id!: number;

  @ForeignKey(() => List)
  @Column({ type: DataType.INTEGER, allowNull: false })
  listId!: number;

  @Column({ type: DataType.STRING(255), allowNull: false })
  label!: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  value!: string;
}
