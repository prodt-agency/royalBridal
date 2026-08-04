import clsx from "clsx";

const colors = {
  primary:
    "bg-rose-100 text-rose-700",

  success:
    "bg-green-100 text-green-700",

  warning:
    "bg-yellow-100 text-yellow-700",

  danger:
    "bg-red-100 text-red-700",
};

function Badge({
  children,
  color = "primary",
}) {
  return (
    <span
      className={clsx(
        "rounded-full px-3 py-1 text-xs font-semibold",
        colors[color]
      )}
    >
      {children}
    </span>
  );
}

export default Badge;