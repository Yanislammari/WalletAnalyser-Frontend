import type React from "react";
import type { BadgeUI } from "../models/UI/BadgeUI";

interface BadgeItemProps {
  badge: BadgeUI;
}

const BadgeItem: React.FC<BadgeItemProps> = (props: BadgeItemProps) => {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium"
      style={{ background: props.badge.bg, border: `1px solid ${props.badge.border}`, color: props.badge.text }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: props.badge.dot }} />
      {props.badge.label}
    </div>
  );
}

export default BadgeItem;
