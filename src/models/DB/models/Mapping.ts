import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  PrimaryKey,
} from 'sequelize-typescript';
import Category from './Category';
import ListItem from './ListItem';

@Table({ tableName: 'Mappings', timestamps: true })
export default class Mapping extends Model<Mapping> {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, autoIncrement: true })
  id!: number;

  @ForeignKey(() => Category)
  @Column({ type: DataType.INTEGER, allowNull: false })
  categoryId!: number;

  @ForeignKey(() => ListItem)
  @Column({ type: DataType.INTEGER, allowNull: false })
  mappingId!: number;

  @Column({ type: DataType.STRING(255), allowNull: false })
  value!: string;
}
