"use client";

import { useState } from "react";

export function MediaUpload({ name, label, accept, multiple = false }: { name: string; label: string; accept: string; multiple?: boolean }) {
  const [keys, setKeys] = useState<string[]>([]);
  const [progress, setProgress] = useState("");
  const [progressValue, setProgressValue] = useState(0);
  const [error, setError] = useState("");

  function sendFile(url: string, method: string, file: File, headers: Record<string, string>, onProgress: (value: number) => void) {
    return new Promise<{ key?: string; error?: string }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      Object.entries(headers).forEach(([header, value]) => xhr.setRequestHeader(header, value));
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
      };
      xhr.onerror = () => reject(new Error("Upload connection failed."));
      xhr.onload = () => {
        let result: { key?: string; error?: string } = {};
        try { result = JSON.parse(xhr.responseText) as typeof result; } catch { /* Storage returns JSON on success. */ }
        if (xhr.status < 200 || xhr.status >= 300) reject(new Error(result.error || "Upload failed."));
        else resolve(result);
      };
      xhr.send(file);
    });
  }

  async function compress(file: File) {
    if (!file.type.startsWith("image/")) return file;
    const image = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
    image.close();
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Could not compress photo.")), "image/webp", .78));
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" });
  }

  async function uploadOne(original: File, onProgress: (value: number) => void) {
    const file = await compress(original);
    const sign = await fetch("/api/uploads/sign", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: file.name, type: file.type, size: file.size }),
    });
    const signed = await sign.json() as { key?: string; token?: string; error?: string };
    if (!sign.ok || !signed.key) throw new Error(signed.error || "Could not prepare upload.");
    if (!signed.token || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) throw new Error("Upload is not configured.");
    const encodedPath = signed.key.split("/").map(encodeURIComponent).join("/");
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/upload/sign/verification-media/${encodedPath}?token=${encodeURIComponent(signed.token)}`;
    await sendFile(url, "PUT", file, {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      "content-type": file.type,
      "x-upsert": "false",
    }, onProgress);
    return signed.key;
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    const selected = Array.from(files);
    if (!multiple && selected.length > 1) {
      setError("Choose one video.");
      return;
    }
    try {
      const uploaded: string[] = [];
      for (let index = 0; index < selected.length; index += 1) {
        const file = selected[index]!;
        if (file.type.startsWith("video/") && file.size > 50 * 1024 * 1024) throw new Error("Video maximum is 50 MB.");
        setProgress(`Uploading ${index + 1} of ${selected.length}…`);
        setProgressValue(0);
        uploaded.push(await uploadOne(file, setProgressValue));
      }
      setKeys((previous) => [...previous, ...uploaded]);
      setProgress(`${uploaded.length} file${uploaded.length === 1 ? "" : "s"} ready`);
      setProgressValue(100);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Upload failed.");
      setProgress("");
    }
  }

  return <div className="field">
    <label htmlFor={`upload-${name}`}>{label}</label>
    <input id={`upload-${name}`} type="file" accept={accept} multiple={multiple} onChange={(event) => void handleFiles(event.currentTarget.files)} />
    {keys.map((key, index) => <input key={`${key}-${index}`} type="hidden" name={name} value={key} />)}
    {progress && <progress value={progressValue} max={100} style={{ width: "100%", accentColor: "#e86532" }} aria-label={progress} />}
    <small className="hint" aria-live="polite">{progress}</small>
    {error && <small className="error-text" role="alert">{error}</small>}
  </div>;
}
