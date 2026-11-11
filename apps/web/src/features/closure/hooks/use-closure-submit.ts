"use client";

import { useCallback, useState } from "react";

import { SUBMIT_STATUS } from "../types";

import type { SubmitClosure, SubmitState } from "../types";
import type { ClosureDeclarationDto } from "@apuntado/contracts";

const IDLE_STATE: SubmitState = { status: SUBMIT_STATUS.IDLE };

export function useClosureSubmit(onSubmit: SubmitClosure) {
  const [state, setState] = useState<SubmitState>(IDLE_STATE);

  const submit = useCallback(
    async (declaration: ClosureDeclarationDto) => {
      setState({ status: SUBMIT_STATUS.SUBMITTING });
      try {
        const result = await onSubmit(declaration);
        setState(result.ok ? { status: SUBMIT_STATUS.ACCEPTED } : { status: SUBMIT_STATUS.REJECTED, reason: result.reason });
      } catch {
        setState({ status: SUBMIT_STATUS.FAILED });
      }
    },
    [onSubmit],
  );

  const reset = useCallback(() => {
    setState((prev) => (prev.status === SUBMIT_STATUS.SUBMITTING || prev.status === SUBMIT_STATUS.ACCEPTED ? prev : IDLE_STATE));
  }, []);

  return { state, submit, reset };
}
