// Maps a job's type to a consistent accent color used as a left-border
// on job cards, so the type is recognizable at a glance across the site.
export const jobTypeAccent = (jobType = "") => {
    const key = jobType.toLowerCase();
    if (key.includes("intern")) return "border-l-violet-500";
    if (key.includes("part")) return "border-l-amber-500";
    if (key.includes("contract") || key.includes("freelance")) return "border-l-cyan-500";
    return "border-l-primary"; // full-time / default
};

export const daysAgo = (mongodbTime) => {
    if (!mongodbTime) return "";
    const createdAt = new Date(mongodbTime);
    const currentTime = new Date();
    const diffDays = Math.floor((currentTime - createdAt) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
};

// Deterministic color per company name (same company always gets the same
// color), used for the avatar fallback so cards feel visually distinct
// even before a real logo is uploaded.
const avatarPalette = [
    "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
    "bg-rose-500/15 text-rose-600 dark:text-rose-400",
];

export const avatarColor = (name = "") => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return avatarPalette[Math.abs(hash) % avatarPalette.length];
};

// Posted within the last 2 days — used to show a "New" badge on job cards.
export const isRecent = (mongodbTime) => {
    if (!mongodbTime) return false;
    const diffDays = (Date.now() - new Date(mongodbTime).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 2;
};
