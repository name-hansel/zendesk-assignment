import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-avatar-foreground",
  {
    variants: {
      tone: {
        1: "bg-avatar-1",
        2: "bg-avatar-2",
        3: "bg-avatar-3",
        4: "bg-avatar-4",
        5: "bg-avatar-5",
      },
      size: {
        xs: "size-5 text-[10px]",
        sm: "size-7 text-xs",
        md: "size-9 text-sm",
        lg: "size-11 text-base",
      },
    },
    defaultVariants: { tone: 1, size: "md" },
  },
);

function toneFor(seed: string): 1 | 2 | 3 | 4 | 5 {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return ((h % 5) + 1) as 1 | 2 | 3 | 4 | 5;
}

export function UserAvatar({
  name,
  size,
  className,
}: { name: string; className?: string } & Pick<VariantProps<typeof avatarVariants>, "size">) {
  const initials = name
    .split(" ")
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className={cn(avatarVariants({ tone: toneFor(name), size }), className)} aria-hidden>
      {initials}
    </span>
  );
}
