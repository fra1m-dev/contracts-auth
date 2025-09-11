import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const getUserFromExecutionContext = (ctx: ExecutionContext) => {
	const req = ctx.switchToHttp().getRequest();
	return req.user;
};

export const User = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext) => {
		return getUserFromExecutionContext(ctx);
	}
);
