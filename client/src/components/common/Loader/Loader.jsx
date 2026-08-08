import clsx from "clsx";

const sizes = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-3",
  lg: "h-10 w-10 border-4",
};

function Loader({ size = "md", className }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={clsx(
        "inline-block animate-spin rounded-full border-stone-200 border-t-[#7d2034]",
        sizes[size],
        className,
      )}
    />
  );
}

export default Loader;
