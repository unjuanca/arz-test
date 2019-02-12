import { IsNotEmpty, IsInt } from 'class-validator';

export class CreateWharehouseDto {

  @IsNotEmpty()
  readonly name: string;

  @IsNotEmpty()
  readonly city: string;

  @IsNotEmpty()
  readonly address: string;

  @IsInt()
  readonly limit: number;
}
