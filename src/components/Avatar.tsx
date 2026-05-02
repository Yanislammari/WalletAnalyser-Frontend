import React from "react";

interface AvatarProps {
  pictureUrl?: string | null;
  firstName?: string;
  lastName?: string;
  size?: "sm" | "md" | "lg";
}

const Avatar: React.FC<AvatarProps> = (props: AvatarProps) => {
  const palette = ["#7c3aed", "#6366f1", "#8b5cf6", "#a855f7", "#3b82f6", "#0ea5e9", "#14b8a6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#f97316"];

  const getInitials = (firstName?: string, lastName?: string): string => {
    const first: string = firstName?.[0]?.toUpperCase() ?? "Firstname";
    const last: string = lastName?.[0]?.toUpperCase() ?? "Lastname";
    return first + last || "?";
  }
  
  const stringToColor = (str: string): string => {
    let hash: number = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    return palette[Math.abs(hash) % palette.length];
  }

  const dim: string = props.size === "sm" ? "w-8 h-8 text-xs" : props.size === "lg" ? "w-12 h-12 text-base" : "w-9 h-9 text-sm";
  const initials: string = getInitials(props.firstName, props.lastName);
  const background: string = stringToColor((props.firstName ?? "") + (props.lastName ?? ""));

  if (props.pictureUrl) {
    return (
      <img
        src={props.pictureUrl}
        alt="Profile"
        className={`${dim} rounded-full object-cover ring-2 ring-white/20 shrink-0`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-white/20 select-none shrink-0`}
      style={{ backgroundColor: background }}
    >
      {initials}
    </div>
  );
}

export default Avatar
