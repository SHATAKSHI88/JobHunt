const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const USER_API_END_POINT = `${API_BASE_URL}/user`;
export const JOB_API_END_POINT = `${API_BASE_URL}/job`;
export const APPLICATION_API_END_POINT = `${API_BASE_URL}/application`;
export const COMPANY_API_END_POINT = `${API_BASE_URL}/company`;
export const ANALYTICS_API_END_POINT = `${API_BASE_URL}/analytics`;
export const INTERVIEW_API_END_POINT = `${API_BASE_URL}/interview`;
export const ALERTS_API_END_POINT = `${API_BASE_URL}/alerts`;
export const NOTIFICATIONS_API_END_POINT = `${API_BASE_URL}/notifications`;