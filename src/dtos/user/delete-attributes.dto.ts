import { ArrayNotEmpty, IsArray } from "class-validator";
import { BaseDto } from "../base.dto";

export class DeleteAttributesDto extends BaseDto {
  @IsArray()
  @ArrayNotEmpty()
  attributeList: string[];
}
