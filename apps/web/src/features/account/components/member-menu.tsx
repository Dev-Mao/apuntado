"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useTranslation } from "react-i18next";

import { LiveNotice } from "@/components";
import { useRealtime } from "@/features/realtime";
import { profileHref, ROUTES } from "@/lib";

import { useDisclosure } from "../hooks";
import { ChipBalance } from "./chip-balance";

const ITEM_CLASSES = "label-caps flex min-h-11 w-full items-center rounded-xl px-3 text-left text-[0.65rem] transition-colors hover:bg-ink/5";

export function MemberMenu({ nickname }: { nickname: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { endSession } = useRealtime();
  const { open, ref, close, toggle } = useDisclosure();
  const [failed, setFailed] = useState(false);

  const handleLogout = () => {
    setFailed(false);
    endSession().then(
      () => {
        close();
        router.push(ROUTES.HOME);
      },
      () => setFailed(true),
    );
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={t("account.menu")}
        className="flex items-center gap-2.5 rounded-full py-1 pr-1 pl-1 transition-colors hover:bg-ink/5 sm:pr-2"
      >
        <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full border-[1.5px] border-ink bg-coral text-lg leading-none italic">
          {nickname.slice(0, 1).toUpperCase()}
        </span>
        <span className="hidden max-w-[9rem] truncate text-lg italic md:block">{nickname}</span>
        <ChipBalance className="max-sm:hidden" />
      </button>
      {open && (
        <div className="absolute top-full right-0 z-30 mt-2 flex w-60 flex-col gap-1 rounded-2xl bg-paper-light p-2 shadow-sheet">
          <p className="truncate px-3 pt-2 text-xl italic">{nickname}</p>
          <ChipBalance className="mx-3 mb-1 self-start sm:hidden" />
          <Link href={profileHref()} onClick={close} className={ITEM_CLASSES}>
            {t("account.profile")}
          </Link>
          <button type="button" onClick={handleLogout} className={ITEM_CLASSES}>
            {t("account.logout")}
          </button>
          {failed && <LiveNotice message={t("account.logoutFailed")} className="px-3 text-base" />}
        </div>
      )}
    </div>
  );
}
