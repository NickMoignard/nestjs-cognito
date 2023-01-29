import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { BaseDto } from "../base.dto";

export class ListDevicesDto extends BaseDto {
  @IsNotEmpty()
  @IsNumber()
  limit: number;

  @IsString()
  paginationToken?: string;
}
