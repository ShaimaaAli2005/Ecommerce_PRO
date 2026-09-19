import React from "react";

export const SkeletonLoader = ({ type = "card", count = 1, className = "" }) => {
  const shimmerClass = "animate-shimmer bg-secondary/15 dark:bg-secondary/20 rounded";

  const renderSkeleton = () => {
    switch (type) {
      case "product-card":
        return (
          <div className="p-4 bg-surface-card dark:bg-surface-dark-card border border-border dark:border-border-dark rounded-xl space-y-3">
            <div className={`h-48 w-full rounded-lg ${shimmerClass}`} />
            <div className={`h-4 w-3/4 ${shimmerClass}`} />
            <div className={`h-3 w-1/2 ${shimmerClass}`} />
            <div className="flex justify-between items-center pt-2">
              <div className={`h-5 w-20 ${shimmerClass}`} />
              <div className={`h-8 w-8 rounded-full ${shimmerClass}`} />
            </div>
          </div>
        );

      case "table-row":
        return (
          <div className="flex items-center gap-4 py-3.5 px-4 border-b border-border dark:border-border-dark">
            <div className={`h-4 w-12 ${shimmerClass}`} />
            <div className={`h-4 flex-1 ${shimmerClass}`} />
            <div className={`h-4 w-28 ${shimmerClass}`} />
            <div className={`h-4 w-20 ${shimmerClass}`} />
            <div className={`h-6 w-16 rounded-md ${shimmerClass}`} />
          </div>
        );

      case "dashboard-kpi":
        return (
          <div className="p-5 bg-surface-card dark:bg-surface-dark-card border border-border dark:border-border-dark rounded-xl space-y-3">
            <div className="flex justify-between">
              <div className={`h-4 w-24 ${shimmerClass}`} />
              <div className={`h-8 w-8 rounded-lg ${shimmerClass}`} />
            </div>
            <div className={`h-8 w-32 ${shimmerClass}`} />
            <div className={`h-3 w-20 ${shimmerClass}`} />
          </div>
        );

      default:
        return <div className={`h-12 w-full ${shimmerClass}`} />;
    }
  };

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>{renderSkeleton()}</React.Fragment>
      ))}
    </div>
  );
};

export default SkeletonLoader;