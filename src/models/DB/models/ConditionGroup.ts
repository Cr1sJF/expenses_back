import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
} from 'sequelize-typescript';
import Rule from './Rule';

@Table({ tableName: 'ConditionGroups', timestamps: true })
export default class ConditionGroup extends Model<ConditionGroup> {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, autoIncrement: true })
  id!: number;

  @ForeignKey(() => Rule)
  @Column({ type: DataType.INTEGER, allowNull: false })
  ruleId!: number;
}
