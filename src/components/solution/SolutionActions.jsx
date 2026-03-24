import { memo } from "react";
import { Download, Send } from "lucide-react";

export const SolutionActions = memo(function SolutionActions({
  onExportPdf,
  onShare,
  onCopy
}) {
  return (
    <section className="mt-6 grid grid-cols-3 gap-3">
      <button
        type="button"
        onClick={onExportPdf}
        className="flex items-center justify-center gap-2 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 transition hover:bg-green-100"
      >
        <Download className="h-4 w-4" />
        <span>PDF</span>
      </button>

      <button
        type="button"
        onClick={onShare}
        className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-green-700"
      >
        <Send className="h-4 w-4" />
        <span>Share</span>
      </button>

      <button
        type="button"
        onClick={onCopy}
        className="rounded-2xl border border-green-100 bg-white px-4 py-3 text-sm font-medium text-green-800 transition hover:bg-green-50"
      >
        Copy
      </button>
    </section>
  );
});
