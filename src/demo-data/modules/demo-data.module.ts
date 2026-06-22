import { Module } from '@nestjs/common';
import { DemoDataBootstrapService } from '../services/demo-data-bootstrap.service';

@Module({
  providers: [DemoDataBootstrapService],
})
export class DemoDataModule {}
