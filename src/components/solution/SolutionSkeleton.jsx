import { SkeletonBlock } from "../SkeletonBlock.jsx";

export const SolutionSkeleton = () => {
  return (
    <div className="mt-4 space-y-4">
      <section className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
        <SkeletonBlock className="h-4 w-28" />
        <div className="mt-3 rounded-2xl border border-green-100 bg-green-50 px-4 py-3.5">
          <SkeletonBlock className="mx-auto h-10 w-44" />
        </div>
      </section>

      <section className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <SkeletonBlock className="h-5 w-36" />
          <SkeletonBlock className="h-7 w-24 rounded-full" />
        </div>

        <div className="mt-4 space-y-4">
          {[1, 2].map((step) => (
            <div key={step} className="relative pl-14">
              <div className="absolute left-0 top-1 h-10 w-10 rounded-full bg-green-100" />
              <div className="rounded-3xl border border-green-100 bg-white px-4 py-4 shadow-sm">
                <SkeletonBlock className="h-16 w-full bg-green-50" />
                <div className="mt-3 space-y-2 rounded-2xl bg-slate-50 px-4 py-3.5">
                  <SkeletonBlock className="h-4 w-11/12" />
                  <SkeletonBlock className="h-4 w-10/12" />
                  <SkeletonBlock className="h-4 w-8/12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
        <div className="border-l-4 border-green-200 pl-4">
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="mt-3 h-10 w-40" />
        </div>
      </section>
    </div>
  );
};
