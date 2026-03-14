/**
 * Survey questions for the feedback survey.
 * Shared between the feedback page (client) and the API route (server).
 *
 * Questions are role-aware: business users and experts see different
 * wording while keeping the same question IDs for analytics consistency.
 */

export type SurveyQuestion =
  | { id: string; label: string; type: "scale"; min: number; max: number }
  | { id: string; label: string; type: "nps"; min: number; max: number }
  | { id: string; label: string; type: "text" };

const BUSINESS_QUESTIONS: SurveyQuestion[] = [
  { id: "q1", label: "How easy was it to find relevant solutions or experts?", type: "scale", min: 1, max: 5 },
  { id: "q2", label: "How clear is the process for posting a Discovery Scan or Custom Project?", type: "scale", min: 1, max: 5 },
  { id: "q3", label: "How useful is the messaging system for communicating with experts?", type: "scale", min: 1, max: 5 },
  { id: "q4", label: "How confident are you in the escrow and milestone payment system?", type: "scale", min: 1, max: 5 },
  { id: "q5", label: "How would you rate the overall onboarding experience?", type: "scale", min: 1, max: 5 },
  { id: "q6", label: "How easy is it to track your projects and their status?", type: "scale", min: 1, max: 5 },
  { id: "q7", label: "How would you rate the quality of proposals you receive from experts?", type: "scale", min: 1, max: 5 },
  { id: "q8", label: "How clear is the pricing and fee structure?", type: "scale", min: 1, max: 5 },
  { id: "q9", label: "How likely are you to recommend LogicLot to a colleague? (0\u201310)", type: "nps", min: 0, max: 10 },
  { id: "q10", label: "What is the one thing we could improve most?", type: "text" },
  { id: "q11", label: "Any other feedback or suggestions?", type: "text" },
];

const EXPERT_QUESTIONS: SurveyQuestion[] = [
  { id: "q1", label: "How easy is it to manage your solutions and listings?", type: "scale", min: 1, max: 5 },
  { id: "q2", label: "How clear is the process for submitting proposals and managing bids?", type: "scale", min: 1, max: 5 },
  { id: "q3", label: "How useful is the messaging system for communicating with clients?", type: "scale", min: 1, max: 5 },
  { id: "q4", label: "How confident are you in the escrow and milestone payment system?", type: "scale", min: 1, max: 5 },
  { id: "q5", label: "How would you rate the overall onboarding experience?", type: "scale", min: 1, max: 5 },
  { id: "q6", label: "How easy is it to track your projects and deliveries?", type: "scale", min: 1, max: 5 },
  { id: "q7", label: "How would you rate the quality of project briefs you receive from clients?", type: "scale", min: 1, max: 5 },
  { id: "q8", label: "How clear is the commission and fee structure?", type: "scale", min: 1, max: 5 },
  { id: "q9", label: "How likely are you to recommend LogicLot to a colleague? (0\u201310)", type: "nps", min: 0, max: 10 },
  { id: "q10", label: "What is the one thing we could improve most?", type: "text" },
  { id: "q11", label: "Any other feedback or suggestions?", type: "text" },
];

/** Return the role-appropriate question set. Falls back to business questions. */
export function getSurveyQuestions(role?: string): SurveyQuestion[] {
  return role === "EXPERT" ? EXPERT_QUESTIONS : BUSINESS_QUESTIONS;
}

/**
 * @deprecated Use getSurveyQuestions(role) instead.
 * Kept for backward-compat with server-side validation (uses all IDs which are the same).
 */
export const SURVEY_QUESTIONS = BUSINESS_QUESTIONS;
