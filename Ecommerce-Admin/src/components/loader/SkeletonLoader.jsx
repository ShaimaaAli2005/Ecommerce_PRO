import React from "react";

export const Bone = ({ className = "", style, ...props }) => (
  <div
    className={`relative overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-700 ${className}`}
    style={style}
    {...props}
  >
    <div className="luma-shimmer luma-shimmer-gradient absolute inset-0" />
  </div>
);

export const SkeletonHeader = () => (
  <div className="flex items-center justify-between">
    <div className="space-y-3">
      <Bone className="h-3 w-28" />
      <Bone className="h-8 w-56" />
      <Bone className="h-3 w-72 max-w-[70vw]" />
    </div>

    <Bone className="hidden h-10 w-28 sm:block" />
  </div>
);

export const SkeletonStats = () => (
  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#1F2937]"
      >
        <div className="flex justify-between">
          <Bone className="h-10 w-10 rounded-xl" />
          <Bone className="h-3 w-10" />
        </div>

        <Bone className="mt-5 h-7 w-24" />
        <Bone className="mt-2 h-3 w-32" />
      </div>
    ))}
  </div>
);

export const SkeletonDashboard = () => (
  <div className="space-y-6 p-4 md:p-6">
    <SkeletonHeader />
    <SkeletonStats />

    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_.65fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-[#1F2937]">
        <Bone className="h-5 w-36" />

        <div className="mt-8 flex h-48 items-end gap-3">
          {[40, 65, 50, 82, 58, 72, 48, 88, 62, 78, 52, 70].map(
            (h, i) => (
              <Bone
                key={i}
                className="luma-chart-bar flex-1 rounded-t-lg rounded-b-none"
                style={`{ height: ${h}% }`}
              />
            )
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-[#1F2937]">
        <Bone className="h-5 w-32" />

        <div className="mt-7 space-y-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Bone className="h-10 w-10 rounded-xl" />

              <div className="flex-1 space-y-2">
                <Bone className="h-3 w-28" />
                <Bone className="h-2.5 w-20" />
              </div>

              <Bone className="h-4 w-14" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonUsers = () => (
  <div className="space-y-6 p-4 md:p-6">
    <SkeletonHeader />
    <SkeletonStats />

    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#1F2937]">
      <Bone className="h-10 w-64 max-w-full" />

      <div className="mt-4 space-y-3">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-slate-100 py-4 dark:border-slate-700"
          >
            <Bone className="h-11 w-11 rounded-full" />

            <div className="flex-1 space-y-2">
              <Bone className="h-3.5 w-32" />
              <Bone className="h-2.5 w-40" />
            </div>

            <Bone className="hidden h-3 w-24 sm:block" />
            <Bone className="h-7 w-20 rounded-full" />
            <Bone className="h-8 w-8" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const SkeletonProducts = () => (
  <div className="space-y-6 p-4 md:p-6">
    <SkeletonHeader />

    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-[#1F2937]"
        >
          <Bone className="h-48 w-full rounded-none" />

          <div className="space-y-3 p-4">
            <Bone className="h-4 w-3/4" />
            <Bone className="h-3 w-1/2" />
            <Bone className="h-7 w-20" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonOrders = () => (
  <div className="space-y-6 p-4 md:p-6">
    <SkeletonHeader />
    <SkeletonStats />

    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#1F2937]">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-slate-100 py-4 dark:border-slate-700"
        >
          <Bone className="h-10 w-10 rounded-xl" />

          <div className="flex-1">
            <Bone className="h-3.5 w-28" />
          </div>

          <Bone className="h-7 w-20 rounded-full" />
          <Bone className="h-3 w-16" />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonCategories = () => (
  <div className="space-y-6 p-4 md:p-6">
    <SkeletonHeader />

    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-[#1F2937]"
        >
          <div className="flex items-center gap-4">
            <Bone className="h-12 w-12 rounded-xl" />

            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-32" />
              <Bone className="h-3 w-20" />
            </div>

            <Bone className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonCarts = () => (
  <div className="space-y-6 p-4 md:p-6">
    <SkeletonHeader />

    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#1F2937]">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-slate-100 py-4 dark:border-slate-700"
        >
          <Bone className="h-14 w-14 rounded-xl" />

          <div className="flex-1 space-y-2">
            <Bone className="h-3.5 w-32" />
            <Bone className="h-2.5 w-24" />
          </div>

          <Bone className="h-7 w-16 rounded-full" />
          <Bone className="h-4 w-20" />
        </div>
      ))}
    </div>
  </div>
);

const SkeletonLoader = ({ type = "dashboard" }) => {
  switch (type) {
    case "users":
      return <SkeletonUsers />;

    case "products":
      return <SkeletonProducts />;

    case "orders":
      return <SkeletonOrders />;

    case "categories":
      return <SkeletonCategories />;

    case "carts":
      return <SkeletonCarts />;

    case "dashboard":
    default:
      return <SkeletonDashboard />;
  }
};

export default SkeletonLoader;