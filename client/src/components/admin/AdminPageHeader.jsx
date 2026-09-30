function AdminPageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-serif text-2xl font-bold break-words text-stone-900 sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-xs break-words text-stone-500 sm:text-sm">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          {actions}
        </div>
      )}
    </div>
  );
}

export default AdminPageHeader;