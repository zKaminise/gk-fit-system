import { Module } from '@nestjs/common';
import { ModalityService } from './modality.service';
import { ModalityController } from './modality.controller';

@Module({
  controllers: [ModalityController],
  providers: [ModalityService],
  exports: [ModalityService],
})
export class ModalityModule {}