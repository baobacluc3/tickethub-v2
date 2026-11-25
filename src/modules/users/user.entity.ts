import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from './user-role.enum';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'citext', unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash: string;

  @Column({ type: 'text', default: UserRole.CUSTOMER })
  role: UserRole;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @CreateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
