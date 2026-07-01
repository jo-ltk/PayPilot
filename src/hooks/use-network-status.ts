"use client";

import { useEffect, useState } from "react";

type NetworkStatus = "online" | "offline";

/**
 * Tracks browser online/offline state with reconnect detection.
 * @returns Current status and whether the user just came back online
 */
export function useNetworkStatus(): {
  status: NetworkStatus;
  wasOffline: boolean;
  clearReconnect: () => void;
} {
  // Default to "online" so SSR and the first client render match (navigator is unavailable on the server).
  const [status, setStatus] = useState<NetworkStatus>("online");
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const syncStatus = () => {
      setStatus(navigator.onLine ? "online" : "offline");
    };

    syncStatus();

    const handleOnline = () => {
      setStatus("online");
      setWasOffline(true);
    };

    const handleOffline = () => {
      setStatus("offline");
      setWasOffline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const clearReconnect = () => {
    setWasOffline(false);
  };

  return { status, wasOffline, clearReconnect };
}
