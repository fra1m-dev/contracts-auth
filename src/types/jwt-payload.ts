export interface JwtPayload {
	id: string; // для микросервисов лучше string
	email: string;
	name: string;
	role: 'student' | 'teacher' | 'admin' | 'user';
	specializationId?: number | null;
	iat?: number;
	exp?: number;
}
