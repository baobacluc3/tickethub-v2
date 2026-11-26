// src/modules/events/entities/ticket-tier.entity.ts
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventEntity } from './event.entity';

@Entity({ name: 'ticket_tiers' })
@Check('CHK_ticket_tiers_price_non_negative', '"price_minor" >= 0')
@Check('CHK_ticket_tiers_capacity_positive', '"capacity" > 0')
@Check(
  'CHK_ticket_tiers_reserved_bounds',
  '"reserved_count" >= 0 AND "reserved_count" <= "capacity"',
)
export class TicketTierEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @ManyToOne(() => EventEntity, (event) => event.tiers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: EventEntity;

  @Column({ type: 'text' })
  name: string;

  @Column({ name: 'price_minor', type: 'int' })
  priceMinor: number;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ name: 'reserved_count', type: 'int', default: 0 })
  reservedCount: number;

  @Column({ name: 'sales_end_at', type: 'timestamptz' })
  salesEndAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}