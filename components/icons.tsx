// Small stroke icons (24px grid, currentColor).
type P = { className?: string; size?: number };

function Icon({ children, className = "", size = 18 }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export const TrashIcon = (p: P) => (
  <Icon {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </Icon>
);
export const ArchiveIcon = (p: P) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="5" rx="1.5" />
    <path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9M10 13h4" />
  </Icon>
);
export const RestoreIcon = (p: P) => (
  <Icon {...p}>
    <path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5M4 4v4.5h4.5" />
  </Icon>
);
export const OpenIcon = (p: P) => (
  <Icon {...p}>
    <path d="M14 4h6v6M20 4l-8 8M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
  </Icon>
);
export const CloseIcon = (p: P) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);
export const PlusIcon = (p: P) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);
export const TimerIcon = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2 2M9 2h6" />
  </Icon>
);
export const BellIcon = (p: P) => (
  <Icon {...p}>
    <path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4zM10 21h4" />
  </Icon>
);
export const TableIcon = (p: P) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 10h18M3 15h18M9 4v16" />
  </Icon>
);
export const ListIcon = (p: P) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="6" rx="2" />
    <rect x="3" y="14" width="18" height="6" rx="2" />
  </Icon>
);
export const LogoutIcon = (p: P) => (
  <Icon {...p}>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l4-4-4-4M14 12H4" />
  </Icon>
);
export const SearchIcon = (p: P) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4-4" />
  </Icon>
);
export const LinkIcon = (p: P) => (
  <Icon {...p}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </Icon>
);
export const NoteIcon = (p: P) => (
  <Icon {...p}>
    <path d="M6 3h9l4 4v14H6zM15 3v4h4M9 12h7M9 16h5" />
  </Icon>
);
export const TrophyIcon = (p: P) => (
  <Icon {...p}>
    <path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 13v4M8 21h8M9 17h6v4H9z" />
  </Icon>
);
export const UserIcon = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Icon>
);
export const CalendarIcon = (p: P) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Icon>
);
export const TagIcon = (p: P) => (
  <Icon {...p}>
    <path d="M3 12V4h8l10 10-8 8z" />
    <circle cx="7.5" cy="8.5" r="1.5" />
  </Icon>
);
export const FlagIcon = (p: P) => (
  <Icon {...p}>
    <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
  </Icon>
);

/** Icon per category (falls back to a flag). */
export function CategoryIcon({ category, ...p }: P & { category: string | null }) {
  const c = category?.toLowerCase() ?? "";
  if (c.includes("ai") || c.includes("ml"))
    return (
      <Icon {...p}>
        <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />
      </Icon>
    );
  if (c.includes("fin"))
    return (
      <Icon {...p}>
        <circle cx="12" cy="12" r="9" />
        <path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v12" />
      </Icon>
    );
  if (c.includes("web3") || c.includes("crypto") || c.includes("chain"))
    return (
      <Icon {...p}>
        <path d="M12 2l8 4.5v9L12 20l-8-4.5v-9zM12 11l8-4.5M12 11v9M12 11L4 6.5" />
      </Icon>
    );
  if (c.includes("climate") || c.includes("green") || c.includes("health"))
    return (
      <Icon {...p}>
        <path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15M5 19l7-7" />
      </Icon>
    );
  if (c)
    return (
      <Icon {...p}>
        <path d="M8 6l-6 6 6 6M16 6l6 6-6 6" />
      </Icon>
    );
  return <FlagIcon {...p} />;
}
