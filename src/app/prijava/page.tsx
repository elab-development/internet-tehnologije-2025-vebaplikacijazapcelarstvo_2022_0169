import Image from "next/image";
import AuthBox from "@/components/AuthBox";

export default function PrijavaPage() {
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

      {/* Dark overlay (da forma bude čitljiva) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/40" />

      {/* Honey glow efekat */}
      <div className="absolute -top-20 left-[-60px] h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl" />
      <div className="absolute bottom-[-100px] right-[-60px] h-80 w-80 rounded-full bg-orange-400/25 blur-3xl" />

      {/* Form container */}
      <div className="relative z-10 w-full max-w-md">
        <AuthBox defaultMode="login" />
      </div>

    </main>
  );
}
