import { PartialType } from '@nestjs/swagger';
import { CreateConsumerDto } from './create-consumer.dto';

export class UpdateConsumerDto extends PartialType(CreateConsumerDto) {}

