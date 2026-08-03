const STORAGE_KEY = "jobhunt-recently-viewed";
const MAX_ITEMS = 8;

// Stores a trimmed snapshot of a job (not the full object) so this stays
// small and doesn't go stale trying to mirror live data like salary/status.
export const recordRecentlyViewed = (job) => {
    if (!job?._id) return;
    try {
        const existing = getRecentlyViewed();
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
    } catch (error) {
        console.log(error);
    }
};

export const getRecentlyViewed = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        return [];
    }
};
