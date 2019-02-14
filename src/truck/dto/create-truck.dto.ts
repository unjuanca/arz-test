import { IsNotEmpty, IsInt } from 'class-validator';

export class CreateTruckDto {

  @IsNotEmpty()
  readonly description: string;

  @IsInt()
  readonly wharehouse: number;

}
