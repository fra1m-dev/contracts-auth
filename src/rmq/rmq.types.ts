export interface RmqRootOptions {
	url: string;
	durable?: boolean;
	prefetch?: number;
	mock?: boolean;
}

export interface RmqClientDef {
	name: string | symbol;
	queue: string;
}
