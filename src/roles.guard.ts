import {
	CanActivate,
	ExecutionContext,
	HttpException,
	HttpStatus,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ROLES_KEY } from './roles.decorator';
import { JwtPayload } from './types/jwt-payload';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly reflector: Reflector
	) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<string[]>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()]
		);
		if (!requiredRoles?.length) return true;

		const req = context
			.switchToHttp()
			.getRequest<Request & { user?: JwtPayload }>();
		const authHeader = req.headers.authorization;
		if (!authHeader)
			throw new UnauthorizedException('Нет заголовка авторизации');

		const [bearer, token] = authHeader.split(' ');
		if (bearer !== 'Bearer' || !token)
			throw new UnauthorizedException('Вам необходимо авторизоваться');

		try {
			const user = this.jwtService.verify<JwtPayload>(token);
			(req as any).user = user;
			const userRoles = Array.isArray(user.role) ? user.role : [user.role];
			const ok = userRoles.some((role: string) => requiredRoles.includes(role));
			if (!ok)
				throw new HttpException('Недостаточно прав', HttpStatus.FORBIDDEN);
			return true;
		} catch {
			throw new HttpException('Доступ запрещён', HttpStatus.FORBIDDEN);
		}
	}
}
