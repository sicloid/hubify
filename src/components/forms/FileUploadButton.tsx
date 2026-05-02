"use client";

import { useRef, useTransition } from "react";

type FileUploadButtonProps = {
  action: (formData: FormData) => void | Promise<void>;
  buttonLabel: string;
  buttonClassName: string;
  accept?: string;
  name?: string;
};

export default function FileUploadButton({
  action,
  buttonLabel,
  buttonClassName,
  accept = ".pdf,.doc,.docx,.png,.jpg,.jpeg",
  name = "file",
}: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (!file) return;

          const formData = new FormData();
          formData.append(name, file);

          startTransition(async () => {
            await action(formData);
          });

          // Allow selecting the same file again later.
          event.currentTarget.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className={`${buttonClassName} disabled:opacity-60`}
      >
        {isPending ? "Yukleniyor..." : buttonLabel}
      </button>
    </>
  );
}
