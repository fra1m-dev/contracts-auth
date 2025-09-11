import {
	ArgumentMetadata,
	Injectable,
	Logger,
	PipeTransform,
	ValidationError,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationException } from './errors/validation.exception';

function extractValidationErrors(
	errors: ValidationError[],
	parent = ''
): string[] {
	const messages: string[] = [];
	for (const error of errors) {
		const path = parent ? `${parent}.${error.property}` : error.property;
		if (error.constraints)
			messages.push(`${path} - ${Object.values(error.constraints).join(', ')}`);
		if (error.children?.length)
			messages.push(...extractValidationErrors(error.children, path));
	}
	return messages;
}

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
	private readonly logger = new Logger(ValidationPipe.name);

	private isPrimitiveType(metatype: any): boolean {
		return [String, Boolean, Number, Array, Object].includes(metatype);
	}

	async transform(value: unknown, metadata: ArgumentMetadata): Promise<any> {
		if (
			!metadata.metatype ||
			this.isPrimitiveType(metadata.metatype) ||
			metadata.type === 'param'
		) {
			return value;
		}
		const metatype = metadata.metatype as new (...args: any[]) => object;
		const obj = plainToInstance(metatype, value as object, {
			enableImplicitConversion: true,
		});

		const errors = await validate(obj, {
			whitelist: false,
			forbidNonWhitelisted: false,
			skipMissingProperties: false,
		});
		if (errors.length) {
			const messages = extractValidationErrors(errors);
			this.logger.error(messages);
			throw new ValidationException(messages);
		}
		return obj;
	}
}
