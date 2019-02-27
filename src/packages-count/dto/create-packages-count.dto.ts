import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePackagesCountDto {
  @IsNotEmpty()
  readonly wharehouse: number;

  @IsNotEmpty()
  readonly date: Date;

  @IsNumber()
  readonly count: number;
}
