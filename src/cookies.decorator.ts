import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const getCookiesFromExecutionContext = (
	ctx: ExecutionContext,
	key?: string
) => {
	const req = ctx.switchToHttp().getRequest();
	return key ? req.cookies?.[key] : req.cookies;
};

export const Cookies = createParamDecorator(
	(data: string, ctx: ExecutionContext) => {
		return getCookiesFromExecutionContext(ctx, data);
	}
);
