import { useEffect, useMemo, useState } from "react";
import { LevelBadge } from "../enums/LevelBadge";
import type { UserBadgesResponse } from "../responses/UserBadgesResponse";
import BadgeService from "../services/BadgeService";
import { toast } from "sonner";
import Loading from "../components/Loading";
import { HiOutlineXCircle } from "react-icons/hi2";
import type { UserBadge } from "../models/Badge";
import ErrorCardInApp from "../components/ErrorCardInApp";
import type { User } from "../models/User";

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

const BadgeCard = ({ badge, allBadges }: { badge: UserBadge, allBadges : string[] }) => {
  const [hovered, setHovered] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const styles = LEVEL_STYLES[badge.level_badge];
  const isUnlocked = allBadges.includes(badge.badge.uuid)

  useEffect(() => {
    fetch(badge.badge.badge_image_path, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`}
    })
      .then(res => res.blob())
      .then(blob => setImageSrc(URL.createObjectURL(blob)))
      .catch(console.error);

    return () => { if (imageSrc) URL.revokeObjectURL(imageSrc); };
  }, [badge.badge.badge_image_path]);

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
          ${badge
            ? `${styles?.card} ${styles?.glow} hover:scale-110`
            : "bg-zinc-100 border-zinc-200 grayscale opacity-50 hover:scale-105"
          }
        `}
      >
        {isUnlocked ? (
          imageSrc ? (
            <img src={imageSrc} alt={badge.badge.badge_title} className="w-10 h-10 object-contain" />
          ) : (
            "⏳"
          )
        ) : "❓"}
      </div>

      {/* Level pill */}
      {isUnlocked && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${LEVEL_BADGE_LABEL[badge.level_badge]}`}>
          {badge.level_badge}
        </span>
      )}

      <span className={`text-xs font-semibold tracking-wide text-center ${isUnlocked ? styles.title : "text-zinc-400"}`}>
        {isUnlocked ? badge.badge.badge_title : "???"}
      </span>

      {hovered && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg bg-zinc-900 text-white pointer-events-none">
          {isUnlocked ? badge.badge.badge_label : "Not unlocked yet"}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-zinc-900" />
        </div>
      )}
    </div>
  );
};

const Badges: React.FC = () => {
  const badgeService = BadgeService.getInstance()
  const [loading, setLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [badgesMetaData, setBadgesMetaData] = useState<UserBadgesResponse | null>(null)
  const [celebrationQueue, setCelebrationQueue] = useState<UserBadge[]>([]);
  const [current, setCurrent] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [showNoReward, setShowNoReward] = useState(false);

  useEffect(()=>{
    const getAllBadges = async () => {
      setLoading(true)
      try {
        const response = await badgeService.getAll()
        setBadgesMetaData(response)
        if(response.nextGiftDate != null) {
          const raw = localStorage.getItem("user");
          if (!raw) return;
          const user: User = JSON.parse(raw);
          user.timeMsGift = response.nextGiftDate;
          localStorage.setItem("user", JSON.stringify(user));
        }
        if (response.isNew && response.newBadges.length === 0) {
          setShowNoReward(true);
        }
        setCelebrationQueue(response.newBadges)
      }
      catch(error : any) {
        setHasError(true)
        toast.error(error.message)
      } finally {
         setLoading(false)
      }
    }
    getAllBadges()
  }, [])

  const celebrating = useMemo(() => celebrationQueue.length > 0 && current < celebrationQueue.length, [celebrationQueue, current]);
  const activeBadge = useMemo(() => celebrating ? celebrationQueue[current] : null, [celebrating, celebrationQueue, current]);
  const styles      = useMemo(() => activeBadge ? LEVEL_STYLES[activeBadge.level_badge as LevelBadge] : null, [activeBadge]);
  const isLast      = useMemo(() => current + 1 >= celebrationQueue.length, [current, celebrationQueue]);

  useEffect(() => {
    if (activeBadge == null) return;
    let objectUrl: string;
    fetch(activeBadge.badge.badge_image_path, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` }
    })
      .then(res => res.blob())
      .then(blob => {
        objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
      })
      .catch(console.error);

    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); }; // ✅ no stale state
  }, [activeBadge?.badge.badge_image_path]);

  if ( loading ) {
    return <Loading />
  }
  else if ( hasError || badgesMetaData == null ) {
    return <ErrorCardInApp
          iconBg="bg-gray-100"
          icon={<HiOutlineXCircle className="w-8 h-8 text-gray-400" />}
          title="Can't fetch badges"
          description="An error has occured try again later"
        />
  }

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
                {imageSrc ? (
                  <img src={imageSrc} alt={activeBadge.badge.badge_title} className="w-10 h-10 object-contain" />
                ) : (
                  "⏳"
                )}
              </div>

            {/* Level pill */}
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${LEVEL_BADGE_LABEL[activeBadge.level_badge]}`}>
              {activeBadge.level_badge}
            </span>

            <div className="flex flex-col items-center gap-1">
              <h2 className={`text-xl font-bold ${styles?.title}`}>{activeBadge.badge.badge_title}</h2>
              <p className="text-sm text-zinc-500 text-center">{activeBadge.badge.badge_label}</p>
            </div>

            <span className="text-xs text-zinc-400 mt-2">
              {isLast ? "Tap to finish" : "Tap for next"}
            </span>
          </div>
        </div>
      )}

      {/* Normal badge grid */}
      {!celebrating && (
        <>
          {showNoReward && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
              onClick={() => setShowNoReward(false)}
            >
              <div
                className="flex flex-col items-center gap-4 p-10 rounded-3xl border-2 border-zinc-200 bg-white shadow-2xl cursor-pointer select-none"
                style={{ minWidth: 260 }}
                onClick={e => e.stopPropagation()}
              >
                <span className="text-6xl">🎁</span>
                <h2 className="text-xl font-bold text-zinc-700">No new badges</h2>
                <p className="text-sm text-zinc-500 text-center">You didn't unlock anything new this time. Keep going!</p>
                <button
                  className="mt-2 px-6 py-2 rounded-full bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors"
                  onClick={() => setShowNoReward(false)}
                >
                  Got it
                </button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-5 gap-6 pt-15">
            {badgesMetaData.userBadge.map(badge => <BadgeCard key={badge.uuid} badge={badge} allBadges={badgesMetaData.allBadges}/>)}
          </div>
          <p className="text-center text-xs text-zinc-400 mt-6">
            {badgesMetaData.userBadge.length} / {badgesMetaData.allBadges.length} unlocked
          </p>
        </>
      )}
    </div>
  );
};

export default Badges;