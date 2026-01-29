import Image from "next/image";
import AuthBox from "@/components/AuthBox";

export default function RegistracijaPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Background image */}
      <Image
        src="/pozadina.png"
        alt="Pčelinjak"
        fill
        priority
        className="object-cover"
      />

      {/* Svetliji overlay za registraciju */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/30" />

      {/* Honey glow efekti */}
      <div className="absolute -top-24 right-[-60px] h-80 w-80 rounded-full bg-yellow-300/30 blur-3xl" />
      <div className="absolute bottom-[-120px] left-[-60px] h-96 w-96 rounded-full bg-orange-400/25 blur-3xl" />

      {/* Forma */}
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-black z-50"
>
        <AuthBox defaultMode="register" />
      </div>

    </main>
  );
}
