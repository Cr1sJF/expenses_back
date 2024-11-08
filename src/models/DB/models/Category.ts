import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  PrimaryKey,
} from 'sequelize-typescript';
import User from './User';

@Table({ tableName: 'Categories', timestamps: true })
export default class Category extends Model<Category> {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, autoIncrement: true })
  id!: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  categoryId!: number;

  @Column({ type: DataType.STRING(255), allowNull: false })
  name!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  owner!: number;
}
