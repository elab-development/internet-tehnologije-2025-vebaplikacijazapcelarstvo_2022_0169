// interface AuthInputProps {
//     label: string;
//     type?: string;
//     value: string;
//     onChange: (value: string) => void;
// }

// export default function AuthInput({
//     label,
//     type = "text",
//     value,
//     onChange,
// }: AuthInputProps) {
//     return (
//         <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//                 {label}
//             </label>
//             <input
//                 type={type}
//                 value={value}
//                 onChange={(e) => onChange(e.target.value)}
//                 className="w-full rounded-md border border-gray-300 px-3 py-2
//                    focus:outline-none focus:ring-2 focus:ring-yellow-400"
//             />
//         </div>
//     );
// }

import { Dispatch, SetStateAction } from "react";

// 1. Dodajemo className u definiciju tipova
interface AuthInputProps {
    label: string;
    value: string;
    onChange: Dispatch<SetStateAction<string>>;
    type?: string;      // Opciono (default je text)
    className?: string; // Opciono polje za stilove
}

export default function AuthInput({
    label,
    value,
    onChange,
    type = "text",
    className = ""
}: AuthInputProps) {
    return (
        <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                // 2. Ovde primenjujemo prosleđeni className i dodajemo text-black
                className={`border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-yellow-500 text-black bg-white ${className}`}
            />
        </div>
    );
}