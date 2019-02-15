import { IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateAlertDto {

  @IsNotEmpty()
  readonly description: string;

  @IsInt()
  readonly wharehouse: number;

}
