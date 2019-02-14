import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePackageDto {

  @IsNotEmpty()
  readonly address: string;

  @IsNotEmpty()
  readonly description: string;

  @IsOptional()
  readonly wharehouse: number;

}
