import clsx from "clsx";

function SectionHeading({ eyebrow, title, description, align = "center" }) {
  return (
    <div
      className={clsx(
        "mb-8 max-w-2xl sm:mb-10",
        align === "center" && "mx-auto text-center",
      )}
    >
      {eyebrow && (
        <p className="mb-3 text-xs font-bold uppercase tracking-[.28em] text-[#9b6b35]">
          {eyebrow}
        </p>
      )}
      <h2 className="font-serif text-3xl leading-[1.08] tracking-[-.025em] text-[#24181a] sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-sm leading-6 text-stone-600">{description}</p>
      )}
    </div>
  );
}

export default SectionHeading;
