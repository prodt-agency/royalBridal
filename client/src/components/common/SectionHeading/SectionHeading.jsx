function SectionHeading({
  title,
  subtitle,
  align = "center",
}) {
  return (
    <div
      className={`mb-12 ${
        align === "center"
          ? "text-center"
          : "text-left"
      }`}
    >
      {subtitle && (
        <p className="mb-2 uppercase tracking-[0.25em] text-sm text-rose-700">
          {subtitle}
        </p>
      )}

      <h2 className="text-3xl font-bold md:text-4xl">
        {title}
      </h2>
    </div>
  );
}

export default SectionHeading;