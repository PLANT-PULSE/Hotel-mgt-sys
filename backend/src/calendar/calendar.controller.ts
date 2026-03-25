import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CalendarService } from './calendar.service';

@ApiTags('calendar')
@Controller('calendar')
export class CalendarController {
  constructor(private calendar: CalendarService) {}

  @Get('availability')
  @Public()
  @ApiOperation({ summary: 'Room type availability by date' })
  @ApiQuery({ name: 'roomTypeId', required: true })
  @ApiQuery({ name: 'startDate', required: true, description: 'YYYY-MM-DD or ISO date' })
  @ApiQuery({ name: 'endDate', required: true, description: 'YYYY-MM-DD or ISO date' })
  async getAvailability(
    @Query('roomTypeId') roomTypeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.calendar.getAvailability({
      roomTypeId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
  }
}

