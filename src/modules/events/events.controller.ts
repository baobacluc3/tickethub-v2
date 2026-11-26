import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/jwt-payload';
import { UserRole } from '../users/user-role.enum';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateTierDto } from './dto/create-tier.dto';
import { UpdateTierDto } from './dto/update-tier.dto';
import { ListEventsQueryDto } from './dto/list-events-query.dto';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Public()
  @Get()
  list(@Query() query: ListEventsQueryDto) {
    return this.eventsService.listPublicEvents(query);
  }

  @Public()
  @Get(':id')
  getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.getPublicEventById(id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ORGANIZER)
  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateEventDto) {
    return this.eventsService.createEvent(user.id, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ORGANIZER)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.updateEvent(id, user.id, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ORGANIZER)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.eventsService.deleteEvent(id, user.id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ORGANIZER)
  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  publish(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.eventsService.publishEvent(id, user.id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ORGANIZER)
  @Post(':id/unpublish')
  @HttpCode(HttpStatus.OK)
  unpublish(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.eventsService.unpublishEvent(id, user.id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ORGANIZER)
  @Post(':id/tiers')
  createTier(
    @Param('id', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTierDto,
  ) {
    return this.eventsService.createTier(eventId, user.id, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ORGANIZER)
  @Patch(':id/tiers/:tierId')
  updateTier(
    @Param('id', ParseUUIDPipe) eventId: string,
    @Param('tierId', ParseUUIDPipe) tierId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateTierDto,
  ) {
    return this.eventsService.updateTier(eventId, tierId, user.id, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ORGANIZER)
  @Delete(':id/tiers/:tierId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTier(
    @Param('id', ParseUUIDPipe) eventId: string,
    @Param('tierId', ParseUUIDPipe) tierId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.eventsService.deleteTier(eventId, tierId, user.id);
  }
}