import React, { useState } from "react";
import { LOGODEV_API_KEY } from "../constants/env";

interface CompanyLogoProps {
  name: string;
  size?: number;
}

const CompanyLogo: React.FC<CompanyLogoProps> = (props: CompanyLogoProps) => {
  const [failed, setFailed] = useState<boolean>(false);
  const size: number = props.size ?? 40;

  const slug: string = encodeURIComponent(props.name.toLowerCase().trim());
  const src: string = `https://img.logo.dev/name/${slug}?token=${LOGODEV_API_KEY}&size=40&format=png`;

  const initials = props.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  if (failed || !LOGODEV_API_KEY) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 font-semibold shrink-0"
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {initials}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center rounded-lg bg-white border border-gray-100 overflow-hidden shrink-0"
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt={`${props.name} logo`}
        onError={() => setFailed(true)}
        style={{ width: size * 0.6, height: size * 0.6, objectFit: "contain" }}
      />
    </span>
  );
}

export default CompanyLogo;
