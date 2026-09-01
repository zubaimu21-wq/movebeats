"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Check, Copy, Crown, Music2, Phone, ShieldAlert, ShieldCheck, Trash2, Users } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { USER_AUDIO_BUCKET, MAX_USER_AUDIO_FILES, supabase, type ProfileRow, type UserAudioRow } from "../../lib/supabaseClient";

function formatMb(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function daysLeft(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export default function AdminPage() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [profile, setProfile] = useState<ProfileRow | null | undefined>(undefined);
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [audioByOwner, setAudioByOwner] = useState<Record<string, UserAudioRow[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === undefined) return;
    if (!session) {
      setProfile(null);
      return;
    }
    supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => setProfile((data as ProfileRow) ?? null));
  }, [session]);

  useEffect(() => {
    if (!profile?.is_admin) return;
    loadEverything();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  async function loadEverything() {
    setError(null);
    const [{ data: profilesData, error: profilesError }, { data: audioData, error: audioError }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_audio").select("*").order("uploaded_at", { ascending: false }),
    ]);
    if (profilesError) {
      setError(profilesError.message);
      return;
    }
    if (audioError) {
      setError(audioError.message);
      return;
    }
    setUsers((profilesData as ProfileRow[]) ?? []);
    const grouped: Record<string, UserAudioRow[]> = {};
    for (const row of (audioData as UserAudioRow[]) ?? []) {
      grouped[row.owner_id] = grouped[row.owner_id] ? [...grouped[row.owner_id], row] : [row];
    }
    setAudioByOwner(grouped);
  }

  function publicUrlFor(path: string) {
    return supabase.storage.from(USER_AUDIO_BUCKET).getPublicUrl(path).data.publicUrl;
  }

  async function deleteTrack(row: UserAudioRow) {
    setError(null);
    setBusyId(row.id);
    await supabase.storage.from(USER_AUDIO_BUCKET).remove([row.storage_path]);
    const { error: deleteError } = await supabase.from("user_audio").delete().eq("id", row.id);
    setBusyId(null);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setAudioByOwner((prev) => {
      const next = { ...prev };
      next[row.owner_id] = (next[row.owner_id] ?? []).filter((r) => r.id !== row.id);
      return next;
    });
  }

  if (session === undefined || profile === undefined) {
    return (
      <main className="account-page">
        <section className="account-card">
          <p>Loading…</p>
        </section>
      </main>
    );
  }

  if (!session || !profile?.is_admin) {
    return (
      <main className="account-page">
        <section className="account-card">
          <div className="account-mark admin-denied-mark">
            <ShieldAlert size={30} />
          </div>
          <h1>Access denied</h1>
          <p>This page is only for the MoveBeat admin account.</p>
          <a className="account-primary" href="/account">
            <ArrowLeft size={16} /> Back to Account
          </a>
        </section>
      </main>
    );
  }

  const totalUploads = Object.values(audioByOwner).reduce((sum, rows) => sum + rows.length, 0);
  const phoneNumbers = users.map((u) => u.phone).filter((p): p is string => !!p);

  async function copyPhoneNumbers() {
    try {
      await navigator.clipboard.writeText(phoneNumbers.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <a className="account-back" href="/account">
          <ArrowLeft size={16} /> Back to Account
        </a>

        <header className="admin-header">
          <div className="account-mark">
            <Crown size={28} />
          </div>
          <div>
            <small className="account-kicker">SUPERADMIN</small>
            <h1>User Dashboard</h1>
          </div>
        </header>

        <div className="admin-stats">
          <div className="admin-stat">
            <Users size={18} />
            <div>
              <b>{users.length}</b>
              <small>Registered users</small>
            </div>
          </div>
          <div className="admin-stat">
            <Music2 size={18} />
            <div>
              <b>{totalUploads}</b>
              <small>Saved audio files</small>
            </div>
          </div>
          <div className="admin-stat">
            <Phone size={18} />
            <div>
              <b>{phoneNumbers.length}</b>
              <small>Numbers on file</small>
            </div>
          </div>
        </div>

        {phoneNumbers.length > 0 && (
          <button className="admin-copy-numbers" onClick={copyPhoneNumbers}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : `Copy all ${phoneNumbers.length} numbers`}
          </button>
        )}

        {error && <p className="account-error">{error}</p>}

        <ul className="admin-users">
          {users.map((u) => {
            const tracks = audioByOwner[u.id] ?? [];
            return (
              <li key={u.id} className="admin-user-card">
                <div className="admin-user-head">
                  <div className="admin-user-mark">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="admin-user-info">
                    <b>
                      {u.display_name || u.email || "Unknown"}
                      {u.is_admin && (
                        <span className="account-admin-badge">
                          <Crown size={11} /> Admin
                        </span>
                      )}
                    </b>
                    <small>
                      {u.email} · joined {formatDate(u.created_at)}
                    </small>
                    <small className={u.phone ? "admin-phone" : "admin-phone missing"}>
                      <Phone size={11} /> {u.phone || "No number on file"}
                    </small>
                  </div>
                  <span className="admin-user-count">
                    {tracks.length}/{MAX_USER_AUDIO_FILES}
                  </span>
                </div>

                {tracks.length > 0 && (
                  <ul className="admin-track-list">
                    {tracks.map((t) => (
                      <li key={t.id}>
                        <audio controls preload="none" src={publicUrlFor(t.storage_path)} />
                        <div className="account-uploads-meta">
                          <b>{t.file_name}</b>
                          <small>
                            {formatMb(t.size_bytes)} · expires in {daysLeft(t.expires_at)}d
                          </small>
                        </div>
                        <button
                          className="account-upload-delete"
                          disabled={busyId === t.id}
                          onClick={() => deleteTrack(t)}
                          title="Delete this user's file"
                        >
                          <Trash2 size={15} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
