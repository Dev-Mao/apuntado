"use client";

import { useCallback, useState } from "react";

import { SUBMIT_STATUS } from "../types";

import type { ClosureDraft, ClosureResponse, SubmitState } from "../types";

const IDLE_STATE: SubmitState = { status: SUBMIT_STATUS.IDLE };

export function useClosureSubmit(onSubmit: (draft: ClosureDraft) => Promise<ClosureResponse>) {
  const [state, setState] = useState<SubmitState>(IDLE_STATE);

  const submit = useCallback(
    async (draft: ClosureDraft) => {
      setState({ status: SUBMIT_STATUS.SUBMITTING });
      const response = await onSubmit(draft);
      setState(
        response.status === "ACCEPTED"
          ? { status: SUBMIT_STATUS.ACCEPTED }
          : { status: SUBMIT_STATUS.REJECTED, rejection: response.rejection },
      );
    },
    [onSubmit],
  );

  return { state, submit };
}
