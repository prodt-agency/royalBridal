import Button from "../Button/Button";

function EmptyState({
  title,
  description,
  actionText,
  onAction,
}) {
  return (
    <div className="py-20 text-center">
      <h2 className="mb-3 text-2xl font-semibold">
        {title}
      </h2>

      <p className="mx-auto mb-8 max-w-md text-gray-600">
        {description}
      </p>

      {actionText && (
        <Button onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;