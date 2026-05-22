import React from "react";

interface SelectOption {
label: string;
value: string;
}

interface SelectProps
extends React.SelectHTMLAttributes<HTMLSelectElement> {
options?: SelectOption[];
children?: React.ReactNode;
}

export function Select({
options,
children,
className = "",
...props
}: SelectProps) {
return (
<select
    className={`
    w-full rounded-md border border-gray-300
    bg-white px-3 py-2 text-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500
    disabled:cursor-not-allowed disabled:opacity-50
    ${className}
    `}
    {...props}
>
    {options?.map((option) => (
    <option
        key={option.value}
        value={option.value}
    >
        {option.label}
    </option>
    ))}

    {children}
</select>
);
}