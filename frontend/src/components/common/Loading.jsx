import { RefreshCw } from "lucide-react";

const Loading = ({ message = "Loading..." }) => {
  return (
    <div
      className="flex min-h-48 items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        <RefreshCw
          className="mx-auto h-7 w-7 animate-spin text-blue-600"
          aria-hidden="true"
        />

        <p className="mt-3 text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
