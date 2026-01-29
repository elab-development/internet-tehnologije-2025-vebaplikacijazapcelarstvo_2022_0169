"use client";

import { useState } from "react";
import AuthInput from "./AuthInput";
import AuthButton from "./AuthButton";
import { useRouter } from "next/navigation";
import type { AuthUser, RegisterDTO, LoginDTO } from "@/lib/types";

export default function AuthBox({
    defaultMode = "login",
}: {
    defaultMode?: "login" | "register";
}) {
    const router = useRouter();
    const [isRegister, setIsRegister] = useState(defaultMode === "register");

    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (isRegister) {
            if (password.length < 6) return alert("Lozinka mora imati bar 6 karaktera.");
            if (password !== confirmPassword) return alert("Lozinke se ne poklapaju.");
        }

        const url = isRegister ? "/api/auth/register" : "/api/auth/login";

        const payload: RegisterDTO | LoginDTO = isRegister
            ? {
                ime: name,
                prezime: lastName,
                email,
                sifra: password,
                uloga: "PCELAR", // kasnije možeš biranje uloge
            }
            : {
                email,
                password, // ✅ backend podržava password (i sifra kao fallback)
            };

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = (await res.json()) as any;

            if (!res.ok) {
                return alert("Greška: " + (data.error || "Neuspešna operacija"));
            }

            if (isRegister) {
                alert("Uspešna registracija! Sada se prijavi.");
                setIsRegister(false);
                setName("");
                setLastName("");
                setPassword("");
                setConfirmPassword("");
                return;
            }

            const user = data as AuthUser;

            // redirect po ulozi
            let target = "/";

            if (user.role === "ADMIN") target = "/admin/aktivnosti";
            if (user.role === "PCELAR") target = "/pcelinjak";
            if (user.role === "POLJOPRIVREDNIK") target = "/aktivnosti";

            router.replace(target);
            router.refresh();
        } catch (err) {
            console.error(err);
            alert("Greška: Server nije dostupan.");
        }
    }

    return (
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-black z-50">
          <div className="absolute -top-12 -right-12 text-8xl rotate-12 drop-shadow-lg">
  🐝
</div>




            <h1 className="text-2xl font-bold text-center text-yellow-600 mb-6">
                {isRegister ? "Registracija" : "Prijava"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                {isRegister && (
                    <>
                        <AuthInput label="Ime" value={name} onChange={setName} />
                        <AuthInput label="Prezime" value={lastName} onChange={setLastName} />
                    </>
                )}

                <AuthInput label="Email" type="email" value={email} onChange={setEmail} />
                <AuthInput label="Lozinka" type="password" value={password} onChange={setPassword} />

                {isRegister && (
                    <AuthInput
                        label="Potvrdi lozinku"
                        type="password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                    />
                )}

                <AuthButton>{isRegister ? "Registruj se" : "Prijavi se"}</AuthButton>
            </form>

            <p className="text-center text-sm mt-4 text-gray-600">
                {isRegister ? "Već imaš nalog?" : "Nemaš nalog?"}{" "}
                <button
                    type="button"
                    onClick={() => setIsRegister((v) => !v)}
                    className="text-yellow-600 font-semibold hover:underline"
                >
                    {isRegister ? "Prijava" : "Registracija"}
                </button>
            </p>
        </div>
    );
}
