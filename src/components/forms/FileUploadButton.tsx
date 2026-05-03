"use client";

import { useRef, useState } from "react";

type FileUploadButtonProps = {
  action: (formData: FormData) => void | Promise<void>;
  buttonLabel: string;
  buttonClassName: string;
  accept?: string;
  name?: string;
  /** Seçilen / yüklenen dosya adı için ek sınıflar */
  fileNameClassName?: string;
};

export default function FileUploadButton({
  action,
  buttonLabel,
  buttonClassName,
  accept = ".pdf,.doc,.docx,.png,.jpg,.jpeg",
  name = "file",
  fileNameClassName = "max-w-[min(100%,280px)] truncate text-[11px] font-medium text-slate-600",
}: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileHint, setFileHint] = useState<{ name: string; phase: "uploading" | "done" } | null>(
    null,
  );

  return (
    <span className="inline-flex flex-col items-stretch gap-1 align-top">
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (!file) return;

          const inputEl = event.currentTarget;
          setFileHint({ name: file.name, phase: "uploading" });
          setIsUploading(true);

          const formData = new FormData();
          formData.append(name, file);

          void (async () => {
            try {
              await action(formData);
              setFileHint({ name: file.name, phase: "done" });
            } catch {
              setFileHint({ name: file.name, phase: "done" });
            } finally {
              setIsUploading(false);
              inputEl.value = "";
            }
          })();
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className={`${buttonClassName} disabled:opacity-60`}
      >
        {isUploading ? "Yükleniyor..." : buttonLabel}
      </button>
      {fileHint ? (
        <span
          className={fileNameClassName}
          title={fileHint.name}
          aria-live="polite"
        >
          {fileHint.phase === "uploading" ? (
            <>Yükleniyor: {fileHint.name}</>
          ) : (
            <>Yüklenen dosya: {fileHint.name}</>
          )}
        </span>
      ) : null}
    </span>
  );
}
