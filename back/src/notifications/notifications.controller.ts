import { Controller,Get, Post, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
constructor(private notificationsService: NotificationsService) {}


@Post('rutinaSubida')
@UseInterceptors(FileInterceptor('file'))
uploadRoutine(@UploadedFile() file, @Body('userId') userId: string, @Body('message') message: string) {
    
    this.notificationsService.sendNotification(userId, message);

    return { message };
}
}
