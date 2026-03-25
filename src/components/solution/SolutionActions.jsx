import { memo } from "react";
import { Download, Send } from "lucide-react";

export const SolutionActions = memo(function SolutionActions({
  onExportPdf,
  onShare,
  onCopy
}) {
  return (
    <section data-pdf-ignore="true" className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-3">
      <button
        type="button"
        onClick={onExportPdf}
        className="flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border border-green-100 bg-green-50 px-3 py-3 text-[13px] font-medium text-green-700 transition hover:bg-green-100 sm:min-h-12 sm:gap-2 sm:px-4 sm:text-sm"
      >
        <Download className="h-4 w-4" />
        <span>PDF</span>
      </button>

      <button
        type="button"
        onClick={onShare}
        className="flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-green-600 px-3 py-3 text-[13px] font-medium text-white transition hover:bg-green-700 sm:min-h-12 sm:gap-2 sm:px-4 sm:text-sm"
      >
        <Send className="h-4 w-4" />
        <span>Share</span>
      </button>

      <button
        type="button"
        onClick={onCopy}
        className="min-h-11 rounded-2xl border border-green-100 bg-white px-3 py-3 text-[13px] font-medium text-green-800 transition hover:bg-green-50 sm:min-h-12 sm:px-4 sm:text-sm"
      >
        Copy
      </button>
    </section>
  );
});
