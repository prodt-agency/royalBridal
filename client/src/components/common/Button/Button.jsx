import clsx from "clsx";
import Loader from "@/components/common/Loader/Loader";

const variants = {
  primary: "bg-[#7d2034] text-white hover:bg-[#5f1727]",
  secondary: "border border-[#7d2034] text-[#7d2034] hover:bg-[#f8eff0]",
  ghost: "text-stone-700 hover:bg-[#f5ede5]",
};
const sizes = {
  sm: "min-h-10 px-4 py-2 text-[11px]",
  md: "min-h-11 px-5 py-3 text-xs",
  lg: "min-h-12 px-6 py-3.5 text-xs",
};

function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  loading = false,
  disabled = false,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={loading || disabled}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-sm font-semibold uppercase tracking-[.14em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader size="sm" />}
      {children}
    </button>
  );
}

export default Button;
