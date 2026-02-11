
const getCookieMock = jest.fn();
const jwtVerifyMock = jest.fn();

jest.mock("next/headers", () => ({
    cookies: async () => ({
        get: getCookieMock,
    }),
}));

jest.mock("jsonwebtoken", () => ({
    verify: (...args: any[]) => jwtVerifyMock(...args),
    sign: jest.fn(),
}));

describe("requireAuth()", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = "test_secret";
    });

    test("401 kad nema korisnika (nema auth cookie)", async () => {

        getCookieMock.mockReturnValueOnce(undefined);

        const auth = await import("@/lib/auth");
        const res = await auth.requireAuth();

        expect(res.ok).toBe(false);
        if (!res.ok) {
            expect(res.status).toBe(401);
            expect(res.message).toBe("Niste prijavljeni");
        }
    });

    test("403 kad uloga nije dozvoljena", async () => {

        getCookieMock.mockReturnValueOnce({ value: "FAKE_TOKEN" });


        jwtVerifyMock.mockReturnValueOnce({
            sub: "u1",
            email: "u@test.com",
            role: "PCELAR",
            name: "User",
        });

        const auth = await import("@/lib/auth");
        const res = await auth.requireAuth(["ADMIN"]);

        expect(res.ok).toBe(false);
        if (!res.ok) {
            expect(res.status).toBe(403);
            expect(res.message).toBe("Nemate pravo pristupa");
        }
    });
});
