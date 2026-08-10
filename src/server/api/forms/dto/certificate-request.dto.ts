import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsArray,
  MaxLength,
  ArrayMaxSize
} from "class-validator";

export class CreateCertificateRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  documentType!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  barangay!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName!: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  mobileNumber!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  purpose!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  attachments?: string[];
}
