import {
	CallHandler,
	ExecutionContext,
	Injectable,
	Logger,
	NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger = new Logger(LoggingInterceptor.name);

	intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
		const request = ctx.switchToHttp().getRequest();
		const userAgent = request.get?.('user-agent') || '';
		const { ip, method, url } = request;

		this.logger.log(
			`${method} ${url} ${userAgent} ${ip}: ${ctx.getClass().name} ${
				ctx.getHandler().name
			}`
		);

		const started = Date.now();
		return next.handle().pipe(
			tap(() => {
				const res = ctx.switchToHttp().getResponse();
				const { statusCode } = res;
				const contentLength = res.get?.('content-length');
				this.logger.log(
					`${method} ${url} ${statusCode} ${
						contentLength ?? '-'
					} - ${userAgent} ${ip}: ${Date.now() - started}ms`,
					url
				);
			})
		);
	}
}
