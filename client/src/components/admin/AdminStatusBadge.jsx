const TONES = {
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
  ACTIVE: "bg-emerald-100 text-emerald-800",
  ARCHIVED: "bg-stone-200 text-stone-700",
  INACTIVE: "bg-stone-200 text-stone-700",
};

export default function AdminStatusBadge({ status }) {
  return (
    <span
      className={`inline-block rounded px-2.5 py-1 text-[11px] leading-4 font-bold whitespace-nowrap ${
        TONES[status] ?? "bg-amber-100 text-amber-800"
      }`}
    >
      {status}
    </span>
  );
}