export interface JwtPayload {
	id: number;
	email: string;
	name: string;
	role: string | string[];
	specializationId?: number | null;
	iat?: number;
	exp?: number;
}
