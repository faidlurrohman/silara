export const parseError = (form, errors, from_axios = true) => {
  const errs = from_axios ? errors.response?.data?.errors || {} : errors;
  const keys = Object.keys(errs);

  const fields = keys.map((key) => ({
    name: key,
    errors: errs[key],
  }));

  form.setFields(fields);
};
