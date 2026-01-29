interface AuthButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit";
}

export default function AuthButton({
  children,
  type = "submit",
}: AuthButtonProps) {
  return (
    <button
      type={type}
      className="
        w-full
        mt-4
        rounded-xl
        bg-gradient-to-r
        from-yellow-400
        via-amber-400
        to-orange-400
        px-4 py-2.5
        font-semibold
        text-orange-900
        shadow-md
        transition
        hover:scale-[1.02]
        hover:shadow-lg
        active:scale-[0.99]
      "
    >
      {children}
    </button>
  );
}
