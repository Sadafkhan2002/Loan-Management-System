const ErrorMessage = ({ message = "Something went wrong.", onRetry }) => {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-5">
      <p className="text-sm font-medium text-red-700">{message}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
