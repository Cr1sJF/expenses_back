import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  PrimaryKey,
} from 'sequelize-typescript';
import ConditionGroup from './ConditionGroup';

@Table({ tableName: 'Conditions', timestamps: true })
export default class Condition extends Model<Condition> {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, autoIncrement: true })
  id!: number;

  @ForeignKey(() => ConditionGroup)
  @Column({ type: DataType.INTEGER, allowNull: false })
  groupId!: number;

  @Column({ type: DataType.STRING(255), allowNull: false })
  field!: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  value!: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  logicalOp!: string;
}
