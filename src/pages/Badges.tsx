import { useState } from "react";
import { LevelBadge } from "../enums/LevelBadge";

interface Badge {
  id: number;
  title: string;
  description: string;
  image: string;
  unlocked: boolean;
  level: LevelBadge;
}

const LEVEL_STYLES: Record<LevelBadge, { card: string; title: string; glow: string }> = {
  [LevelBadge.BEGINNER]:     { card: "bg-green-50 border-green-300 shadow-green-100 hover:shadow-green-200",   title: "text-green-700",  glow: "hover:shadow-lg" },
  [LevelBadge.INTERMEDIATE]: { card: "bg-blue-50 border-blue-300 shadow-blue-100 hover:shadow-blue-200",       title: "text-blue-700",   glow: "hover:shadow-lg" },
  [LevelBadge.ADVANCED]:     { card: "bg-violet-50 border-violet-400 shadow-violet-100 hover:shadow-violet-200", title: "text-violet-700", glow: "hover:shadow-lg" },
  [LevelBadge.EXPERT]:       { card: "bg-amber-50 border-amber-400 shadow-amber-200 hover:shadow-amber-300",   title: "text-amber-700",  glow: "hover:shadow-lg" },
};

const LEVEL_BADGE_LABEL: Record<LevelBadge, string> = {
  [LevelBadge.BEGINNER]:     "bg-green-100 text-green-700",
  [LevelBadge.INTERMEDIATE]: "bg-blue-100 text-blue-700",
  [LevelBadge.ADVANCED]:     "bg-violet-100 text-violet-700",
  [LevelBadge.EXPERT]:       "bg-amber-100 text-amber-700",
};

const BADGES: Badge[] = [
  { id: 1,  title: "First Step", description: "Completed your first action",   image: "🏅", unlocked: true,  level: LevelBadge.BEGINNER },
  { id: 2,  title: "Explorer",   description: "Visited all sections",          image: "🧭", unlocked: true,  level: LevelBadge.BEGINNER },
  { id: 3,  title: "Gifted",     description: "Received your first gift",      image: "🎁", unlocked: true,  level: LevelBadge.INTERMEDIATE },
  { id: 4,  title: "Streak",     description: "7 days in a row",               image: "🔥", unlocked: false, level: LevelBadge.INTERMEDIATE },
  { id: 5,  title: "Collector",  description: "Unlocked 5 badges",             image: "💎", unlocked: false, level: LevelBadge.INTERMEDIATE },
  { id: 6,  title: "Veteran",    description: "30 days active",                image: "⚔️", unlocked: true, level: LevelBadge.ADVANCED },
  { id: 7,  title: "Generous",   description: "Sent 3 gifts",                  image: "🤝", unlocked: false, level: LevelBadge.ADVANCED },
  { id: 8,  title: "Night Owl",  description: "Active after midnight",         image: "🦉", unlocked: false, level: LevelBadge.ADVANCED },
  { id: 9,  title: "Speedster",  description: "Completed in record time",      image: "⚡", unlocked: true, level: LevelBadge.EXPERT },
  { id: 10, title: "Legend",     description: "Unlocked everything",           image: "👑", unlocked: false, level: LevelBadge.EXPERT },
];

const BadgeCard = ({ badge }: { badge: Badge }) => {
  const [hovered, setHovered] = useState(false);
  const styles = LEVEL_STYLES[badge.level];

  return (
    <div
      className="relative flex flex-col items-center gap-2 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`
          w-16 h-16 rounded-2xl flex items-center justify-center text-3xl
          transition-all duration-300 border-2 shadow-md
          ${badge.unlocked
            ? `${styles.card} ${styles.glow} hover:scale-110`
            : "bg-zinc-100 border-zinc-200 grayscale opacity-50 hover:scale-105"
          }
        `}
      >
        {badge.unlocked ? badge.image : "❓"}
      </div>

      {/* Level pill */}
      {badge.unlocked && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${LEVEL_BADGE_LABEL[badge.level]}`}>
          {badge.level}
        </span>
      )}

      <span className={`text-xs font-semibold tracking-wide text-center ${badge.unlocked ? styles.title : "text-zinc-400"}`}>
        {badge.unlocked ? badge.title : "???"}
      </span>

      {hovered && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg bg-zinc-900 text-white pointer-events-none">
          {badge.unlocked ? badge.description : "Not unlocked yet"}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-zinc-900" />
        </div>
      )}
    </div>
  );
};

const Badges: React.FC = () => {
  const newBadges = BADGES.filter(b => b.unlocked); // replace with your real condition
  const [celebrationQueue, setCelebrationQueue] = useState<Badge[]>(
    true ? newBadges : []
  );
  const [current, setCurrent] = useState(0);
  const [exiting, setExiting] = useState(false);

  const celebrating = celebrationQueue.length > 0 && current < celebrationQueue.length;
  const activeBadge = celebrating ? celebrationQueue[current] : null;

  const handleNext = () => {
    setExiting(true);
    setTimeout(() => {
      setExiting(false);
      if (current + 1 >= celebrationQueue.length) {
        setCelebrationQueue([]);
      } else {
        setCurrent(prev => prev + 1);
      }
    }, 300);
  };

  const styles = activeBadge ? LEVEL_STYLES[activeBadge.level] : null;
  const isLast = current + 1 >= celebrationQueue.length;

  return (
    <div>
      {/* Celebration overlay */}
      {celebrating && activeBadge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={handleNext}
        >
          {/* Card */}
          <div
            className={`
              flex flex-col items-center gap-4 p-10 rounded-3xl border-2 shadow-2xl
              transition-all duration-300 cursor-pointer select-none
              ${exiting ? "opacity-0 scale-90 translate-y-4" : "opacity-100 scale-100 translate-y-0"}
              ${styles?.card}
            `}
            style={{ minWidth: 260 }}
            onClick={e => { e.stopPropagation(); handleNext(); }}
          >
            {/* Counter */}
            <span className="text-xs text-zinc-400 font-medium tracking-widest uppercase">
              {current + 1} / {celebrationQueue.length}
            </span>

            {/* Emoji */}
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-5xl border-2 shadow-md ${styles?.card}`}>
              {activeBadge.image}
            </div>

            {/* Level pill */}
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${LEVEL_BADGE_LABEL[activeBadge.level]}`}>
              {activeBadge.level}
            </span>

            <div className="flex flex-col items-center gap-1">
              <h2 className={`text-xl font-bold ${styles?.title}`}>{activeBadge.title}</h2>
              <p className="text-sm text-zinc-500 text-center">{activeBadge.description}</p>
            </div>

            <span className="text-xs text-zinc-400 mt-2">
              {isLast ? "Tap to finish" : "Tap for next"}
            </span>
          </div>

          {/* 🎉 particles (CSS only) */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl animate-bounce"
                style={{
                  left: `${8 + i * 8}%`,
                  top: `${10 + (i % 3) * 15}%`,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: `${0.8 + (i % 3) * 0.3}s`,
                  opacity: 0.7,
                }}
              >
                {["🎉", "✨", "🎊", "⭐"][i % 4]}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Normal badge grid */}
      {!celebrating && (
        <>
          <div className="grid grid-cols-5 gap-6 pt-15">
            {BADGES.map(badge => <BadgeCard key={badge.id} badge={badge} />)}
          </div>
          <p className="text-center text-xs text-zinc-400 mt-6">
            {BADGES.filter(b => b.unlocked).length} / {BADGES.length} unlocked
          </p>
        </>
      )}
    </div>
  );
};

export default Badges;