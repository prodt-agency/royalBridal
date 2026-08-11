import { ValidationError } from "../utils/app-error.js";
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body ?? {},
    params: req.params ?? {},
    query: req.query ?? {},
  });
  if (!result.success)
    return next(
      new ValidationError(
        "Validation failed.",
        result.error.issues.map(({ path, message }) => ({
          field: path.join("."),
          message,
        })),
      ),
    );
  req.validated = result.data;
  return next();
};
