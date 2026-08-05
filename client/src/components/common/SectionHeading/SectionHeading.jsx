import clsx from "clsx";

function SectionHeading({ eyebrow, title, description, align = "center" }) {
  return <div className={clsx("mb-9 max-w-2xl", align === "center" && "mx-auto text-center")}>
    {eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[.28em] text-[#9b6b35]">{eyebrow}</p>}
    <h2 className="font-serif text-3xl leading-tight text-stone-900 sm:text-4xl">{title}</h2>
    {description && <p className="mt-3 text-sm leading-6 text-stone-600">{description}</p>}
  </div>;
}

export default SectionHeading;
