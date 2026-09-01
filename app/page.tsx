"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  Bike,
  Bot,
  Box,
  Dumbbell,
  Download,
  Expand,
  Flame,
  Gamepad2,
  ImagePlus,
  LogIn,
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
  Users,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

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
    id: "pink-panther",
    name: "Pink Panther Theme",
    style: "Sneaky • Classic",
    emoji: "🕵️",
    color: "#f472b6",
    src: "/audio/pink-panther-theme.mp3",
    base: 116,
  },
  {
    id: "gta-san-andreas",
    name: "GTA San Andreas Theme",
    style: "Urban • Gaming",
    emoji: "🎮",
    color: "#84cc16",
    src: "/audio/gta-san-andreas-theme.mp3",
    base: 100,
  },
  {
    id: "mingle-round",
    name: "Mingle: Round and Round",
    style: "Squid Game • Playful",
    emoji: "🎠",
    color: "#fb7185",
    src: "/audio/mingle-round-and-round.mp3",
    base: 108,
  },
  {
    id: "boruto-baku",
    name: "Boruto: Baku",
    style: "Anime • Action",
    emoji: "🥷",
    color: "#38bdf8",
    src: "/audio/boruto-baku.mp3",
    base: 112,
  },
  {
    id: "digimon-kuyashisa",
    name: "Digimon: Kuyashisa Wa Tane",
    style: "Anime • Adventure",
    emoji: "⚔️",
    color: "#f59e0b",
    src: "/audio/digimon-kuyashisa-wa-tane.mp3",
    base: 110,
  },
  {
    id: "squid-theme",
    name: "Squid Game Theme",
    style: "Suspense • Challenge",
    emoji: "🔺",
    color: "#ef4444",
    src: "/audio/squid-game-theme.mp3",
    base: 96,
  },
  {
    id: "alan-alone-dope",
    name: "Alone — IN DOPE",
    style: "Alan Walker • Electronic",
    emoji: "🌌",
    color: "#60a5fa",
    src: "/audio/alan-walker-alone-in-dope.mp3",
    base: 105,
  },
  {
    id: "alan-hope",
    name: "Hope",
    style: "Alan Walker • Motivational",
    emoji: "🌅",
    color: "#fbbf24",
    src: "/audio/alan-walker-hope.mp3",
    base: 104,
  },
  {
    id: "headlights-kiddo",
    name: "Headlights",
    style: "Alok & Alan Walker • KIDDO",
    emoji: "💡",
    color: "#22d3ee",
    src: "/audio/headlights-kiddo.mp3",
    base: 106,
  },
  {
    id: "headlights-2026",
    name: "Headlights 2026",
    style: "Alok & Alan Walker • Remix",
    emoji: "🚘",
    color: "#a78bfa",
    src: "/audio/headlights-kiddo-2026.mp3",
    base: 108,
  },
  {
    id: "headlights-extended",
    name: "Headlights — Extended Mix",
    style: "Alok & Alan Walker • Extended",
    emoji: "🎛️",
    color: "#34d399",
    src: "/audio/headlights-extended-mix.mp3",
    base: 107,
  },
  {
    id: "let-me-love-you",
    name: "Let Me Love You",
    style: "DJ Snake ft. Justin Bieber",
    emoji: "💙",
    color: "#fb7185",
    src: "/audio/let-me-love-you.mp3",
    base: 102,
  },
  {
    id: "waka-waka-2010",
    name: "Waka Waka — FIFA 2010",
    style: "Shakira • World Cup Energy",
    emoji: "⚽",
    color: "#22c55e",
    src: "/audio/waka-waka-fifa-2010.mp3",
    base: 128,
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
  const allTracks = customTrack ? [customTrack, ...tracks] : tracks,
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
      <div className="glow" />
      <div className="app-frame">
        <header className="header">
          <div className="logo">
            <span>
              <Activity size={21} />
            </span>
            <div>
              MOVE<b>BEAT</b>
              <small>AI ACTIVITY COACH</small>
            </div>
          </div>
          <div className="header-actions">
            <a className="login-link" href="/account">
              <LogIn size={16} />
              <em>Login</em>
            </a>
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
            <div className="track-list">
              {allTracks.map((t, index) => (
                <div
                  key={t.id}
                  className={`track-row ${trackId === t.id ? "selected" : ""}`}
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
