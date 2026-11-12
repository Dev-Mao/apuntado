"use client";

import { useTranslation } from "react-i18next";

import { Button, BUTTON_VARIANT } from "@/components";
import { SessionBadge, useRealtime } from "@/features/realtime";

import { useAuthDialog } from "../auth-context";
import { AUTH_MODE } from "../types";
import { MemberMenu } from "./member-menu";

export function AccountMenu() {
  const { t } = useTranslation();
  const { session } = useRealtime();
  const { openAuth } = useAuthDialog();

  if (session.status === "ready" && !session.session.guest) return <MemberMenu nickname={session.session.nickname} />;

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <SessionBadge />
      <Button variant={BUTTON_VARIANT.GHOST} onClick={() => openAuth(AUTH_MODE.LOGIN)} className="px-3">
        {t("account.enter")}
      </Button>
      <Button variant={BUTTON_VARIANT.OUTLINE} onClick={() => openAuth(AUTH_MODE.REGISTER)} className="max-sm:hidden">
        {t("account.create")}
      </Button>
    </div>
  );
}
