import { GET, POST } from "@/app/api/pcelinjaci/route";

jest.mock("next/server", () => ({
    NextResponse: {
        json: (data: any, init?: { status?: number }) => ({
            status: init?.status ?? 200,
            async json() {
                return data;
            },
        }),
    },
}));

jest.mock("@/lib/auth", () => ({
    requireAuth: jest.fn(),
}));


const selectMock = jest.fn();
const insertMock = jest.fn();

jest.mock("@/db", () => ({
    db: {
        select: () => ({ from: () => ({ where: selectMock }) }),
        insert: () => ({ values: insertMock }),
    },
}));


jest.mock("@/db/schema", () => ({
    pcelinjaci: { vlasnikId: "vlasnikId" },
}));

jest.mock("drizzle-orm", () => ({
    eq: jest.fn(),
}));

function makeReq(body: any) {
    return {
        json: async () => body,
    } as any;
}

describe("API /pcelinjaci", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("GET vrati podatke za prijavljenog korisnika", async () => {
        const { requireAuth } = await import("@/lib/auth");

        (requireAuth as jest.Mock).mockResolvedValueOnce({
            ok: true,
            user: { id: "u1" },
        });

        selectMock.mockResolvedValueOnce([
            {
                id: "1",
                naziv: "Test",
                adresa: "Ulica",
                geoSirina: "44.1",
                geoDuzina: "20.2",
            },
        ]);

        const res = await GET();

        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data[0].naziv).toBe("Test");
        expect(data[0].geoSirina).toBe(44.1);
    });

    test("POST vrati 201 kad je validan unos", async () => {
        const { requireAuth } = await import("@/lib/auth");

        (requireAuth as jest.Mock).mockResolvedValueOnce({
            ok: true,
            user: { id: "u1" },
        });

        const res = await POST(
            makeReq({
                naziv: "Moj pcelinjak",
                adresa: "Ulica",
            })
        );

        expect(res.status).toBe(201);
        expect(insertMock).toHaveBeenCalled();
    });
});
