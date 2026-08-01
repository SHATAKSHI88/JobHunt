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
