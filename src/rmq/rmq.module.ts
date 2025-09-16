import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ClientsModule, Transport, ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { RmqClientDef, RmqRootOptions } from './rmq.types';

const RMQ_OPTS = Symbol('RMQ_OPTS');

function makeFakeClient(): ClientProxy {
	return {
		send: () => of(null),
		emit: () => of(null),
		connect: async () => undefined,
		close: () => undefined,
	} as any;
}

@Module({})
export class RmqClientsModule {
	static forRoot(opts: RmqRootOptions): DynamicModule {
		return {
			module: RmqClientsModule,
			providers: [{ provide: RMQ_OPTS, useValue: opts }],
			exports: [RMQ_OPTS],
		};
	}

	static forFeature(clients: RmqClientDef[]): DynamicModule {
		// Реальные RMQ-клиенты регистрируем через registerAsync, чтобы получить RMQ_OPTS
		const real = ClientsModule.registerAsync(
			clients.map(({ name, queue }) => ({
				name,
				inject: [RMQ_OPTS],
				useFactory: (opts: RmqRootOptions) => ({
					transport: Transport.RMQ,
					options: {
						urls: [opts.url],
						queue,
						queueOptions: { durable: opts.durable ?? true },
						prefetchCount: opts.prefetch ?? 10,
					},
				}),
			}))
		);

		// Моки для локалки (если mock=true)
		const fakes: Provider[] = clients.map(({ name }) => ({
			provide: name,
			inject: [RMQ_OPTS],
			useFactory: (opts: RmqRootOptions) =>
				opts.mock ? makeFakeClient() : undefined,
		}));

		return {
			module: RmqClientsModule,
			imports: [real],
			providers: fakes,
			exports: [real, ...fakes],
		};
	}
}
