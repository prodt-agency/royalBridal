import clsx from "clsx";

const variants = {
  primary:
    "bg-rose-700 text-white hover:bg-rose-800",

  secondary:
    "border border-rose-700 text-rose-700 hover:bg-rose-50",

  outline:
    "border border-gray-300 hover:bg-gray-100",

  ghost:
    "hover:bg-gray-100",

  danger:
    "bg-red-600 text-white hover:bg-red-700",
};

const sizes = {
  sm: "px-3 py-2 text-sm",

  md: "px-5 py-3 text-base",

  lg: "px-7 py-4 text-lg",
};

function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  disabled = false,
  ...props
}) {
  return (
    <button
      disabled={loading || disabled}
      className={clsx(
        "rounded-lg font-medium transition-all duration-300",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}

export default Button;