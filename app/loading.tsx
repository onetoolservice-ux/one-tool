import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-[80vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[rgb(117,163,163)]" />
        <p className="text-sm font-medium text-muted/70 animate-pulse">Loading Workspace...</p>
      </div>
    </div>
  );
}
