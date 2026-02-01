interface AuthButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

const baseClass =
  "w-full mt-4 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 px-4 py-2.5 font-semibold text-orange-900 shadow-md transition hover:scale-[1.02] hover:shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";

export default function AuthButton({
  children,
  type = "submit",
  onClick,
  disabled,
}: AuthButtonProps) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={baseClass}>
      {children}
    </button>
  );
}
