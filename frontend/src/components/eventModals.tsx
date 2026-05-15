type Props = {
open: boolean;
onClose: () => void;
title: string;
children: React.ReactNode;
};

export default function EventModal({ open, onClose, title, children }: Props) {
if (!open) return null;

return (
<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-lg p-5 rounded-lg">

    <div className="flex justify-between mb-4">
        <h2 className="font-semibold">{title}</h2>

        <button onClick={onClose}>✕</button>
    </div>

    {children}
    </div>
</div>
);
}