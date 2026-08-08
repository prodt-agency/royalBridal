import clsx from "clsx";

function Container({ children, className }) {
  return (
    <div
      className={clsx(
        "mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default Container;
