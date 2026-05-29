"use client";
import Image from "next/image";

interface Props {
  name: string;
  email?: string | null;
  size?: number;
  className?: string;
  rounded?: "full" | "xl" | "2xl";
}

/**
 * DiceBear open-source avatar API — no API key, MIT license.
 * https://api.dicebear.com/9.x/initials/svg?seed=NAME
 */
export default function DiceBearAvatar({ name, email, size = 40, className = "", rounded = "full" }: Props) {
  const seed = encodeURIComponent(email || name || "user");
  const radius = rounded === "full" ? 50 : rounded === "xl" ? 14 : 18;

  const url = `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundColor=173962&textColor=c9a34b&fontWeight=700&fontSize=40&radius=${radius}`;

  const roundClass = {
    full: "rounded-full",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
  }[rounded];

  return (
    <Image
      src={url}
      alt={name}
      width={size}
      height={size}
      className={`${roundClass} object-cover shrink-0 ${className}`}
      unoptimized
    />
  );
}
