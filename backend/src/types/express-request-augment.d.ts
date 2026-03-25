declare global {
	namespace Express {
		interface Request {
			connectionId?: string;
			cookies?: Record<string, string | undefined>;
		}
	}
}

export {};
