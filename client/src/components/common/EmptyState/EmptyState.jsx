import Button from "@/components/common/Button/Button";

function EmptyState({ title = "Nothing to show yet", description, actionText, onAction }) {
  return <div className="rounded-sm border border-dashed border-stone-300 px-6 py-12 text-center"><h3 className="font-serif text-xl text-stone-800">{title}</h3>{description && <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">{description}</p>}{actionText && <Button className="mt-5" onClick={onAction}>{actionText}</Button>}</div>;
}

export default EmptyState;
