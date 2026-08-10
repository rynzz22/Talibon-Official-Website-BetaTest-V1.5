import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUrl,
  Min,
  Max,
  MaxLength
} from "class-validator";

export class CreateCheckoutSessionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  itemName!: string;

  @IsNumber()
  @Min(1)
  @Max(1000000)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  successUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  cancelUrl?: string;
}
