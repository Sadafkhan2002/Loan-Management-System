
/**
 * Extract a safe, user-friendly error message.
 *
 * Priority:
 * 1. Backend response message
 * 2. Nested backend error message
 * 3. Network connection error
 * 4. Custom fallback message
 */

export const getErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again."
) => {
  const data = error?.response?.data;

  // 1. Display intentional backend messages.
  // Example: "Email already exists."
  if (
    typeof data?.message === "string" &&
    data.message.trim()
  ) {
    return data.message.trim();
  }

  // 2. Handle nested backend error messages.
  // Example: { error: { message: "Invalid credentials." } }
  if (
    typeof data?.error?.message === "string" &&
    data.error.message.trim()
  ) {
    return data.error.message.trim();
  }

  // 3. Handle network or connection failures.
  if (error?.isAxiosError && !error?.response) {
    return "Unable to connect to the server. Please try again.";
  }

  // 4. Handle unexpected errors safely.
  return fallback;
};
