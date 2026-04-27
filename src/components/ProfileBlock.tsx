import type React from "react";
import Avatar from "./Avatar";
import type { User } from "../models/User";

interface ProfileBlockProps {
  user: User | null;
  onAvatarClick: () => void;
  avatarRef: React.RefObject<HTMLButtonElement | null>;
}

const ProfileBlock: React.FC<ProfileBlockProps> = (props: ProfileBlockProps) => {
  return (
    <button
      ref={props.avatarRef}
      onClick={props.onAvatarClick}
      className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer shrink-0"
    >
      <Avatar
        pictureUrl={props.user?.googlePictureUrl}
        firstName={props.user?.firstName}
        lastName={props.user?.lastName}
        size="sm"
      />
      <div className="hidden sm:block text-left">
        <p className="text-[13px] font-semibold text-gray-800 leading-tight max-w-[120px] truncate">
          {props.user?.firstName} {props.user?.lastName}
        </p>
        <p className="text-[11px] text-gray-400 leading-tight max-w-[120px] truncate">{props.user?.email}</p>
      </div>
      <svg className="w-3.5 h-3.5 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

export default ProfileBlock;
