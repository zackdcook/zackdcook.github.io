"use client";
import { useRef, useState, useEffect } from "react";
import { usePreferences } from "@/components/site-preferences";
import { bookCopy } from "@/lib/book-launch/shared";
import { bookEvent } from "@/lib/book-launch/analytics";
import { BookSignupForm } from "./signup-form";
import { BookContext, restoreBookFocus, useBookLaunch } from "./context";
export function BookLaunchProvider({ children, testMode = false }: { children: React.ReactNode; testMode?: boolean }) {
  const { bookSubscribed, hydrated } = usePreferences();
  const enabled = process.env.NEXT_PUBLIC_BOOK_LAUNCH_ENABLED === "true" && hydrated && !bookSubscribed;
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    if (!enabled && !success && dialog.current?.open) dialog.current.close();
  }, [enabled, success]);
  return <BookContext value={{ enabled, testMode, open: source => {
    if (!enabled) return;
    opener.current = source;
    setSuccess(false); setOpen(true); dialog.current?.showModal();
    bookEvent("book_cta_opened", { placement: "menu" });
  } }}>
    {children}
    <dialog ref={dialog} className="calendar-dialog book-dialog" aria-labelledby="book-menu-title"
      onClose={() => { setOpen(false); restoreBookFocus(opener.current); }}
      onClick={event => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.current?.close();
      }}>
      <div className="calendar-dialog-content">
        <button type="button" className="button calendar-close dialog-close" aria-label="Close book alert" onClick={() => dialog.current?.close()}>×</button>
        {success ? <><h2 id="book-menu-title">{bookCopy.success}</h2><button autoFocus className="button" onClick={() => dialog.current?.close()}>Close</button></> : open && <BookSignupForm placement="menu" titleId="book-menu-title" onSuccess={() => setSuccess(true)} />}
      </div>
    </dialog>
  </BookContext>;
}
export function BookMenuItem({ closeMenu }: { closeMenu?: () => void }) {
  const { enabled, open } = useBookLaunch();
  if (!enabled) return null;
  return <button type="button" className="book-menu-item" aria-haspopup="dialog" onClick={event => { closeMenu?.(); open(event.currentTarget); }}>Book Alert</button>;
}
