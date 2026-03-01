/**
 * Survey questions for the feedback survey.
 * Shared between the feedback page (client) and the API route (server).
 */

export const SURVEY_QUESTIONS = [
  { id: "q1", label: "How easy was it to find relevant solutions or experts?", type: "scale" as const, min: 1, max: 5 },
  { id: "q2", label: "How clear is the process for posting a Discovery Scan or Custom Project?", type: "scale" as const, min: 1, max: 5 },
  { id: "q3", label: "How useful is the messaging system for communicating with experts/buyers?", type: "scale" as const, min: 1, max: 5 },
  { id: "q4", label: "How confident are you in the escrow and milestone payment system?", type: "scale" as const, min: 1, max: 5 },
  { id: "q5", label: "How would you rate the overall onboarding experience?", type: "scale" as const, min: 1, max: 5 },
  { id: "q6", label: "How easy is it to track your projects and their status?", type: "scale" as const, min: 1, max: 5 },
  { id: "q7", label: "How would you rate the quality of proposals you receive or send?", type: "scale" as const, min: 1, max: 5 },
  { id: "q8", label: "How clear is the pricing and fee structure?", type: "scale" as const, min: 1, max: 5 },
  { id: "q9", label: "How likely are you to recommend LogicLot to a colleague? (0–10)", type: "nps" as const, min: 0, max: 10 },
  { id: "q10", label: "What is the one thing we could improve most?", type: "text" as const },
  { id: "q11", label: "Any other feedback or suggestions?", type: "text" as const },
];
