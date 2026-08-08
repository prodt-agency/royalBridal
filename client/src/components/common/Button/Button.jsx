import clsx from "clsx";
import Loader from "@/components/common/Loader/Loader";

const variants = {
  primary: "bg-[#7d2034] text-white hover:bg-[#5f1727]",
  secondary: "border border-[#7d2034] text-[#7d2034] hover:bg-[#f8eff0]",
  ghost: "text-stone-700 hover:bg-stone-100",
};
const sizes = {
  sm: "px-4 py-2 text-xs",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-3.5 text-sm",
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
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-[.14em] transition disabled:cursor-not-allowed disabled:opacity-60",
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
