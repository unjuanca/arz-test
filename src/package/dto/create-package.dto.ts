import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePackageDto {
  @IsNotEmpty()
  readonly address: string;

  @IsNotEmpty()
  readonly description: string;

  @IsOptional()
  readonly wharehouse: number;

  @IsOptional()
  readonly truck: number;

  @IsOptional()
  readonly cost: number;

  @IsOptional()
  readonly deliver_date: Date;
}
