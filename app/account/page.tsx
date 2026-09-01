"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowLeft,
  LockKeyhole,
  LogOut,
  Music2,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import {
  MAX_USER_AUDIO_BYTES,
  MAX_USER_AUDIO_FILES,
  USER_AUDIO_BUCKET,
  USER_AUDIO_RETENTION_DAYS,
  supabase,
  type UserAudioRow,
} from "../../lib/supabaseClient";

function formatMb(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function daysLeft(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export default function AccountPage() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<UserAudioRow[]>([]);
  const [uploadBusy, setUploadBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === undefined) return;
    if (!session) {
      setUploads([]);
      return;
    }
    refreshUploads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function refreshUploads() {
    const { data, error: fetchError } = await supabase
      .from("user_audio")
      .select("*")
      .order("uploaded_at", { ascending: false });
    if (fetchError) {
      setError(fetchError.message);
      return;
    }
    setUploads((data as UserAudioRow[]) ?? []);
  }

  async function signIn(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setAuthBusy(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setAuthBusy(false);
    if (signInError) setError(signInError.message);
  }

  async function signUp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setAuthBusy(true);
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    setAuthBusy(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    setMessage("Account created. Check your email if confirmation is required, then sign in.");
    setMode("signin");
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function onPickFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (fileInput.current) fileInput.current.value = "";
    if (!file || !session) return;
    setError(null);
    setMessage(null);

    if (!file.type.startsWith("audio/")) {
      setError("Only audio files can be uploaded.");
      return;
    }
    if (file.size > MAX_USER_AUDIO_BYTES) {
      setError(`That file is ${formatMb(file.size)} — the limit is ${formatMb(MAX_USER_AUDIO_BYTES)} per file.`);
      return;
    }
    if (uploads.length >= MAX_USER_AUDIO_FILES) {
      setError(`You already have ${MAX_USER_AUDIO_FILES} saved tracks — delete one first to upload another.`);
      return;
    }

    setUploadBusy(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
    const storagePath = `${session.user.id}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(USER_AUDIO_BUCKET)
      .upload(storagePath, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      setUploadBusy(false);
      setError(uploadError.message);
      return;
    }

    const { error: insertError } = await supabase.from("user_audio").insert({
      owner_id: session.user.id,
      storage_path: storagePath,
      file_name: file.name,
      size_bytes: file.size,
    });

    setUploadBusy(false);

    if (insertError) {
      // Roll back the uploaded object if the row insert was rejected (e.g. the 5-file limit trigger).
      await supabase.storage.from(USER_AUDIO_BUCKET).remove([storagePath]);
      setError(insertError.message.includes("Upload limit") ? insertError.message : `Could not save: ${insertError.message}`);
      return;
    }

    setMessage(`"${file.name}" saved to your account.`);
    await refreshUploads();
  }

  async function deleteUpload(row: UserAudioRow) {
    setError(null);
    setMessage(null);
    await supabase.storage.from(USER_AUDIO_BUCKET).remove([row.storage_path]);
    const { error: deleteError } = await supabase.from("user_audio").delete().eq("id", row.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setUploads((prev) => prev.filter((u) => u.id !== row.id));
  }

  function publicUrlFor(path: string) {
    return supabase.storage.from(USER_AUDIO_BUCKET).getPublicUrl(path).data.publicUrl;
  }

  if (session === undefined) {
    return (
      <main className="account-page">
        <section className="account-card">
          <div className="account-mark">
            <ShieldCheck size={30} />
          </div>
          <p>Loading…</p>
        </section>
      </main>
    );
  }

  return (
    <main className="account-page">
      <section className="account-card">
        <a className="account-back" href="/">
          <ArrowLeft size={16} /> Back to MoveBeat
        </a>
        <div className="account-mark">
          <ShieldCheck size={30} />
        </div>

        {session ? (
          <>
            <small className="account-kicker">ACCOUNT CONNECTED</small>
            <h1>Welcome back</h1>
            <div className="account-user">
              <UserRound size={20} />
              <span>
                <b>{session.user.email}</b>
                <small>Signed in</small>
              </span>
            </div>

            <div className="account-uploads">
              <div className="account-uploads-head">
                <span>
                  <Music2 size={16} /> My audio ({uploads.length}/{MAX_USER_AUDIO_FILES})
                </span>
                <label className={`account-upload-btn${uploadBusy || uploads.length >= MAX_USER_AUDIO_FILES ? " disabled" : ""}`}>
                  <Upload size={14} />
                  {uploadBusy ? "Uploading…" : "Upload"}
                  <input
                    ref={fileInput}
                    type="file"
                    accept="audio/*"
                    onChange={onPickFile}
                    disabled={uploadBusy || uploads.length >= MAX_USER_AUDIO_FILES}
                  />
                </label>
              </div>
              <p className="account-uploads-note">
                Up to {MAX_USER_AUDIO_FILES} files, {formatMb(MAX_USER_AUDIO_BYTES)} max each. Kept for {USER_AUDIO_RETENTION_DAYS} days, then removed automatically.
              </p>
              {uploads.length === 0 ? (
                <p className="account-uploads-empty">No saved tracks yet.</p>
              ) : (
                <ul className="account-uploads-list">
                  {uploads.map((u) => (
                    <li key={u.id}>
                      <audio controls preload="none" src={publicUrlFor(u.storage_path)} />
                      <div className="account-uploads-meta">
                        <b>{u.file_name}</b>
                        <small>
                          {formatMb(u.size_bytes)} · expires in {daysLeft(u.expires_at)}d
                        </small>
                      </div>
                      <button className="account-upload-delete" onClick={() => deleteUpload(u)} title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {error && <p className="account-error">{error}</p>}
            {message && <p className="account-message">{message}</p>}

            <a className="account-primary" href="/">
              Open MoveBeat
            </a>
            <button className="account-secondary" onClick={signOut}>
              <LogOut size={16} /> Sign out
            </button>
          </>
        ) : (
          <>
            <small className="account-kicker">SECURE LOGIN</small>
            <h1>Welcome to MoveBeat</h1>
            <p>Sign in to save your own audio tracks to your account.</p>

            <form className="account-form" onSubmit={mode === "signin" ? signIn : signUp}>
              <label>
                Email
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </label>
              <label>
                Password
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
              </label>
              {error && <p className="account-error">{error}</p>}
              {message && <p className="account-message">{message}</p>}
              <button className="account-primary" type="submit" disabled={authBusy}>
                <LockKeyhole size={18} /> {authBusy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>
            <button
              className="account-switch"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setMessage(null);
              }}
            >
              {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
            </button>

            <div className="account-safety">
              <ShieldCheck size={18} />
              <span>
                <b>Private and protected</b>
                <small>Only you can see and manage your saved audio.</small>
              </span>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
