"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@/components";
import { AUTH_MODE, useAuthDialog } from "@/features/account";

export function GuestInvite() {
  const { t } = useTranslation();
  const { openAuth } = useAuthDialog();

  return (
    <section aria-labelledby="invite-title" className="flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-2xl border-[1.5px] border-ink/25 px-5 py-3 short:py-2">
      <div className="min-w-0 flex-1 basis-60">
        <h2 id="invite-title" className="text-xl italic">
          {t("profile.guestInvite.title")}
        </h2>
        <p className="text-ink-soft short:hidden">{t("profile.guestInvite.body")}</p>
      </div>
      <Button onClick={() => openAuth(AUTH_MODE.REGISTER)}>{t("profile.guestInvite.action")}</Button>
    </section>
  );
}
