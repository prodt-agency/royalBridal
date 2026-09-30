function AdminPagination({ meta, noun = "items", onPrev, onNext }) {
  if (!meta || !meta.totalPages || meta.totalPages <= 1) return null;

  return (
    <div className="flex flex-col gap-3 border-t border-stone-200 px-4 py-4 text-xs text-stone-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <span>
        Showing Page {meta.page} of {meta.totalPages} ({meta.total} {noun})
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!meta.hasPreviousPage}
          onClick={onPrev}
          className="min-h-11 flex-1 rounded border border-stone-300 px-4 font-medium transition disabled:opacity-40 enabled:hover:bg-stone-50 sm:min-h-0 sm:flex-none sm:px-3 sm:py-1.5"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={!meta.hasNextPage}
          onClick={onNext}
          className="min-h-11 flex-1 rounded border border-stone-300 px-4 font-medium transition disabled:opacity-40 enabled:hover:bg-stone-50 sm:min-h-0 sm:flex-none sm:px-3 sm:py-1.5"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AdminPagination;