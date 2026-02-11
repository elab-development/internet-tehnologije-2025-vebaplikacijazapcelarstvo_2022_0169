import { render, screen, fireEvent } from "@testing-library/react";
import AuthBox from "@/components/AuthBox";

jest.mock("next/navigation", () => ({
    useRouter: () => ({ replace: jest.fn(), refresh: jest.fn() }),
}));

describe("AuthBox - validacija registracije", () => {
    const setup = () => render(<AuthBox defaultMode="register" />);

    const fillForm = (password: string, confirm: string) => {
        const inputs = Array.from(document.querySelectorAll("input")) as HTMLInputElement[];

        const ime = inputs.find(i => i.type === "text")!;
        const prezime = inputs.filter(i => i.type === "text")[1]!;
        const email = inputs.find(i => i.type === "email")!;
        const pass = inputs.find(i => i.type === "password")!;
        const pass2 = inputs.filter(i => i.type === "password")[1]!;

        fireEvent.change(ime, { target: { value: "Pera" } });
        fireEvent.change(prezime, { target: { value: "Peric" } });
        fireEvent.change(email, { target: { value: "pera@test.com" } });
        fireEvent.change(pass, { target: { value: password } });
        fireEvent.change(pass2, { target: { value: confirm } });
    };



    beforeEach(() => {
        jest.spyOn(window, "alert").mockImplementation(() => { });
        (global as any).fetch = jest.fn(() => {
            throw new Error("fetch ne sme da se pozove");
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete (global as any).fetch;
    });

    test("lozinka kraća od 6 karaktera", () => {
        setup();
        fillForm("123", "123");
        fireEvent.click(screen.getByRole("button", { name: "Registruj se" }));

        expect(window.alert).toHaveBeenCalledWith("Lozinka mora imati bar 6 karaktera.");
        expect((global as any).fetch).not.toHaveBeenCalled();
    });

    test("lozinke se ne poklapaju", () => {
        setup();
        fillForm("123456", "654321");
        fireEvent.click(screen.getByRole("button", { name: "Registruj se" }));

        expect(window.alert).toHaveBeenCalledWith("Lozinke se ne poklapaju.");
        expect((global as any).fetch).not.toHaveBeenCalled();
    });
});
