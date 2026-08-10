import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MaxLength
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
  saveTimeline?: boolean;
}
