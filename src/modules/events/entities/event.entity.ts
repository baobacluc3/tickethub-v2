// src/modules/events/entities/event.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/user.entity';
import { EventStatus } from '../enums/event-status.enum';
import { TicketTierEntity } from './ticket-tier.entity';

@Entity({ name: 'events' })
export class EventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organizer_id', type: 'uuid' })
  organizerId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'organizer_id' })
  organizer: UserEntity;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  city: string;

  @Column({ type: 'text', default: EventStatus.DRAFT })
  status: EventStatus;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt: Date;

  @OneToMany(() => TicketTierEntity, (tier) => tier.event)
  tiers: TicketTierEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}