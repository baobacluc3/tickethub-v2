import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEntity } from './entities/event.entity';
import { TicketTierEntity } from './entities/ticket-tier.entity';
import { EventStatus } from './enums/event-status.enum';
import { CreateEventDto } from './dto/create-event.dto';


@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventsRepo: Repository<EventEntity>,
    @InjectRepository(TicketTierEntity)
    private readonly tiersRepo: Repository<TicketTierEntity>,
  ) {}

  // --- Helper chống IDOR (dùng chung cho mọi thao tác của Organizer) ---
  private async findOwnedEventOrThrow(
    eventId: string,
    organizerId: string,
  ): Promise<EventEntity> {
   
    const event  = await this.eventsRepo.findOne({
        where:{
            id: eventId,
            organizerId:organizerId
        }
    })
    if(!event) {
        throw new NotFoundException('Event not found')
    }
    return event;
  }

  // --- Event CRUD ---
  async createEvent(organizerId: string, dto: CreateEventDto): Promise<EventEntity> {
    // TODO: Tạo EventEntity với status = EventStatus.DRAFT, organizerId, lưu DB
    const event = this.eventsRepo.create({
        
        ...dto,
        
        status:EventStatus.DRAFT,
        organizerId:organizerId,

    })
    return await this.eventsRepo.save(event);

  }

  async updateEvent(
    eventId: string,
    organizerId: string,
    dto: UpdateEventDto,
  ): Promise<EventEntity> {
    // TODO: Gọi findOwnedEventOrThrow
    // Nếu event.status === EventStatus.CANCELLED -> throw ConflictException
    // Cập nhật các trường hợp lệ và save

    throw new Error('TODO');
  }

  async deleteEvent(eventId: string, organizerId: string): Promise<void> {
    // TODO: Gọi findOwnedEventOrThrow
    // Khuyến nghị: chỉ cho xóa khi ở DRAFT (hoặc chưa có vé nào reserved_count > 0), ngược lại throw 409
    throw new Error('TODO');
  }

  // --- State machine: DRAFT <-> PUBLISHED -> CANCELLED ---
  async publishEvent(eventId: string, organizerId: string): Promise<EventEntity> {
    // TODO: Gọi findOwnedEventOrThrow
    // Chỉ cho phép chuyển từ DRAFT -> PUBLISHED (khác -> throw ConflictException 409)
    // (Gợi ý: có thể kiểm tra event đã có ít nhất 1 ticket tier chưa trước khi publish)
    throw new Error('TODO');
  }

  async unpublishEvent(eventId: string, organizerId: string): Promise<EventEntity> {
    // TODO: Gọi findOwnedEventOrThrow
    // Chỉ cho phép chuyển từ PUBLISHED -> DRAFT (khác -> throw ConflictException 409)
    throw new Error('TODO');
  }

  // --- Ticket Tiers ---
  async createTier(
    eventId: string,
    organizerId: string,
    dto: CreateTierDto,
  ): Promise<TicketTierEntity> {
    // TODO: Gọi findOwnedEventOrThrow
    // Validate salesEndAt <= event.startsAt (nếu sai -> BadRequestException 400)
    // Tạo TicketTierEntity (reservedCount mặc định 0) và save
    throw new Error('TODO');
  }

  async updateTier(
    eventId: string,
    tierId: string,
    organizerId: string,
    dto: UpdateTierDto,
  ): Promise<TicketTierEntity> {
    // TODO: Gọi findOwnedEventOrThrow
    // Tìm tier theo { id: tierId, eventId }, không thấy -> 404
    // Nếu dto.capacity !== undefined && dto.capacity < tier.reservedCount -> throw ConflictException 409
    // Cập nhật và save
    throw new Error('TODO');
  }

  async deleteTier(eventId: string, tierId: string, organizerId: string): Promise<void> {
    // TODO: Gọi findOwnedEventOrThrow, tìm tier
    // Nếu tier.reservedCount > 0 -> throw ConflictException 409
    // Xóa tier
    throw new Error('TODO');
  }

  // --- Public Read ---
  async listPublicEvents(query: ListEventsQueryDto) {
    // TODO: Chỉ trả về status = EventStatus.PUBLISHED, hỗ trợ page & limit (skip/take)
    throw new Error('TODO');
  }

  async getPublicEventById(eventId: string): Promise<EventEntity> {
    // TODO: Tìm theo { id: eventId, status: EventStatus.PUBLISHED } kèm relations: ['tiers']
    // Không thấy -> throw NotFoundException 404
    throw new Error('TODO');
  }
}