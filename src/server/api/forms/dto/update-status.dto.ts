import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  MaxLength,
  ArrayMaxSize
} from "class-validator";

export class UpdateStatusDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  status!: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  remarks?: string;

  @IsOptional()
  @IsBoolean()
  notifyCitizen?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  saveTimeline?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  requirements?: string[];
}
