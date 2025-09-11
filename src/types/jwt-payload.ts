export interface JwtPayload {
	id: number;
	email: string;
	name: string;
	role: 'student' | 'teacher' | 'admin' | 'user';
	specializationId?: number | null;
	iat?: number;
	exp?: number;
}
