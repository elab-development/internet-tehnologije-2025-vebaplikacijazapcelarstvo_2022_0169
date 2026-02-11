import { signAuthToken, verifyAuthToken } from "@/lib/auth";

describe("auth JWT", () => {
    const oldEnv = process.env;

    beforeEach(() => {
        process.env = { ...oldEnv, JWT_SECRET: "test_secret" };
    });

    afterAll(() => {
        process.env = oldEnv;
    });

    test("sign + verify roundtrip", () => {
        const token = signAuthToken({
            sub: "u1",
            email: "u@test.com",
            name: "User",
            role: "PCELAR",
        });

        const claims = verifyAuthToken(token);

        expect(claims).toEqual({
            sub: "u1",
            email: "u@test.com",
            name: "User",
            role: "PCELAR",
        });
    });
});
