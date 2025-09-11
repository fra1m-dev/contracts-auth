import { DynamicModule, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';

export interface AuthLibOptions {
	secret: string; // dev/простая схема; позже добавим jwksUri
	audience?: string;
	issuer?: string;
}

@Module({})
export class AuthLibModule {
	static forRoot(opts: AuthLibOptions): DynamicModule {
		return {
			module: AuthLibModule,
			imports: [
				JwtModule.register({
					secret: opts.secret,
					signOptions: { audience: opts.audience, issuer: opts.issuer },
				}),
			],
			providers: [],
			exports: [JwtModule],
		};
	}
}
