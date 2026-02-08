
import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) { }

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      console.log("Parsed Value",parsedValue)
      return parsedValue;
    } catch (error) {
      console.log("errorrr", error);
      const issues = error.issues || error.errors || [];
      const message = issues[0]?.message || 'Validation failed';
      throw new BadRequestException(message);
    }
  }
}
