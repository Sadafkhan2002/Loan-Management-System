export const getErrorMessage = (
  error,
  fallback = "Something went wrong.",
) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message;
  }

  if (error?.message && !error?.response) {
    return error.message;
  }

  return fallback;
};