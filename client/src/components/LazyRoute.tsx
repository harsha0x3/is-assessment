import React, { Suspense } from "react";
import { PageLoader } from "@/components/loaders/PageLoader";

export const LazyRoute = ({
  children,
  fallbackLabel,
}: {
  children: React.ReactNode;
  fallbackLabel?: string;
}) => (
  <Suspense fallback={<PageLoader label={fallbackLabel} />}>
    {children}
  </Suspense>
);
