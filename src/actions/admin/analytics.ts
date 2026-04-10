"use server"

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

async function checkAdmin() {
    const session = await getServerSession(authOptions);
    return session?.user?.role === "ADMIN";
}

// ── Audit Quiz Analytics ─────────────────────────────────────────────────────

type AuditAnalyticsPeriod = "7d" | "30d" | "all";

const AUDIT_ANALYTICS_DEFAULT_PERIOD: AuditAnalyticsPeriod = "30d";
const AUDIT_ANALYTICS_PERIOD_DAYS: Record<Exclude<AuditAnalyticsPeriod, "all">, number> = {
    "7d": 7,
    "30d": 30,
};
const AUDIT_ANALYTICS_STEPS = [0, 1, 2, 3, 4] as const;

function normalizeAuditAnalyticsPeriod(
    period: AuditAnalyticsPeriod = AUDIT_ANALYTICS_DEFAULT_PERIOD,
) {
    if (period === "7d" || period === "30d" || period === "all") {
        return period;
    }

    return AUDIT_ANALYTICS_DEFAULT_PERIOD;
}

function getAuditAnalyticsPeriodStart(period: AuditAnalyticsPeriod) {
    if (period === "all") {
        return null;
    }

    const days = AUDIT_ANALYTICS_PERIOD_DAYS[period];
    const now = new Date();
    return new Date(
        now.getTime() - days * 24 * 60 * 60 * 1000,
    );
}

function getAuditAnalyticsDateFilter(period: AuditAnalyticsPeriod) {
    const periodStart = getAuditAnalyticsPeriodStart(period);

    if (!periodStart) {
        return {};
    }

    return {
        createdAt: { gte: periodStart },
    };
}


export async function getAuditAnalyticsStepCounts(
    period: AuditAnalyticsPeriod = AUDIT_ANALYTICS_DEFAULT_PERIOD,
) {
    if (!(await checkAdmin())) return null;

    const normalizedPeriod = normalizeAuditAnalyticsPeriod(period);
    const dateFilter = getAuditAnalyticsDateFilter(normalizedPeriod);

    const stepSessions = await Promise.all(
        AUDIT_ANALYTICS_STEPS.map((step) =>
            prisma.auditEvent.findMany({
                where: {
                    ...dateFilter,
                    event: "step_complete",
                    step,
                },
                select: { sessionId: true },
            }),
        ),
    );

    return AUDIT_ANALYTICS_STEPS.map((step, index) => ({
        step,
        count: stepSessions[index].length,
    }));
}

export async function getAuditAnalyticsCompletionCount(
    period: AuditAnalyticsPeriod = AUDIT_ANALYTICS_DEFAULT_PERIOD,
) {
    if (!(await checkAdmin())) return null;

    const normalizedPeriod = normalizeAuditAnalyticsPeriod(period);
    const dateFilter = getAuditAnalyticsDateFilter(normalizedPeriod);

    const completions = await prisma.auditEvent.findMany({
        where: {
            ...dateFilter,
            event: "quiz_complete",
            score: {
                not: null
            }
        },
        distinct: "sessionId"
    });

    return { completions: completions.length };
}

export async function getAuditAnalyticsScoreDistribution(
    period: AuditAnalyticsPeriod = AUDIT_ANALYTICS_DEFAULT_PERIOD,
) {
    if (!(await checkAdmin())) return null;

    const normalizedPeriod = normalizeAuditAnalyticsPeriod(period);
    const dateFilter = getAuditAnalyticsDateFilter(normalizedPeriod);

    const completionEvents = await prisma.auditEvent.findMany({
        where: {
            ...dateFilter,
            event: "quiz_complete",
            score: { not: null },
        },
        distinct: "sessionId",
        select: {
            score: true,
            scoreLabel: true,
        },
    });

    const scoreBuckets = [
        { label: "0-24", min: 0, max: 24, count: 0 },
        { label: "25-44", min: 25, max: 44, count: 0 },
        { label: "45-64", min: 45, max: 64, count: 0 },
        { label: "65-100", min: 65, max: 100, count: 0 },
    ];
    for (const e of completionEvents) {
        const bucket = scoreBuckets.find(b => e.score! >= b.min && e.score! <= b.max);
        if (bucket) bucket.count++;
    }

    // Score label counts
    const scoreLabelCounts: Record<string, number> = {};
    for (const e of completionEvents) {
        if (e.scoreLabel) {
            scoreLabelCounts[e.scoreLabel] = (scoreLabelCounts[e.scoreLabel] ?? 0) + 1;
        }
    }

    const avgScore = completionEvents.length > 0
        ? Math.round(completionEvents.reduce((sum, e) => sum + (e.score ?? 0), 0) / completionEvents.length)
        : 0;

    return {
        scoreBuckets,
        scoreLabelCounts,
        avgScore,
    };
}

type AuditAnswers = {
    hours: string,
    tasks: Array<string>,
    dataOrg: string,
    teamSize: string,
    strengths: string,
    frustration: string
}

export async function getAuditsByEmail() {
    if (!(await checkAdmin())) return null;

    const events = await prisma.auditEvent.findMany({
        where: {
            event: { in: ["quiz_complete", "email_sent"] },
        },
        select: {
            sessionId: true,
            event: true,
            email: true,
            answers: true,
            score: true,
            scoreLabel: true,
            createdAt: true,
        },
        orderBy: { createdAt: "desc" },
    });

    // Group events by sessionId
    const sessionMap = new Map<string, {
        sessionId: string;
        emails: string[];
        answers: AuditAnswers[];
        score: number | null;
        scoreLabel: string | null;
        createdAt: Date;
    }>();

    for (const e of events) {
        let session = sessionMap.get(e.sessionId);

        if (!session) {
            session = {
                sessionId: e.sessionId,
                emails: [],
                answers: [],
                score: null,
                scoreLabel: null,
                createdAt: e.createdAt,
            };
            sessionMap.set(e.sessionId, session);
        }

        if (e.event === "email_sent" && e.email && !session.emails.includes(e.email)) {
            session.emails.push(e.email);
        }

        if (e.event === "quiz_complete") {
            session.score = e.score;
            session.scoreLabel = e.scoreLabel;
            if (e.answers) {
                session.answers.push(e.answers as AuditAnswers);
            }
        }
    }

    return Array.from(sessionMap.values()).sort(
        (a, b) => (b.score ?? -1) - (a.score ?? -1),
    ).filter((a) => a.emails.length > 0);
}

export async function getAuditAnalyticsSummary(
    period: AuditAnalyticsPeriod = AUDIT_ANALYTICS_DEFAULT_PERIOD,
) {
    if (!(await checkAdmin())) return null;

    const normalizedPeriod = normalizeAuditAnalyticsPeriod(period);
    const dateFilter = getAuditAnalyticsDateFilter(normalizedPeriod);

    const [starts, completions, totalEmails] = await Promise.all([
        prisma.auditEvent.findMany({
            where: {
                ...dateFilter,
                event: "quiz_start",
            },
            distinct: "sessionId",
            select: { sessionId: true },
        }),
        prisma.auditEvent.findMany({
            where: {
                ...dateFilter,
                event: "quiz_complete",
                score: { not: null }
            },
            distinct: "sessionId",
            select: { score: true },
        }),
        prisma.auditEvent.count({
            where: {
                ...dateFilter,
                event: "email_sent",
            },
        }),
    ]);

    const totalStarts = starts.length;
    const totalCompletes = completions.length;

    const completionRate = totalStarts > 0
        ? Math.round((totalCompletes / totalStarts) * 100)
        : 0;

    const emailCaptureRate = totalCompletes > 0
        ? Math.round((totalEmails / totalCompletes) * 100)
        : 0;

    const avgScore = completions.length > 0
        ? Math.round(completions.reduce((s, c) => s + (c.score ?? 0), 0) / completions.length)
        : 0;

    return {
        totalStarts,
        totalCompletes,
        totalEmails,
        completionRate,
        emailCaptureRate,
        avgScore,
        periodDays:
            normalizedPeriod === "all" ? null : AUDIT_ANALYTICS_PERIOD_DAYS[normalizedPeriod],
    };
}
