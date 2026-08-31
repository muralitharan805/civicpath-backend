import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class IsochroneRequestDto {
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  driveTimeMinutes?: number = 10;

  @IsOptional()
  @IsString()
  mode?: string = 'driving';
}

export class CatchmentRequestDto {
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(25000)
  radiusMeters?: number = 3000;
}
