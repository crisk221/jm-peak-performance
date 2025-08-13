"use client";

import * as React from "react";

interface LiveRegionProps {
  children?: React.ReactNode;
  priority?: "polite" | "assertive";
  atomic?: boolean;
}

export function LiveRegion({
  children,
  priority = "polite",
  atomic = true,
}: LiveRegionProps) {
  return (
    <div aria-live={priority} aria-atomic={atomic} className="sr-only">
      {children}
    </div>
  );
}

// Hook for announcing messages
export function useAnnouncements() {
  const [announcement, setAnnouncement] = React.useState<string>("");

  const announce = React.useCallback((message: string) => {
    setAnnouncement(message);
    // Clear after a short delay to allow re-announcements
    setTimeout(() => setAnnouncement(""), 100);
  }, []);

  const LiveAnnouncer = React.useCallback(
    () => <LiveRegion>{announcement}</LiveRegion>,
    [announcement],
  );

  return {
    announce,
    LiveAnnouncer,
  };
}
