const MAX_ITEMS = 8;

// Scoped per account (falling back to a separate "guest" bucket for
// anonymous browsing) so recently viewed jobs never leak from one user
// to another on a shared device — a plain browser-wide key would let
// User B see User A's history after A logs out and B logs in.
const getStorageKey = (userId) => `jobhunt-recently-viewed-${userId || "guest"}`;

// Stores a trimmed snapshot of a job (not the full object) so this stays
// small and doesn't go stale trying to mirror live data like salary/status.
export const recordRecentlyViewed = (job, userId) => {
    if (!job?._id) return;
    try {
        const existing = getRecentlyViewed(userId);
        const entry = {
            _id: job._id,
            title: job.title,
            location: job.location,
            jobType: job.jobType,
            salary: job.salary,
            position: job.position,
            createdAt: job.createdAt,
            company: {
                _id: job.company?._id,
                name: job.company?.name,
                logo: job.company?.logo,
            },
            viewedAt: Date.now(),
        };
        const deduped = [entry, ...existing.filter((j) => j._id !== job._id)].slice(0, MAX_ITEMS);
        localStorage.setItem(getStorageKey(userId), JSON.stringify(deduped));
    } catch (error) {
        console.log(error);
    }
};

export const getRecentlyViewed = (userId) => {
    try {
        const raw = localStorage.getItem(getStorageKey(userId));
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        return [];
    }
};
