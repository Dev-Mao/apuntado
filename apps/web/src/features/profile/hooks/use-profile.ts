"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchProfile } from "@/lib";

import type { ProfileState } from "../types";

export function useProfile() {
  const [state, setState] = useState<ProfileState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    fetchProfile().then(
      (result) => {
        if (active) setState(result);
      },
      () => {
        if (active) setState({ status: "failed" });
      },
    );
    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((count) => count + 1);
  }, []);

  return { state, retry };
}
