"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Bell,
  BellOff,
  BellRing,
  Bike,
  Bot,
  Box,
  Crown,
  Dumbbell,
  Download,
  Expand,
  Flame,
  Footprints,
  Gamepad2,
  ImagePlus,
  LogIn,
  LogOut,
  Mic2,
  Moon,
  Music2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Settings2,
  Sparkles,
  Sun,
  Trophy,
  Trash2,
  Upload,
  UserPlus,
  UserRound,
  Users,
  Vibrate,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import type { Session } from "@supabase/supabase-js";
import {
  MAX_USER_AUDIO_BYTES,
  MAX_USER_AUDIO_FILES,
  USER_AUDIO_BUCKET,
  supabase,
  type ProfileRow,
  type UserAudioRow,
} from "../lib/supabaseClient";

type Status = "ready" | "counting" | "running" | "paused" | "finished";
type Mode = "game" | "workout" | "hiit" | "boxing" | "custom";
type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
type Track = {
  id: string;
  name: string;
  style: string;
  emoji: string;
  color: string;
  src: string;
  base: number;
};
type Team = {
  id: string;
  name: string;
  image: string | null;
  members: string[];
};
const hypeOptions = [
  {
    id: "move",
    title: "Move Now",
    text: "Come on guys, come on! Let's move right now!",
  },
  {
    id: "team",
    title: "Let’s Go Team",
    text: "Let’s go team, come on, come on!",
  },
  { id: "wake", title: "Wake Up", text: "Wake up! Come on, we can do this!" },
  {
    id: "win",
    title: "Let’s Win",
    text: "Push, push, come on guys, let's win!",
  },
];
const tracks: Track[] = [
  {
    id: "dance",
    name: "Upbeat Pop Dance",
    style: "Party • Dance",
    emoji: "🎉",
    color: "#f472b6",
    src: "/audio/upbeat-pop-dance.mp3",
    base: 106,
  },
  {
    id: "phonk",
    name: "Charming Phonk",
    style: "Powerful • Bass",
    emoji: "🔥",
    color: "#fb633c",
    src: "/audio/charming-phonk.mp3",
    base: 104,
  },
  {
    id: "energy",
    name: "Game Energy",
    style: "Electronic • Action",
    emoji: "⚡",
    color: "#f6c945",
    src: "/audio/no-copyright-energy.mp3",
    base: 100,
  },
  {
    id: "cartoon",
    name: "Comedy Cartoon",
    style: "Fun • Kids games",
    emoji: "😄",
    color: "#8b5cf6",
    src: "/audio/comedy-cartoon.mp3",
    base: 98,
  },
  {
    id: "blues",
    name: "Blues Ballad",
    style: "Cool • Challenge",
    emoji: "🎸",
    color: "#22d3ee",
    src: "/audio/blues-ballad.mp3",
    base: 84,
  },
  {
    id: "chill",
    name: "Sweet Life Chill",
    style: "Luxury • Smooth",
    emoji: "✨",
    color: "#60a5fa",
    src: "/audio/sweet-life-chill.mp3",
    base: 82,
  },
  {
    id: "alone",
    name: "Alone",
    style: "Emotional • Focus",
    emoji: "🌙",
    color: "#a78bfa",
    src: "/audio/alone.mp3",
    base: 80,
  },
  {
    id: "brand",
    name: "Brand Strategy",
    style: "Modern • Corporate",
    emoji: "🚀",
    color: "#38bdf8",
    src: "/audio/brand-strategy.mp3",
    base: 102,
  },
  {
    id: "innovate",
    name: "Innovate",
    style: "Technology • Energy",
    emoji: "💡",
    color: "#2dd4bf",
    src: "/audio/innovate.mp3",
    base: 104,
  },
  {
    id: "kids",
    name: "Kids Playtime",
    style: "Quirky • Playful",
    emoji: "🧸",
    color: "#fbbf24",
    src: "/audio/kids-playful.mp3",
    base: 108,
  },
  {
    id: "cinematic",
    name: "Emotional Mood",
    style: "Cinematic • Motivation",
    emoji: "🎬",
    color: "#c084fc",
    src: "/audio/emotional-cinematic.mp3",
    base: 88,
  },
  {
    id: "party",
    name: "Party Countdown",
    style: "Celebration • High energy",
    emoji: "🥳",
    color: "#fb7185",
    src: "/audio/party-countdown.mp3",
    base: 112,
  },
  {
    id: "retro-arcade",
    name: "Retro Arcade Pulse",
    style: "8-bit • Game energy",
    emoji: "👾",
    color: "#f472b6",
    src: "/audio/retro-arcade-pulse.mp3",
    base: 128,
  },
  {
    id: "neon-sprint",
    name: "Neon Sprint",
    style: "Synthwave • Drive",
    emoji: "🏁",
    color: "#a78bfa",
    src: "/audio/neon-sprint.mp3",
    base: 120,
  },
  {
    id: "power-surge",
    name: "Power Surge",
    style: "Workout • High intensity",
    emoji: "⚡",
    color: "#ef4444",
    src: "/audio/power-surge.mp3",
    base: 134,
  },
  {
    id: "calm-focus-loop",
    name: "Calm Focus Loop",
    style: "Ambient • Focus",
    emoji: "🌙",
    color: "#60a5fa",
    src: "/audio/calm-focus-loop.mp3",
    base: 76,
  },
  {
    id: "victory-march",
    name: "Victory March",
    style: "Triumphant • Finish line",
    emoji: "🏆",
    color: "#fbbf24",
    src: "/audio/victory-march.mp3",
    base: 112,
  },
  {
    id: "chill-groove-loop",
    name: "Chill Groove Loop",
    style: "Lo-fi • Warm up",
    emoji: "☕",
    color: "#34d399",
    src: "/audio/chill-groove-loop.mp3",
    base: 94,
  },
];
const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));
const modes: [Mode, string, string, React.ReactNode][] = [
  ["game", "Games", "Music challenge", <Gamepad2 key="game" />],
  ["workout", "Workout", "45s / 15s", <Dumbbell key="workout" />],
  ["hiit", "HIIT", "40s / 20s", <Flame key="hiit" />],
  ["boxing", "Boxing", "3m / 1m", <Box key="boxing" />],
  ["custom", "Custom", "Build your own", <Settings2 key="custom" />],
];
const activities = [
  { id: "general", name: "General Workout", met: 6 },
  { id: "hiit", name: "HIIT / Circuit", met: 8 },
  { id: "boxing", name: "Boxing", met: 9 },
  { id: "running", name: "Running", met: 8.3 },
  { id: "cycling", name: "Cycling", met: 7.5 },
  { id: "walking", name: "Fast Walking", met: 4.3 },
  { id: "strength", name: "Strength Training", met: 5.5 },
];

export default function Home() {
  const [minutes, setMinutes] = useState(2),
    [seconds, setSeconds] = useState(0),
    [startCountdown, setStartCountdown] = useState(3),
    [endCountdown, setEndCountdown] = useState(10),
    [changeEvery, setChangeEvery] = useState(40),
    [musicVolume, setMusicVolume] = useState(60),
    [voiceVolume, setVoiceVolume] = useState(95),
    [countdownVolume, setCountdownVolume] = useState(100),
    [whistleVolume, setWhistleVolume] = useState(70),
    [remaining, setRemaining] = useState(120);
  const [status, setStatus] = useState<Status>("ready"),
    [mode, setMode] = useState<Mode>("game"),
    [workSeconds, setWorkSeconds] = useState(45),
    [restSeconds, setRestSeconds] = useState(15),
    [rounds, setRounds] = useState(8),
    [weight, setWeight] = useState(70),
    [activityId, setActivityId] = useState("general"),
    [muted, setMuted] = useState(false),
    [trackId, setTrackId] = useState("energy"),
    [customTrack, setCustomTrack] = useState<Track | null>(null),
    [previewingId, setPreviewingId] = useState<string | null>(null),
    [hypeId, setHypeId] = useState("team"),
    [hypeEvery, setHypeEvery] = useState(45),
    [rotateHype, setRotateHype] = useState(false),
    [effectsEnabled, setEffectsEnabled] = useState(true),
    [lightTheme, setLightTheme] = useState(false),
    [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null),
    [hypeActive, setHypeActive] = useState(false),
    [starting, setStarting] = useState(false),
    [startCue, setStartCue] = useState<string | null>(null),
    [coachMessage, setCoachMessage] = useState("Ready when you are");
  const [teams, setTeams] = useState<Team[]>([
    { id: "team-a", name: "Team A", image: null, members: [""] },
    { id: "team-b", name: "Team B", image: null, members: [""] },
  ]);
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [myUploads, setMyUploads] = useState<UserAudioRow[]>([]);
  const [myUploadBusy, setMyUploadBusy] = useState(false);
  const [myUploadError, setMyUploadError] = useState<string | null>(null);
  const myUploadRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === undefined) return;
    if (!session) {
      setProfile(null);
      setMyUploads([]);
      return;
    }
    supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => setProfile((data as ProfileRow) ?? null));
    refreshMyUploads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function refreshMyUploads() {
    const { data, error: fetchError } = await supabase
      .from("user_audio")
      .select("*")
      .order("uploaded_at", { ascending: false });
    if (fetchError) return;
    setMyUploads((data as UserAudioRow[]) ?? []);
  }

  const onMyUpload = async (file?: File) => {
    if (!file || !session) return;
    setMyUploadError(null);
    if (!file.type.startsWith("audio/")) {
      setMyUploadError("Only audio files can be uploaded.");
      return;
    }
    if (file.size > MAX_USER_AUDIO_BYTES) {
      setMyUploadError(
        `That file is ${(file.size / (1024 * 1024)).toFixed(1)}MB — the limit is ${(MAX_USER_AUDIO_BYTES / (1024 * 1024)).toFixed(0)}MB per file.`,
      );
      return;
    }
    if (myUploads.length >= MAX_USER_AUDIO_FILES) {
      setMyUploadError(`You already have ${MAX_USER_AUDIO_FILES} saved tracks — delete one first to upload another.`);
      return;
    }
    setMyUploadBusy(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
    const storagePath = `${session.user.id}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from(USER_AUDIO_BUCKET)
      .upload(storagePath, file, { contentType: file.type, upsert: false });
    if (uploadError) {
      setMyUploadBusy(false);
      setMyUploadError(uploadError.message);
      return;
    }
    const { error: insertError } = await supabase.from("user_audio").insert({
      owner_id: session.user.id,
      storage_path: storagePath,
      file_name: file.name,
      size_bytes: file.size,
    });
    setMyUploadBusy(false);
    if (insertError) {
      await supabase.storage.from(USER_AUDIO_BUCKET).remove([storagePath]);
      setMyUploadError(insertError.message.includes("Upload limit") ? insertError.message : `Could not save: ${insertError.message}`);
      return;
    }
    await refreshMyUploads();
  };

  const deleteMyUpload = async (row: UserAudioRow) => {
    setMyUploadError(null);
    await supabase.storage.from(USER_AUDIO_BUCKET).remove([row.storage_path]);
    const { error: deleteError } = await supabase.from("user_audio").delete().eq("id", row.id);
    if (deleteError) {
      setMyUploadError(deleteError.message);
      return;
    }
    if (trackId === `upload:${row.id}`) setTrackId("energy");
    setMyUploads((prev) => prev.filter((u) => u.id !== row.id));
  };

  const signOutOfAccount = async () => {
    await supabase.auth.signOut();
  };

  const todayKey = () => new Date().toISOString().slice(0, 10);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [stepsSettingsOpen, setStepsSettingsOpen] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [stepTracking, setStepTracking] = useState(false);
  const [stepSupport, setStepSupport] = useState<"unknown" | "supported" | "unsupported" | "denied">("unknown");
  const [stepManualInput, setStepManualInput] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [stepAutoDetect, setStepAutoDetect] = useState(true);
  const [stepVibrate, setStepVibrate] = useState(true);
  const [sedentaryEnabled, setSedentaryEnabled] = useState(true);
  const [sedentaryMinutes, setSedentaryMinutes] = useState(45);
  const [notifyPermission, setNotifyPermission] = useState<"default" | "granted" | "denied" | "unsupported">(
    "default",
  );
  const [needsMotionTap, setNeedsMotionTap] = useState(false);
  const [walkToast, setWalkToast] = useState(false);
  const [sedentaryToast, setSedentaryToast] = useState(false);
  const stepMagHistoryRef = useRef<number[]>([]);
  const stepLastTimeRef = useRef(0);
  const lastStepAtRef = useRef(Date.now());
  const lastReminderAtRef = useRef(0);
  const wasWalkingRef = useRef(false);
  const walkIdleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(`movebeat_steps_${todayKey()}`) || "0");
      if (!Number.isNaN(saved)) setStepCount(saved);
      const settingsRaw = localStorage.getItem("movebeat_step_settings");
      if (settingsRaw) {
        const s = JSON.parse(settingsRaw);
        if (typeof s.autoDetect === "boolean") setStepAutoDetect(s.autoDetect);
        if (typeof s.vibrate === "boolean") setStepVibrate(s.vibrate);
        if (typeof s.sedentaryEnabled === "boolean") setSedentaryEnabled(s.sedentaryEnabled);
        if (typeof s.sedentaryMinutes === "number") setSedentaryMinutes(s.sedentaryMinutes);
      }
    } catch {}
    if (typeof Notification !== "undefined") {
      setNotifyPermission(Notification.permission as "default" | "granted" | "denied");
    } else {
      setNotifyPermission("unsupported");
    }
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(`movebeat_steps_${todayKey()}`, String(stepCount));
    } catch {}
  }, [stepCount]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "movebeat_step_settings",
        JSON.stringify({ autoDetect: stepAutoDetect, vibrate: stepVibrate, sedentaryEnabled, sedentaryMinutes }),
      );
    } catch {}
  }, [stepAutoDetect, stepVibrate, sedentaryEnabled, sedentaryMinutes]);

  const handleStepMotion = useCallback(
    (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (!acc || acc.x == null || acc.y == null || acc.z == null) return;
      const magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
      const hist = stepMagHistoryRef.current;
      hist.push(magnitude);
      if (hist.length > 20) hist.shift();
      const avg = hist.reduce((a, b) => a + b, 0) / hist.length;
      const threshold = avg + 1.15;
      const now = Date.now();
      if (magnitude > threshold && now - stepLastTimeRef.current > 300) {
        stepLastTimeRef.current = now;
        lastStepAtRef.current = now;
        setStepCount((c) => c + 1);

        if (!wasWalkingRef.current) {
          wasWalkingRef.current = true;
          if (stepVibrate && typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(80);
          setWalkToast(true);
          setTimeout(() => setWalkToast(false), 4000);
        }
        if (walkIdleTimeoutRef.current) clearTimeout(walkIdleTimeoutRef.current);
        walkIdleTimeoutRef.current = setTimeout(() => {
          wasWalkingRef.current = false;
        }, 8000);
      }
    },
    [stepVibrate],
  );

  const attachMotionListener = useCallback(() => {
    stepMagHistoryRef.current = [];
    window.addEventListener("devicemotion", handleStepMotion);
    setStepSupport("supported");
    setStepTracking(true);
    setNeedsMotionTap(false);
  }, [handleStepMotion]);

  useEffect(() => {
    return () => window.removeEventListener("devicemotion", handleStepMotion);
  }, [handleStepMotion]);

  // Try to auto-enable walk detection as soon as the app loads (no need to open the panel).
  useEffect(() => {
    if (!stepAutoDetect) return;
    if (typeof window === "undefined" || !("DeviceMotionEvent" in window)) {
      setStepSupport("unsupported");
      return;
    }
    const DME = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<"granted" | "denied"> };
    if (typeof DME.requestPermission === "function") {
      // iOS requires a real tap before sensor access can be granted.
      setNeedsMotionTap(true);
      return;
    }
    attachMotionListener();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepAutoDetect]);

  // Sedentary reminder: checks every minute whether too long has passed since the last detected step.
  useEffect(() => {
    if (!sedentaryEnabled) return;
    const id = setInterval(() => {
      const idleMs = Date.now() - lastStepAtRef.current;
      const thresholdMs = sedentaryMinutes * 60000;
      if (idleMs >= thresholdMs && Date.now() - lastReminderAtRef.current > thresholdMs) {
        lastReminderAtRef.current = Date.now();
        if (stepVibrate && typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([200, 100, 200, 100, 200]);
        }
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          try {
            new Notification("Time to move! 🚶", {
              body: "Aap kaafi dair se baithe hain — thoda chal kar aayein.",
            });
          } catch {}
        } else {
          setSedentaryToast(true);
          setTimeout(() => setSedentaryToast(false), 9000);
        }
      }
    }, 60000);
    return () => clearInterval(id);
  }, [sedentaryEnabled, sedentaryMinutes, stepVibrate]);

  const startStepTracking = async () => {
    if (typeof window === "undefined" || !("DeviceMotionEvent" in window)) {
      setStepSupport("unsupported");
      return;
    }
    const DME = DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
    if (typeof DME.requestPermission === "function") {
      try {
        const result = await DME.requestPermission();
        if (result !== "granted") {
          setStepSupport("denied");
          return;
        }
      } catch {
        setStepSupport("denied");
        return;
      }
    }
    attachMotionListener();
  };

  const stopStepTracking = () => {
    window.removeEventListener("devicemotion", handleStepMotion);
    setStepTracking(false);
    setStepAutoDetect(false);
  };

  const resetSteps = () => setStepCount(0);

  const applyManualSteps = () => {
    const n = clamp(parseInt(stepManualInput || "0", 10) || 0, 0, 200000);
    setStepCount(n);
    setStepManualInput("");
  };

  const enableStepNotifications = async () => {
    if (typeof Notification === "undefined") {
      setNotifyPermission("unsupported");
      return;
    }
    const perm = await Notification.requestPermission();
    setNotifyPermission(perm as "default" | "granted" | "denied");
  };

  const stepDistanceKm = (stepCount * 0.762) / 1000;
  const stepCalories = Math.round(stepCount * 0.04 * (weight / 70));

  const audioRef = useRef<HTMLAudioElement | null>(null),
    previewAudioRef = useRef<HTMLAudioElement | null>(null),
    uploadRef = useRef<HTMLInputElement | null>(null),
    hypeAudioRef = useRef<HTMLAudioElement | null>(null),
    whistleAudioRef = useRef<HTMLAudioElement | null>(null),
    lastSpokenRef = useRef<number | null>(null),
    lastHypeAtRef = useRef(0),
    hypeIndexRef = useRef(0),
    lastPhaseRef = useRef(""),
    lastMilestoneRef = useRef(0),
    finishingRef = useRef(false),
    whistleContextRef = useRef<AudioContext | null>(null),
    wakeLockRef = useRef<any>(null);
  const gameTotal = clamp(minutes * 60 + seconds, 5, 3600),
    sessionTotal =
      mode === "game"
        ? gameTotal
        : clamp(
            rounds * workSeconds + Math.max(0, rounds - 1) * restSeconds,
            5,
            7200,
          ),
    total = sessionTotal,
    elapsed = Math.max(0, total - remaining),
    cycle = workSeconds + restSeconds,
    roundIndex =
      mode === "game"
        ? 0
        : Math.min(rounds - 1, Math.floor(elapsed / Math.max(1, cycle))),
    phaseOffset = mode === "game" ? 0 : elapsed % Math.max(1, cycle),
    isRest =
      mode !== "game" && roundIndex < rounds - 1 && phaseOffset >= workSeconds,
    phaseRemaining =
      mode === "game"
        ? remaining
        : Math.max(
            0,
            isRest
              ? cycle - phaseOffset
              : Math.min(workSeconds - phaseOffset, remaining),
          ),
    displayRemaining = status === "finished" ? 0 : phaseRemaining,
    currentRound = roundIndex + 1;
  const myUploadTracks: Track[] = myUploads.map((u) => ({
      id: `upload:${u.id}`,
      name: u.file_name.replace(/\.[^.]+$/, "") || "My Upload",
      style: "My Uploads • Saved to account",
      emoji: "🎵",
      color: "#34d399",
      src: supabase.storage.from(USER_AUDIO_BUCKET).getPublicUrl(u.storage_path).data.publicUrl,
      base: 100,
    })),
    allTracks = [...myUploadTracks, ...(customTrack ? [customTrack] : []), ...tracks],
    track = allTracks.find((t) => t.id === trackId) ?? tracks[0],
    hypeChoice = hypeOptions.find((h) => h.id === hypeId) ?? hypeOptions[1],
    activity = activities.find((a) => a.id === activityId) ?? activities[0],
    completedCycles =
      mode === "game"
        ? 0
        : Math.min(rounds, Math.floor(elapsed / Math.max(1, cycle))),
    activeSeconds =
      mode === "game"
        ? elapsed
        : Math.min(
            rounds * workSeconds,
            completedCycles * workSeconds + Math.min(phaseOffset, workSeconds),
          ),
    calories = Math.max(
      0,
      Math.round(0.0175 * activity.met * weight * (activeSeconds / 60)),
    ),
    estimatedTotalCalories = Math.max(
      1,
      Math.round(
        0.0175 * activity.met * weight * ((rounds * workSeconds) / 60),
      ),
    ),
    progress = ((total - remaining) / total) * 100,
    speedEnabled = changeEvery > 0 && !isRest,
    totalStages = speedEnabled
      ? Math.max(1, Math.ceil(total / changeEvery))
      : 1,
    stage = speedEnabled
      ? Math.min(Math.floor(elapsed / changeEvery) + 1, totalStages)
      : 1,
    intensity = speedEnabled
      ? totalStages === 1
        ? progress / 100
        : (stage - 1) / (totalStages - 1)
      : 0,
    finalCountdown =
      status === "running" && endCountdown > 0 && remaining <= endCountdown,
    bpm = Math.round(
      track.base *
        (finalCountdown ? 0.94 : isRest ? 0.92 : 1 + intensity * 0.14),
    );
  const stopMusic = useCallback(() => {
    audioRef.current?.pause();
  }, []);
  const speak = useCallback(
    (text: string, rate = 0.9, pitch = 1.15, loudness = 100) => {
      if (muted || !("speechSynthesis" in window)) return;
      const synth = window.speechSynthesis;
      synth.cancel();
      const message = new SpeechSynthesisUtterance(text),
        voices = synth.getVoices(),
        female = voices.find((v) =>
          /samantha|zira|ava|aria|jenny|female|victoria|karen|moira|tessa|google us english/i.test(
            v.name,
          ),
        );
      if (female) message.voice = female;
      message.lang = "en-US";
      message.rate = rate;
      message.pitch = pitch;
      message.volume = loudness / 100;
      synth.resume();
      synth.speak(message);
    },
    [muted],
  );
  const playWhistle = useCallback(() => {
    const whistle = whistleAudioRef.current;
    if (!whistle) return;
    whistle.currentTime = 0;
    whistle.volume = muted ? 0 : whistleVolume / 100;
    whistle.play().catch(() => {});
  }, [muted, whistleVolume]);
  useEffect(() => {
    if ("serviceWorker" in navigator)
      navigator.serviceWorker.register("/sw.js");
    const capture = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as InstallPrompt);
    };
    window.addEventListener("beforeinstallprompt", capture);
    return () => {
      window.removeEventListener("beforeinstallprompt", capture);
      previewAudioRef.current?.pause();
    };
  }, []);
  useEffect(() => {
    if (status === "running" && "wakeLock" in navigator)
      (navigator as any).wakeLock
        .request("screen")
        .then((lock: any) => (wakeLockRef.current = lock))
        .catch(() => {});
    else {
      wakeLockRef.current?.release?.().catch?.(() => {});
      wakeLockRef.current = null;
    }
    return () => {
      if (status === "running") return;
      wakeLockRef.current?.release?.().catch?.(() => {});
    };
  }, [status]);
  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => setRemaining((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, [status]);
  useEffect(() => {
    if (
      status !== "running" ||
      mode === "game" ||
      (endCountdown > 0 && remaining <= endCountdown)
    )
      return;
    const key = `${currentRound}-${isRest ? "rest" : "work"}`;
    if (lastPhaseRef.current === key) return;
    lastPhaseRef.current = key;
    const message = isRest
      ? `Round ${currentRound} complete. Rest now.`
      : `Round ${currentRound}. Let's go!`;
    setCoachMessage(message);
    speak(message, 1, 1.18, voiceVolume);
  }, [
    currentRound,
    endCountdown,
    isRest,
    mode,
    remaining,
    speak,
    status,
    voiceVolume,
  ]);
  useEffect(() => {
    if (
      status !== "running" ||
      mode === "game" ||
      isRest ||
      (endCountdown > 0 && remaining <= endCountdown)
    )
      return;
    const milestone = Math.floor(progress / 25) * 25;
    if (
      milestone <= 0 ||
      milestone >= 100 ||
      milestone === lastMilestoneRef.current
    )
      return;
    lastMilestoneRef.current = milestone;
    const messages: { [key: number]: string } = {
      25: "Great start! Keep moving!",
      50: "Wonderful! You're halfway there!",
      75: "Amazing work! Finish strong!",
    };
    const message = messages[milestone];
    if (message) {
      setCoachMessage(message);
      speak(message, 1.04, 1.22, voiceVolume);
    }
  }, [
    endCountdown,
    isRest,
    mode,
    progress,
    remaining,
    speak,
    status,
    voiceVolume,
  ]);
  useEffect(() => {
    if (
      status !== "running" ||
      (endCountdown > 0 && remaining <= endCountdown) ||
      hypeEvery === 0 ||
      elapsed < hypeEvery ||
      elapsed % hypeEvery !== 0 ||
      lastHypeAtRef.current === elapsed
    )
      return;
    lastHypeAtRef.current = elapsed;
    const choice = rotateHype
      ? hypeOptions[hypeIndexRef.current++ % hypeOptions.length]
      : hypeChoice;
    setHypeActive(true);
    if (choice.id === "team") {
      const hype = hypeAudioRef.current;
      if (!hype) return;
      hype.currentTime = 0;
      hype.volume = muted ? 0 : voiceVolume / 100;
      hype.play().catch(() => setHypeActive(false));
      return;
    }
    speak(choice.text, 1.08, 1.35, voiceVolume);
    setTimeout(() => setHypeActive(false), 3400);
  }, [
    elapsed,
    endCountdown,
    hypeChoice,
    hypeEvery,
    muted,
    remaining,
    rotateHype,
    speak,
    status,
    voiceVolume,
  ]);
  useEffect(() => {
    if (
      status !== "running" ||
      endCountdown === 0 ||
      remaining > endCountdown ||
      remaining < 1 ||
      lastSpokenRef.current === remaining
    )
      return;
    if (remaining === endCountdown && hypeAudioRef.current) {
      hypeAudioRef.current.pause();
      hypeAudioRef.current.currentTime = 0;
      setHypeActive(false);
    }
    lastSpokenRef.current = remaining;
    if (effectsEnabled && "vibrate" in navigator)
      navigator.vibrate(remaining <= 3 ? 90 : 35);
    speak(String(remaining), 1.18, 0.9, countdownVolume);
  }, [countdownVolume, effectsEnabled, endCountdown, remaining, speak, status]);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const normalVolume = Math.min(1, (musicVolume / 100) * 1.1),
      finalMusicVolume = normalVolume * (0.25 + remaining * 0.045);
    audio.volume = muted
      ? 0
      : finalCountdown
        ? finalMusicVolume
        : isRest
          ? normalVolume * 0.42
          : hypeActive
            ? normalVolume * 0.32
            : normalVolume;
    audio.playbackRate = finalCountdown
      ? 0.88 + remaining * 0.012
      : isRest
        ? 0.92
        : hypeActive
          ? 0.94
          : 1 + intensity * 0.14;
    if (status === "running") audio.play().catch(() => {});
    else audio.pause();
  }, [
    finalCountdown,
    hypeActive,
    intensity,
    isRest,
    musicVolume,
    muted,
    remaining,
    status,
    trackId,
  ]);
  useEffect(() => {
    if (remaining !== 0 || status !== "running") return;
    if (finishingRef.current) return;
    finishingRef.current = true;
    setHypeActive(false);
    if (hypeAudioRef.current) hypeAudioRef.current.pause();
    if (effectsEnabled && "vibrate" in navigator)
      navigator.vibrate([220, 100, 450]);
    playWhistle();
    const message =
      mode === "game"
        ? "Stop!"
        : `Workout complete! Wonderful! You burned approximately ${estimatedTotalCalories} calories.`;
    setCoachMessage(message);
    const finishTimer = window.setTimeout(() => {
      stopMusic();
      setStatus("finished");
      finishingRef.current = false;
    }, 1500);
    const voiceTimer = window.setTimeout(
      () => speak(message, 0.82, 1.12, countdownVolume),
      1100,
    );
    return () => {
      window.clearTimeout(finishTimer);
      window.clearTimeout(voiceTimer);
    };
  }, [
    countdownVolume,
    effectsEnabled,
    estimatedTotalCalories,
    mode,
    playWhistle,
    remaining,
    speak,
    status,
    stopMusic,
  ]);
  useEffect(() => {
    if (status === "ready") setRemaining(total);
  }, [status, total]);
  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const start = async () => {
    if (starting || status === "counting") return;
    setStarting(true);
    try {
      const audio = audioRef.current;
      if (!audio) throw new Error("Audio unavailable");
      const whistle = whistleAudioRef.current;
      if (whistle) {
        whistle.volume = 0;
        whistle
          .play()
          .then(() => {
            whistle.pause();
            whistle.currentTime = 0;
            whistle.volume = muted ? 0 : whistleVolume / 100;
          })
          .catch(() => {});
      }
      const fresh = status === "ready" || status === "finished";
      if (fresh) {
        setRemaining(total);
        finishingRef.current = false;
        lastSpokenRef.current = null;
        lastHypeAtRef.current = 0;
        lastPhaseRef.current = "";
        lastMilestoneRef.current = 0;
        hypeIndexRef.current = 0;
        setCoachMessage(
          mode === "game" ? "Game ready" : "Your AI coach is ready",
        );
        audio.currentTime = 0;
      }
      if (fresh) {
        setStatus("counting");
        for (let cue = startCountdown; cue >= 1; cue--) {
          setStartCue(String(cue));
          speak(String(cue), 1.12, 0.92, countdownVolume);
          if (effectsEnabled && "vibrate" in navigator) navigator.vibrate(55);
          await wait(850);
        }
        setStartCue("GO!");
        speak(
          mode === "game" ? "Go!" : "Workout started. Let's go!",
          1,
          1.12,
          countdownVolume,
        );
        await wait(500);
      }
      if (!whistleContextRef.current)
        whistleContextRef.current = new AudioContext();
      await whistleContextRef.current.resume();
      if (audio.readyState < 3)
        await new Promise<void>((resolve, reject) => {
          const ready = () => {
              cleanup();
              resolve();
            },
            failed = () => {
              cleanup();
              reject(new Error("Music could not load"));
            },
            timeout = setTimeout(failed, 10000),
            cleanup = () => {
              clearTimeout(timeout);
              audio.removeEventListener("canplay", ready);
              audio.removeEventListener("error", failed);
            };
          audio.addEventListener("canplay", ready, { once: true });
          audio.addEventListener("error", failed, { once: true });
          audio.load();
        });
      audio.volume = muted ? 0 : Math.min(1, (musicVolume / 100) * 1.1);
      audio.playbackRate = 1;
      await audio.play();
      setStatus("running");
      setStartCue(null);
    } catch {
      setStatus("ready");
      setStartCue(null);
      alert(
        "Music load nahi ho saka. Internet check karke dobara Start karein.",
      );
    } finally {
      setStarting(false);
    }
  };
  const pause = () => {
    audioRef.current?.pause();
    hypeAudioRef.current?.pause();
    speechSynthesis?.cancel();
    setHypeActive(false);
    setStatus("paused");
  };
  const reset = () => {
    finishingRef.current = false;
    stopMusic();
    if (audioRef.current) audioRef.current.currentTime = 0;
    if (hypeAudioRef.current) {
      hypeAudioRef.current.pause();
      hypeAudioRef.current.currentTime = 0;
    }
    if (whistleAudioRef.current) {
      whistleAudioRef.current.pause();
      whistleAudioRef.current.currentTime = 0;
    }
    speechSynthesis?.cancel();
    setStartCue(null);
    setHypeActive(false);
    lastHypeAtRef.current = 0;
    lastPhaseRef.current = "";
    lastMilestoneRef.current = 0;
    setCoachMessage("Ready when you are");
    setStatus("ready");
    setRemaining(total);
  };
  const selectMode = (next: Mode) => {
    if (status === "running" || status === "counting") return;
    setMode(next);
    if (next === "workout") {
      setWorkSeconds(45);
      setRestSeconds(15);
      setRounds(8);
      setActivityId("general");
    }
    if (next === "hiit") {
      setWorkSeconds(40);
      setRestSeconds(20);
      setRounds(10);
      setActivityId("hiit");
    }
    if (next === "boxing") {
      setWorkSeconds(180);
      setRestSeconds(60);
      setRounds(3);
      setActivityId("boxing");
    }
    if (next === "custom") {
      setWorkSeconds(30);
      setRestSeconds(15);
      setRounds(5);
    }
    setStatus("ready");
  };
  const testVoice = () => {
    setHypeActive(true);
    if (hypeId === "team") {
      const hype = hypeAudioRef.current;
      if (!hype) return;
      hype.currentTime = 0;
      hype.volume = muted ? 0 : voiceVolume / 100;
      hype.play().catch(() => setHypeActive(false));
    } else {
      speak(hypeChoice.text, 1.08, 1.35, voiceVolume);
      setTimeout(() => setHypeActive(false), 3400);
    }
  };
  const toggleFullscreen = () => {
    if (!document.fullscreenElement)
      document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  };
  const install = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
      return;
    }
    alert(
      /iphone|ipad|ipod/i.test(navigator.userAgent)
        ? "Safari mein Share dabayen, phir ‘Add to Home Screen’ select karein."
        : "Browser menu (⋮) mein ‘Install app’ ya ‘Add to Home screen’ select karein.",
    );
  };
  const chooseTrack = (id: string) => {
    previewAudioRef.current?.pause();
    setPreviewingId(null);
    setTrackId(id);
  };
  const previewTrack = async (t: Track) => {
    if (status === "running" || status === "counting") return;
    const preview = previewAudioRef.current;
    if (!preview) return;
    if (previewingId === t.id) {
      preview.pause();
      setPreviewingId(null);
      return;
    }
    audioRef.current?.pause();
    preview.src = t.src;
    preview.currentTime = 0;
    preview.volume = muted ? 0 : Math.min(1, musicVolume / 100);
    try {
      await preview.play();
      setPreviewingId(t.id);
    } catch {
      alert("Is audio ka preview play nahi ho saka.");
    }
  };
  const addCustomTrack = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      alert("Please audio file select karein (MP3, M4A, WAV etc.).");
      return;
    }
    if (file.size > 80 * 1024 * 1024) {
      alert("Audio file 80 MB se chhoti honi chahiye.");
      return;
    }
    if (customTrack?.src.startsWith("blob:"))
      URL.revokeObjectURL(customTrack.src);
    const src = URL.createObjectURL(file),
      name = file.name.replace(/\.[^.]+$/, "");
    const added: Track = {
      id: "custom",
      name: name || "My Music",
      style: "Your phone • Custom audio",
      emoji: "🎧",
      color: "#34d399",
      src,
      base: 100,
    };
    setCustomTrack(added);
    setTrackId(added.id);
    setPreviewingId(null);
  };
  const updateTeam = (id: string, changes: Partial<Team>) =>
    setTeams((current) =>
      current.map((team) => (team.id === id ? { ...team, ...changes } : team)),
    );
  const addTeam = () =>
    setTeams((current) => [
      ...current,
      {
        id: `team-${Date.now()}`,
        name: `Team ${current.length + 1}`,
        image: null,
        members: [""],
      },
    ]);
  const removeTeam = (id: string) =>
    setTeams((current) =>
      current.length > 1 ? current.filter((team) => team.id !== id) : current,
    );
  const addTeamMember = (id: string) =>
    setTeams((current) =>
      current.map((team) =>
        team.id === id ? { ...team, members: [...team.members, ""] } : team,
      ),
    );
  const updateTeamMember = (id: string, index: number, name: string) =>
    setTeams((current) =>
      current.map((team) =>
        team.id === id
          ? {
              ...team,
              members: team.members.map((member, memberIndex) =>
                memberIndex === index ? name : member,
              ),
            }
          : team,
      ),
    );
  const removeTeamMember = (id: string, index: number) =>
    setTeams((current) =>
      current.map((team) =>
        team.id === id
          ? {
              ...team,
              members:
                team.members.length > 1
                  ? team.members.filter(
                      (_, memberIndex) => memberIndex !== index,
                    )
                  : [""],
            }
          : team,
      ),
    );
  const setTeamImage = (id: string, file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("Team picture 8 MB se chhoti honi chahiye.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateTeam(id, { image: String(reader.result) });
    reader.readAsDataURL(file);
  };
  const countdownPalette = [
      "#ff5f6d",
      "#ffb347",
      "#ffe259",
      "#42e695",
      "#38bdf8",
      "#8b5cf6",
      "#ec4899",
    ],
    countdownColor = countdownPalette[remaining % countdownPalette.length];
  const mm = Math.floor(displayRemaining / 60)
      .toString()
      .padStart(2, "0"),
    ss = (displayRemaining % 60).toString().padStart(2, "0");
  return (
    <main
      className={`app ${lightTheme ? "theme-light" : ""} ${effectsEnabled && finalCountdown ? "final-flash" : ""}`}
      style={
        {
          "--track": track.color,
          "--countdown": countdownColor,
        } as React.CSSProperties
      }
    >
      <audio ref={audioRef} src={track.src} loop preload="auto" />
      <audio
        ref={previewAudioRef}
        preload="metadata"
        onEnded={() => setPreviewingId(null)}
      />
      <audio
        ref={hypeAudioRef}
        src="/audio/team-announcer-v2.mp3"
        preload="auto"
        onEnded={() => setHypeActive(false)}
      />
      <audio
        ref={whistleAudioRef}
        src="/audio/end-referee-whistle.mp3"
        preload="auto"
      />
      {startCue ? (
        <div className="start-cue" key={startCue}>
          {startCue}
        </div>
      ) : null}
      {hypeActive ? (
        <div className="hype-banner">
          <b>{hypeChoice.title.toUpperCase()}!</b>
          <span>KEEP GOING</span>
        </div>
      ) : null}
      {finalCountdown && remaining > 0 ? (
        <div className="countdown-flash" key={remaining}>
          <small>FINAL COUNTDOWN</small>
          <b>{remaining}</b>
        </div>
      ) : null}
      {walkToast ? (
        <div className="walk-toast">
          <Footprints size={16} /> Walking detected — counting steps
        </div>
      ) : null}
      {sedentaryToast ? (
        <div className="sedentary-toast">
          <BellRing size={16} />
          <span>
            <b>Time to move!</b>
            <small>Aap kaafi dair se baithe hain — thoda chal kar aayein.</small>
          </span>
          <button onClick={() => setSedentaryToast(false)} aria-label="Dismiss">
            <X size={13} />
          </button>
        </div>
      ) : null}
      {stepsOpen ? (
        <div
          className="steps-overlay"
          onClick={() => {
            setStepsOpen(false);
            setStepsSettingsOpen(false);
          }}
        >
          <div className="steps-modal" onClick={(e) => e.stopPropagation()}>
            {!stepsSettingsOpen ? (
              <>
                <div className="steps-modal-head">
                  <span>
                    <Footprints size={18} /> Step Counter
                  </span>
                  <span className="steps-head-actions">
                    <button
                      className="steps-close"
                      onClick={() => setStepsSettingsOpen(true)}
                      aria-label="Step counter settings"
                      title="Settings"
                    >
                      <Settings2 size={15} />
                    </button>
                    <button className="steps-close" onClick={() => setStepsOpen(false)} aria-label="Close">
                      <X size={16} />
                    </button>
                  </span>
                </div>
                <div className={`steps-net-note ${isOnline ? "online" : "offline"}`}>
                  {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                  {isOnline ? "Online" : "Offline"} — steps keep counting either way, saved on this device
                </div>
                <div className="steps-count-display">
                  <b>{stepCount.toLocaleString()}</b>
                  <small>steps today {stepTracking ? "· auto-tracking on" : ""}</small>
                </div>
                <div className="steps-stats">
                  <div>
                    <b>{stepDistanceKm.toFixed(2)} km</b>
                    <small>Distance</small>
                  </div>
                  <div>
                    <b>{stepCalories}</b>
                    <small>Calories</small>
                  </div>
                </div>
                {needsMotionTap && stepSupport !== "supported" ? (
                  <div className="steps-tap-banner">
                    <Footprints size={16} />
                    <span>
                      <b>Automatic walk detection off</b>
                      <small>iPhone ko ek baar motion access allow karna hoga</small>
                    </span>
                    <button onClick={startStepTracking}>Enable</button>
                  </div>
                ) : null}
                {stepSupport === "unsupported" ? (
                  <p className="steps-warning">
                    Is device/browser mein motion sensor available nahi hai. Neeche se steps manually add kar sakte
                    hain.
                  </p>
                ) : stepSupport === "denied" ? (
                  <p className="steps-warning">
                    Motion sensor ki permission nahi mili. Browser settings se allow karke dobara try karein, ya
                    neeche manually steps add karein.
                  </p>
                ) : null}
                <div className="steps-actions">
                  {!stepTracking ? (
                    <button className="steps-primary" onClick={startStepTracking}>
                      <Play size={16} fill="currentColor" /> Start tracking
                    </button>
                  ) : (
                    <button className="steps-primary steps-stop" onClick={stopStepTracking}>
                      <Pause size={16} fill="currentColor" /> Stop tracking
                    </button>
                  )}
                  <button className="steps-reset" onClick={resetSteps}>
                    <RotateCcw size={15} /> Reset
                  </button>
                </div>
                <div className="steps-manual">
                  <span>Log steps manually</span>
                  <div className="steps-manual-row">
                    <input
                      type="number"
                      min="0"
                      max="200000"
                      placeholder="e.g. 4500"
                      value={stepManualInput}
                      onChange={(e) => setStepManualInput(e.target.value)}
                    />
                    <button onClick={applyManualSteps}>Set</button>
                  </div>
                </div>
                <p className="steps-hint">
                  Chalte waqt app khud walk detect karke automatically count shuru kar deta hai (vibration se pata bhi
                  chal jata hai). Yeh feature poori tarah is device par chalta hai, isliye internet ke bina (offline)
                  bhi kaam karta hai.
                </p>
              </>
            ) : (
              <>
                <div className="steps-modal-head">
                  <span>
                    <Settings2 size={17} /> Step Counter Settings
                  </span>
                  <button className="steps-close" onClick={() => setStepsSettingsOpen(false)} aria-label="Back">
                    <ArrowLeft size={16} />
                  </button>
                </div>
                <div className="steps-settings-list">
                  <label className="steps-setting-row">
                    <span>
                      <b>Auto-detect walking</b>
                      <small>App khud khol kar chalna detect kar le, "Start" dabane ki zarurat na ho</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={stepAutoDetect}
                      onChange={(e) => {
                        setStepAutoDetect(e.target.checked);
                        if (!e.target.checked) stopStepTracking();
                      }}
                    />
                  </label>
                  <label className="steps-setting-row">
                    <span>
                      <b>
                        <Vibrate size={13} /> Vibrate on walk detected
                      </b>
                      <small>Jab walking shuru ho ya reminder aaye to phone vibrate ho</small>
                    </span>
                    <input type="checkbox" checked={stepVibrate} onChange={(e) => setStepVibrate(e.target.checked)} />
                  </label>
                  <label className="steps-setting-row">
                    <span>
                      <b>Sedentary reminders</b>
                      <small>Bohat dair baithe rehne par yaad dilaye ke thoda chal ke aayein</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={sedentaryEnabled}
                      onChange={(e) => setSedentaryEnabled(e.target.checked)}
                    />
                  </label>
                  {sedentaryEnabled ? (
                    <div className="steps-setting-row steps-setting-select">
                      <span>
                        <b>Remind me after</b>
                      </span>
                      <div className="steps sedentary-steps">
                        {[30, 45, 60, 90].map((m) => (
                          <button
                            key={m}
                            className={sedentaryMinutes === m ? "active" : ""}
                            onClick={() => setSedentaryMinutes(m)}
                          >
                            {m}m
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="steps-notify-row">
                    {notifyPermission === "granted" ? (
                      <span className="steps-notify-status granted">
                        <Bell size={13} /> Notifications enabled
                      </span>
                    ) : notifyPermission === "unsupported" ? (
                      <span className="steps-notify-status">
                        <BellOff size={13} /> Notifications not supported here
                      </span>
                    ) : (
                      <button className="steps-reset" onClick={enableStepNotifications}>
                        <Bell size={14} /> Enable browser notifications
                      </button>
                    )}
                  </div>
                </div>
                <p className="steps-hint">
                  Notifications aur vibration sirf tab kaam karte hain jab yeh app khuli/mounted ho (ya installed app
                  ke background tab ke roop mein) — phone ke bilkul band hone par nahi.
                </p>
              </>
            )}
          </div>
        </div>
      ) : null}
      <div className="glow" />
      <div className="app-frame">
        <header className="header">
          <div className="logo">
            <span>
              <Activity size={21} />
            </span>
            <div>
              MOVE<b>BEAT</b>
              <small>SMART GAME TIMER</small>
            </div>
          </div>
          <div className="header-actions">
            {session ? (
              <>
                <a className="login-link" href="/account" title="Account & uploads">
                  {profile?.is_admin ? <Crown size={16} /> : <UserRound size={16} />}
                  <em>{profile?.display_name || "Account"}</em>
                </a>
                <button onClick={signOutOfAccount} aria-label="Sign out" title="Sign out">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <a className="login-link" href="/account">
                <LogIn size={16} />
                <em>Login</em>
              </a>
            )}
            <button
              className={`steps-header-btn${stepTracking ? " tracking" : ""}`}
              onClick={() => setStepsOpen(true)}
              title="Step Counter"
            >
              <span className="steps-header-icon">
                <Footprints size={20} />
              </span>
              <em>{stepCount.toLocaleString()} Steps</em>
            </button>
            <button onClick={install}>
              <Download size={16} /> <em>Install App</em>
            </button>
            <button onClick={toggleFullscreen} aria-label="Fullscreen">
              <Expand size={18} />
            </button>
            <button
              onClick={() => setLightTheme(!lightTheme)}
              aria-label={lightTheme ? "Use dark theme" : "Use light theme"}
              title={lightTheme ? "Dark theme" : "Light theme"}
            >
              {lightTheme ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button onClick={() => setMuted(!muted)} aria-label="Mute">
              {muted ? <VolumeX /> : <Volume2 />}
            </button>
          </div>
        </header>
        <nav className="mode-bar" aria-label="Activity mode">
          {modes.map(([id, title, subtitle, icon]) => (
            <button
              key={id}
              className={mode === id ? "active" : ""}
              disabled={status === "running" || status === "counting"}
              onClick={() => selectMode(id)}
            >
              {icon}
              <span>
                <b>{title}</b>
                <small>{subtitle}</small>
              </span>
            </button>
          ))}
        </nav>
        <div className="workspace">
          <section className="timer-zone">
            <div className="now-playing">
              <span className="cover">{track.emoji}</span>
              <div>
                <small>NOW PLAYING</small>
                <strong>{track.name}</strong>
              </div>
              <span className={`music-state ${status}`}>
                <i />
                {status === "running"
                  ? "MUSIC PLAYING"
                  : status === "paused"
                    ? "PAUSED"
                    : "READY"}
              </span>
              <div
                className={`equalizer ${status === "running" ? "active" : ""}`}
              >
                {[1, 2, 3, 4].map((n) => (
                  <i key={n} />
                ))}
              </div>
            </div>
            {mode === "game" ? (
              <div className="team-scoreboard">
                {teams.map((team, teamIndex) => (
                  <div className="team-live-card" key={team.id}>
                    <div className="team-live-avatar">
                      {team.image ? (
                        <img src={team.image} alt={`${team.name} team`} />
                      ) : (
                        <span>
                          {team.name.trim().charAt(0) || teamIndex + 1}
                        </span>
                      )}
                    </div>
                    <div>
                      <small>TEAM {teamIndex + 1}</small>
                      <b>{team.name.trim() || `Team ${teamIndex + 1}`}</b>
                      <p>
                        {team.members.filter((member) => member.trim()).length
                          ? team.members
                              .filter((member) => member.trim())
                              .join(" • ")
                          : "Add team members below"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            {mode !== "game" ? (
              <div className={`phase-pill ${isRest ? "rest" : "work"}`}>
                <span>{isRest ? "RECOVERY" : "ACTIVE"}</span>
                <b>
                  ROUND {currentRound} / {rounds}
                </b>
                <em>{calories} KCAL</em>
              </div>
            ) : null}
            <div className={`clock ${status} ${isRest ? "rest-clock" : ""}`}>
              <span>{mm}</span>
              <i>:</i>
              <span>{ss}</span>
            </div>
            <div className="tempo-row">
              <span className={`live-dot ${status}`} />
              <b>
                {status === "finished"
                  ? mode === "game"
                    ? "TIME UP"
                    : "WORKOUT COMPLETE"
                  : status === "paused"
                    ? "PAUSED"
                    : status === "running"
                      ? mode !== "game"
                        ? isRest
                          ? "REST & BREATHE"
                          : coachMessage
                        : speedEnabled
                          ? `LEVEL ${stage} OF ${totalStages}`
                          : "STEADY SPEED"
                      : "READY"}
              </b>
              <strong>
                {status === "running"
                  ? `${bpm} BPM`
                  : mode === "game"
                    ? "SET YOUR ROUND"
                    : `≈ ${estimatedTotalCalories} KCAL`}
              </strong>
            </div>
            <div className="progress">
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="controls">
              <button className="reset" onClick={reset} disabled={starting}>
                <RotateCcw />
              </button>
              {status === "running" ? (
                <button className="primary pause" onClick={pause}>
                  <Pause fill="currentColor" />
                  Pause
                </button>
              ) : (
                <button className="primary" onClick={start} disabled={starting}>
                  {starting ? (
                    <span className="button-loader" />
                  ) : (
                    <Play fill="currentColor" />
                  )}
                  {status === "counting"
                    ? "Get ready…"
                    : starting && status !== "paused"
                      ? "Preparing…"
                      : status === "paused"
                        ? "Resume"
                        : status === "finished"
                          ? "Do it again"
                          : mode === "game"
                            ? "Start game"
                            : "Start workout"}
                </button>
              )}
            </div>
            {status === "finished" && mode !== "game" ? (
              <div className="finish-summary">
                <Sparkles />
                <div>
                  <small>WONDERFUL!</small>
                  <h3>Workout complete</h3>
                  <p>
                    You finished {rounds} rounds and burned approximately{" "}
                    <b>{estimatedTotalCalories} calories.</b>
                  </p>
                </div>
              </div>
            ) : null}
            {mode !== "game" ? (
              <div className="workout-builder">
                <div className="settings-heading">
                  <Bot size={16} />
                  AI WORKOUT SETUP
                </div>
                <div className="workout-grid">
                  <label>
                    <span>Exercise</span>
                    <select
                      value={activityId}
                      disabled={status === "running" || status === "counting"}
                      onChange={(e) => setActivityId(e.target.value)}
                    >
                      {activities.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Your weight</span>
                    <div className="unit-input">
                      <input
                        type="number"
                        min="30"
                        max="250"
                        value={weight}
                        disabled={status === "running" || status === "counting"}
                        onChange={(e) =>
                          setWeight(clamp(+e.target.value, 30, 250))
                        }
                      />
                      <b>KG</b>
                    </div>
                  </label>
                  <label>
                    <span>Active time</span>
                    <div className="unit-input">
                      <input
                        type="number"
                        min="5"
                        max="900"
                        value={workSeconds}
                        disabled={status === "running" || status === "counting"}
                        onChange={(e) =>
                          setWorkSeconds(clamp(+e.target.value, 5, 900))
                        }
                      />
                      <b>SEC</b>
                    </div>
                  </label>
                  <label>
                    <span>Rest time</span>
                    <div className="unit-input">
                      <input
                        type="number"
                        min="0"
                        max="600"
                        value={restSeconds}
                        disabled={status === "running" || status === "counting"}
                        onChange={(e) =>
                          setRestSeconds(clamp(+e.target.value, 0, 600))
                        }
                      />
                      <b>SEC</b>
                    </div>
                  </label>
                  <label>
                    <span>Total rounds</span>
                    <div className="unit-input">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={rounds}
                        disabled={status === "running" || status === "counting"}
                        onChange={(e) =>
                          setRounds(clamp(+e.target.value, 1, 50))
                        }
                      />
                      <b>RDS</b>
                    </div>
                  </label>
                  <div className="calorie-preview">
                    <Flame />
                    <span>
                      <small>ESTIMATED BURN</small>
                      <b>{estimatedTotalCalories} kcal</b>
                    </span>
                  </div>
                </div>
                <p className="estimate-note">
                  Calories are an estimate based on exercise, time and body
                  weight.
                </p>
              </div>
            ) : null}
            {mode === "game" ? (
              <div className="team-builder">
                <div className="team-builder-heading">
                  <div>
                    <span>
                      <Users size={16} /> TEAM SETUP
                    </span>
                    <small>
                      Add team pictures and as many members as you need
                    </small>
                  </div>
                  <button
                    type="button"
                    onClick={addTeam}
                    disabled={status === "running" || status === "counting"}
                  >
                    <Plus size={14} /> Add team
                  </button>
                </div>
                <div className="team-editor-grid">
                  {teams.map((team, teamIndex) => (
                    <div className="team-editor" key={team.id}>
                      <div className="team-editor-top">
                        <label className="team-photo-picker">
                          <input
                            type="file"
                            accept="image/*"
                            disabled={
                              status === "running" || status === "counting"
                            }
                            onChange={(event) => {
                              setTeamImage(team.id, event.target.files?.[0]);
                              event.currentTarget.value = "";
                            }}
                          />
                          {team.image ? (
                            <img
                              src={team.image}
                              alt={`${team.name} preview`}
                            />
                          ) : (
                            <ImagePlus size={20} />
                          )}
                          <small>PHOTO</small>
                        </label>
                        <label className="team-name-field">
                          <span>Team {teamIndex + 1} name</span>
                          <input
                            value={team.name}
                            maxLength={30}
                            disabled={
                              status === "running" || status === "counting"
                            }
                            onChange={(event) =>
                              updateTeam(team.id, { name: event.target.value })
                            }
                            placeholder={`Team ${teamIndex + 1}`}
                          />
                        </label>
                        <button
                          type="button"
                          className="remove-team"
                          aria-label={`Remove ${team.name}`}
                          disabled={
                            teams.length === 1 ||
                            status === "running" ||
                            status === "counting"
                          }
                          onClick={() => removeTeam(team.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div className="member-list">
                        {team.members.map((member, memberIndex) => (
                          <div
                            className="member-row"
                            key={`${team.id}-${memberIndex}`}
                          >
                            <span>{memberIndex + 1}</span>
                            <input
                              value={member}
                              maxLength={40}
                              disabled={
                                status === "running" || status === "counting"
                              }
                              onChange={(event) =>
                                updateTeamMember(
                                  team.id,
                                  memberIndex,
                                  event.target.value,
                                )
                              }
                              placeholder="Member name"
                            />
                            <button
                              type="button"
                              aria-label="Remove member"
                              disabled={
                                status === "running" || status === "counting"
                              }
                              onClick={() =>
                                removeTeamMember(team.id, memberIndex)
                              }
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="add-member"
                        disabled={status === "running" || status === "counting"}
                        onClick={() => addTeamMember(team.id)}
                      >
                        <UserPlus size={14} /> Add member
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="settings">
              <div className="settings-heading">
                <Settings2 size={16} />
                {mode === "game"
                  ? "PRO GAME SETTINGS"
                  : "MUSIC & COACH SETTINGS"}
              </div>
              {mode === "game" ? (
                <div className="setting-grid">
                  <label>
                    <span>Game duration</span>
                    <div className="time-fields">
                      <input
                        aria-label="Minutes"
                        type="number"
                        min="0"
                        max="60"
                        value={minutes}
                        disabled={status === "running" || status === "counting"}
                        onChange={(e) =>
                          setMinutes(clamp(+e.target.value, 0, 60))
                        }
                      />
                      <small>MIN</small>
                      <b>:</b>
                      <input
                        aria-label="Seconds"
                        type="number"
                        min="0"
                        max="59"
                        value={seconds}
                        disabled={status === "running" || status === "counting"}
                        onChange={(e) =>
                          setSeconds(clamp(+e.target.value, 0, 59))
                        }
                      />
                      <small>SEC</small>
                    </div>
                  </label>
                  <label>
                    <span>Speed up every</span>
                    <div className="steps">
                      {[0, 30, 40, 50].map((n) => (
                        <button
                          key={n}
                          disabled={
                            status === "running" || status === "counting"
                          }
                          className={changeEvery === n ? "active" : ""}
                          onClick={() => setChangeEvery(n)}
                        >
                          {n === 0 ? "OFF" : `${n}s`}
                        </button>
                      ))}
                    </div>
                  </label>
                </div>
              ) : null}
              <div className="start-countdown-setting">
                <div>
                  <span>Start countdown</span>
                  <small>Choose how long you need to get ready</small>
                </div>
                <div className="steps countdown-presets">
                  {[0, 3, 5, 10, 15].map((n) => (
                    <button
                      key={n}
                      type="button"
                      disabled={status === "running" || status === "counting"}
                      className={startCountdown === n ? "active" : ""}
                      onClick={() => setStartCountdown(n)}
                    >
                      {n === 0 ? "OFF" : `${n}s`}
                    </button>
                  ))}
                </div>
                <label>
                  <span>Custom</span>
                  <input
                    aria-label="Custom start countdown seconds"
                    type="number"
                    min="0"
                    max="60"
                    value={startCountdown}
                    disabled={status === "running" || status === "counting"}
                    onChange={(e) =>
                      setStartCountdown(clamp(+e.target.value || 0, 0, 60))
                    }
                  />
                  <small>SEC</small>
                </label>
              </div>
              <div className="start-countdown-setting end-countdown-setting">
                <div>
                  <span>End countdown</span>
                  <small>Choose when the final voice countdown begins</small>
                </div>
                <div className="steps countdown-presets">
                  {[0, 3, 5, 10, 15].map((n) => (
                    <button
                      key={n}
                      type="button"
                      disabled={status === "running" || status === "counting"}
                      className={endCountdown === n ? "active" : ""}
                      onClick={() => setEndCountdown(n)}
                    >
                      {n === 0 ? "OFF" : `${n}s`}
                    </button>
                  ))}
                </div>
                <label>
                  <span>Custom</span>
                  <input
                    aria-label="Custom end countdown seconds"
                    type="number"
                    min="0"
                    max="60"
                    value={endCountdown}
                    disabled={status === "running" || status === "counting"}
                    onChange={(e) =>
                      setEndCountdown(clamp(+e.target.value || 0, 0, 60))
                    }
                  />
                  <small>SEC</small>
                </label>
              </div>
              <div className="hype-settings">
                <div>
                  <span>
                    {mode === "game" ? "Hype voice" : "Coach motivation"}
                  </span>
                  <div className="hype-options">
                    {hypeOptions.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        disabled={status === "running" || status === "counting"}
                        className={hypeId === h.id ? "active" : ""}
                        onClick={() => setHypeId(h.id)}
                      >
                        <b>{h.title}</b>
                        <small>{h.text}</small>
                      </button>
                    ))}
                  </div>
                  <div className="hype-tools">
                    <button
                      onClick={testVoice}
                      disabled={status === "running" || status === "counting"}
                    >
                      <Mic2 size={13} />
                      Test voice
                    </button>
                    <button
                      className={rotateHype ? "active" : ""}
                      onClick={() => setRotateHype(!rotateHype)}
                      disabled={status === "running" || status === "counting"}
                    >
                      Rotate lines
                    </button>
                    <button
                      className={effectsEnabled ? "active" : ""}
                      onClick={() => setEffectsEnabled(!effectsEnabled)}
                    >
                      Vibration + flash
                    </button>
                  </div>
                </div>
                <div>
                  <span>Extra voice every</span>
                  <div className="steps hype-times">
                    {[0, 30, 45, 60].map((n) => (
                      <button
                        key={n}
                        disabled={status === "running" || status === "counting"}
                        className={hypeEvery === n ? "active" : ""}
                        onClick={() => setHypeEvery(n)}
                      >
                        {n === 0 ? "OFF" : `${n}s`}
                      </button>
                    ))}
                  </div>
                  <label className="custom-time">
                    <span>Custom seconds</span>
                    <input
                      type="number"
                      min="10"
                      max="600"
                      value={hypeEvery || ""}
                      disabled={status === "running" || status === "counting"}
                      placeholder="e.g. 75"
                      onChange={(e) =>
                        setHypeEvery(clamp(+e.target.value || 0, 0, 600))
                      }
                    />
                  </label>
                </div>
              </div>
              <div className="audio-mixer">
                <b>
                  <Volume2 size={14} /> AUDIO MIXER
                </b>
                {[
                  ["Music", musicVolume, setMusicVolume],
                  ["Voice", voiceVolume, setVoiceVolume],
                  ["Countdown", countdownVolume, setCountdownVolume],
                  ["Whistle", whistleVolume, setWhistleVolume],
                ].map(([label, value, setter]) => (
                  <label key={label as string}>
                    <span>{label as string}</span>
                    <Slider
                      value={[value as number]}
                      min={0}
                      max={100}
                      onValueChange={(v) =>
                        (setter as (n: number) => void)(v[0])
                      }
                    />
                    <em>{value as number}%</em>
                  </label>
                ))}
              </div>
            </div>
          </section>
          <aside className="library">
            <div className="library-title">
              <div>
                <small>
                  <Music2 size={15} /> MUSIC LIBRARY
                </small>
                <h2>Choose your vibe</h2>
              </div>
              <span>{allTracks.length} TRACKS</span>
            </div>
            <input
              ref={uploadRef}
              className="audio-file-input"
              type="file"
              accept="audio/*,.mp3,.m4a,.wav,.aac,.ogg"
              onChange={(e) => {
                addCustomTrack(e.target.files?.[0]);
                e.currentTarget.value = "";
              }}
            />
            <button
              className="upload-track"
              disabled={status === "running" || status === "counting"}
              onClick={() => uploadRef.current?.click()}
            >
              <Upload size={18} />
              <span>
                <b>Add your own music</b>
                <small>Browse audio from your phone</small>
              </span>
            </button>
            <div className="my-uploads-box">
              {!session ? (
                <a className="my-uploads-login" href="/account">
                  <UserRound size={14} /> Login to save your own music permanently
                </a>
              ) : (
                <>
                  <div className="my-uploads-head">
                    <span>
                      <Music2 size={13} /> My Uploads ({myUploads.length}/{MAX_USER_AUDIO_FILES})
                    </span>
                    <label
                      className={`my-uploads-btn${myUploadBusy || myUploads.length >= MAX_USER_AUDIO_FILES ? " disabled" : ""}`}
                    >
                      <Upload size={12} />
                      {myUploadBusy ? "Uploading…" : "Upload"}
                      <input
                        ref={myUploadRef}
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                          onMyUpload(e.target.files?.[0]);
                          e.currentTarget.value = "";
                        }}
                        disabled={myUploadBusy || myUploads.length >= MAX_USER_AUDIO_FILES}
                      />
                    </label>
                  </div>
                  <p className="my-uploads-note">
                    Saved to your account for 25 days · up to {MAX_USER_AUDIO_FILES} files, {(MAX_USER_AUDIO_BYTES / (1024 * 1024)).toFixed(0)}MB each.
                  </p>
                  {myUploadError && <p className="my-uploads-error">{myUploadError}</p>}
                </>
              )}
            </div>
            <div className="track-list">
              {allTracks.map((t, index) => (
                <div
                  key={t.id}
                  className={`track-row ${trackId === t.id ? "selected" : ""} ${t.id.startsWith("upload:") ? "has-delete" : ""}`}
                  style={{ "--item": t.color } as React.CSSProperties}
                >
                  <button
                    className="track-select"
                    disabled={status === "running" || status === "counting"}
                    onClick={() => chooseTrack(t.id)}
                  >
                    <span className="track-icon">{t.emoji}</span>
                    <span>
                      <b>{t.name}</b>
                      <small>{t.style}</small>
                    </span>
                    <em>
                      {trackId === t.id ? (
                        <>
                          <span /> SELECTED
                        </>
                      ) : (
                        `${String(index + 1).padStart(2, "0")}`
                      )}
                    </em>
                  </button>
                  <button
                    className={`track-preview ${previewingId === t.id ? "playing" : ""}`}
                    disabled={status === "running" || status === "counting"}
                    onClick={() => previewTrack(t)}
                    aria-label={`${previewingId === t.id ? "Pause" : "Preview"} ${t.name}`}
                  >
                    {previewingId === t.id ? (
                      <Pause size={15} fill="currentColor" />
                    ) : (
                      <Play size={15} fill="currentColor" />
                    )}
                  </button>
                  {t.id.startsWith("upload:") && (
                    <button
                      className="track-delete"
                      onClick={() => {
                        const row = myUploads.find((u) => `upload:${u.id}` === t.id);
                        if (row) deleteMyUpload(row);
                      }}
                      title="Delete this upload"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="offline-note">
              <Sparkles size={17} />
              <span>
                <b>Preview before playing</b>
                <small>
                  Built-in tracks work offline. Custom audio stays on your
                  device.
                </small>
              </span>
            </div>
          </aside>
        </div>
        <footer>
          <Activity size={15} /> Games, workouts and motivation—all moving to
          your beat <Trophy size={15} />
        </footer>
      </div>
    </main>
  );
}
