import { AlertTriangle } from "lucide-react";
import Button from "./Button";

const ErrorState = ({ message = "Unable to load data", onRetry }) => (
  <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
    <div className="flex items-start gap-3">
      <AlertTriangle className="mt-1 h-5 w-5" />
      <div>
        <h3 className="font-bold">Something went wrong</h3>
        <p className="mt-1 text-sm">{message}</p>
        {onRetry ? <Button className="mt-4" variant="danger" onClick={onRetry}>Retry</Button> : null}
      </div>
    </div>
  </div>
);

export default ErrorState;
