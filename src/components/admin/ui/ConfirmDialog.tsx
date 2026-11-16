"use client";

import type { FormEvent, ReactNode } from "react";

export default function ConfirmDialog({
  action,
  message,
  children,
  className = "",
}: {
  action: (formData: FormData) => void | Promise<void>;
  message: string;
  children: ReactNode;
  className?: string;
}) {
  function confirmSubmission(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(message)) event.preventDefault();
  }

  return <form action={action} onSubmit={confirmSubmission} className={className}>{children}</form>;
}
