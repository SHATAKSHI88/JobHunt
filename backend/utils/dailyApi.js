// Thin wrapper around the Daily.co REST API (https://docs.daily.co/reference/rest-api).
// Rooms are created "private" — nobody can join with just the URL, they
// also need a meeting token minted server-side. This means only the
// recruiter and candidate on a given interview can ever get in, since
// createMeetingToken() is only called after we've checked req.id against
// interview.recruiter / interview.candidate in the controller.

const DAILY_API_BASE = "https://api.daily.co/v1";

const dailyFetch = async (path, options = {}) => {
    if (!process.env.DAILY_API_KEY) {
        throw new Error("DAILY_API_KEY is not set in the environment.");
    }
    const res = await fetch(`${DAILY_API_BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
            ...options.headers,
        },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data?.error || data?.info || `Daily.co API error (${res.status})`);
    }
    return data;
};

/**
 * Creates a private Daily.co room that auto-expires (Daily deletes it for us).
 * @param {{ name: string, expiryUnixSeconds: number }} params
 */
export const createDailyRoom = async ({ name, expiryUnixSeconds }) => {
    return dailyFetch("/rooms", {
        method: "POST",
        body: JSON.stringify({
            name,
            privacy: "private",
            properties: {
                exp: expiryUnixSeconds,
                enable_screenshare: true,
                enable_chat: true,
                enable_knocking: false, // token-based access instead of a waiting room
                eject_at_room_exp: true,
                max_participants: 2,
            },
        }),
    });
};

/**
 * Mints a short-lived token that authorizes one person to join a private room.
 * @param {{ roomName: string, userName: string, isOwner: boolean, expiryUnixSeconds: number }} params
 */
export const createMeetingToken = async ({ roomName, userName, isOwner, expiryUnixSeconds }) => {
    const data = await dailyFetch("/meeting-tokens", {
        method: "POST",
        body: JSON.stringify({
            properties: {
                room_name: roomName,
                user_name: userName,
                is_owner: isOwner, // recruiter gets moderator controls (mute others, end call)
                exp: expiryUnixSeconds,
            },
        }),
    });
    return data.token;
};

export const deleteDailyRoom = async (name) => {
    try {
        await dailyFetch(`/rooms/${name}`, { method: "DELETE" });
    } catch (error) {
        // Non-fatal — room will auto-expire anyway via `exp`.
        console.error("Failed to delete Daily room:", error.message);
    }
};
