import { IsNumber, IsLatitude, IsLongitude, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindByCoordinatesDto {
  @ApiProperty({
    description: 'The latitude coordinate',
    example: 11.061930822443282,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsLatitude()
  latitude: number;

  @ApiProperty({
    description: 'The longitude coordinate',
    example: 77.00057346197408,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsLongitude()
  longitude: number;
}
