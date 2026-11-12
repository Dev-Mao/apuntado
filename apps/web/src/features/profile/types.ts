import type { ProfileResult } from "@/lib";

export type ProfileState = ProfileResult | { readonly status: "loading" } | { readonly status: "failed" };
