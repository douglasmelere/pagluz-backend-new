import { IsString, IsEmail, IsOptional, IsEnum, MinLength, IsNumber, IsArray } from 'class-validator';
import { RepresentativeStatus } from '@prisma/client';

export class CreateRepresentativeDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  cpfCnpj: string;

  @IsString()
  phone: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsOptional()
  @IsNumber()
  commissionRate?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specializations?: string[];

  @IsOptional()
  @IsEnum(RepresentativeStatus)
  status?: RepresentativeStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
