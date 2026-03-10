import { Request, Response, NextFunction } from "express";

export function createMockReq(overrides: Partial<Request> = {}): Partial<Request> {
	return {
		body: {},
		params: {},
		query: {},
		user: { id: "user-1", role: "owner" },
		cookies: {},
		ip: "127.0.0.1",
		get: jest.fn().mockReturnValue("jest-user-agent"),
		...overrides,
	};
}

export function createMockRes(): Partial<Response> {
	const res: Partial<Response> = {};
	res.status = jest.fn().mockReturnValue(res);
	res.json = jest.fn().mockReturnValue(res);
	res.cookie = jest.fn().mockReturnValue(res);
	res.clearCookie = jest.fn().mockReturnValue(res);
	return res;
}

export function createMockNext(): NextFunction {
	return jest.fn();
}
