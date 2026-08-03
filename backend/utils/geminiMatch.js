// Uses Gemini's REST API directly (no SDK needed) to score how well a
// candidate's resume matches a job description + requirements.
// https://ai.google.dev/api/generate-content

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL = "gemini-2.0-flash";

/**
 * @param {{ resumeText: string, jobDescription: string, requirements?: string[] }} params
 * @returns {Promise<{ score: number, summary: string }>} score is 0-100.
 */
export const scoreResumeMatch = async ({ resumeText, jobDescription, requirements = [] }) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set in the environment.");
    }
    if (!resumeText?.trim() || !jobDescription?.trim()) {
        throw new Error("Both resume text and job description are required to score a match.");
    }

    // Resumes/JDs can be long; keep the prompt within a sane size for a flash-tier model.
    const prompt = `You are an ATS (applicant tracking system) screening assistant. Compare the candidate's resume against the job description and requirements below, then respond with ONLY a JSON object — no markdown, no extra text — in this exact shape:
{"score": <integer 0-100, how well the candidate's skills/experience match the role>, "summary": "<one concise sentence, max 200 characters, explaining the score>"}

Job description:
${jobDescription.slice(0, 6000)}

Requirements:
${requirements.join(", ")}

Candidate resume:
${resumeText.slice(0, 12000)}`;

    const res = await fetch(`${GEMINI_API_BASE}/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.2,
            },
        }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data?.error?.message || `Gemini API error (${res.status})`);
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
        throw new Error("Gemini returned no usable content (possibly blocked by safety filters).");
    }

    let parsed;
    try {
        parsed = JSON.parse(rawText);
    } catch {
        throw new Error("Gemini response wasn't valid JSON.");
    }

    const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score))));
    if (Number.isNaN(score)) {
        throw new Error("Gemini response didn't include a valid score.");
    }

    return {
        score,
        summary: String(parsed.summary || "").slice(0, 300),
    };
};

/**
 * Richer, on-demand analysis for a single candidate: scores the resume
 * against each individual job requirement/skill (out of 10) plus an
 * overall out-of-10 score and summary. This is separate from
 * scoreResumeMatch (the fast 0-100 auto-shortlisting check that runs on
 * every application) — it's heavier and only generated when a recruiter
 * opens that candidate's detail page.
 *
 * @param {{ resumeText: string, jobTitle: string, jobDescription: string, requirements?: string[] }} params
 * @returns {Promise<{ skillScores: {skill: string, score: number, comment: string}[], overallScore: number, overallSummary: string }>}
 */
export const generateDetailedAnalysis = async ({ resumeText, jobTitle, jobDescription, requirements = [] }) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set in the environment.");
    }
    if (!resumeText?.trim() || !jobDescription?.trim()) {
        throw new Error("Both resume text and job description are required to analyze a candidate.");
    }

    const skillList = requirements.length > 0 ? requirements : ["Overall role fit"];

    const prompt = `You are a technical recruiter evaluating a candidate's resume for a specific role. Score the candidate against EACH of the following skills/requirements individually, then give an overall assessment.

Respond with ONLY a JSON object — no markdown, no extra text — in this exact shape:
{
  "skillScores": [
    {"skill": "<the exact skill/requirement text>", "score": <integer 0-10, how strongly the resume demonstrates this skill>, "comment": "<max 120 characters, cite specific resume evidence or note its absence>"}
  ],
  "overallScore": <number 0-10, one decimal allowed, overall fit for the role>,
  "overallSummary": "<max 250 characters, 2-3 sentence summary of strengths and gaps>"
}

Include exactly one entry in skillScores for each of these skills/requirements, in this order: ${skillList.join(" | ")}

Role: ${jobTitle}

Job description:
${jobDescription.slice(0, 6000)}

Candidate resume:
${resumeText.slice(0, 12000)}`;

    const res = await fetch(`${GEMINI_API_BASE}/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.2,
            },
        }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data?.error?.message || `Gemini API error (${res.status})`);
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
        throw new Error("Gemini returned no usable content (possibly blocked by safety filters).");
    }

    let parsed;
    try {
        parsed = JSON.parse(rawText);
    } catch {
        throw new Error("Gemini response wasn't valid JSON.");
    }

    const skillScores = (Array.isArray(parsed.skillScores) ? parsed.skillScores : []).map((s) => ({
        skill: String(s.skill || "").slice(0, 100),
        score: Math.max(0, Math.min(10, Math.round(Number(s.score) * 10) / 10)),
        comment: String(s.comment || "").slice(0, 200),
    }));
    const overallScore = Math.max(0, Math.min(10, Math.round(Number(parsed.overallScore) * 10) / 10));
    if (skillScores.length === 0 || Number.isNaN(overallScore)) {
        throw new Error("Gemini response didn't include valid scores.");
    }

    return {
        skillScores,
        overallScore,
        overallSummary: String(parsed.overallSummary || "").slice(0, 350),
    };
};
