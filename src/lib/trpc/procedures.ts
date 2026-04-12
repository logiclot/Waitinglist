/**
 * Exports all the baseProcedure for the routers
 */

import { t } from "./init";
import { TRPCError } from "@trpc/server";

export const publicProcedure = t.procedure;

export const commonProcedure = t.procedure.use(async ({ ctx, next }) => {
    if (!ctx.session && !ctx.userId) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
            cause: "No session",
        });
    }

    if (ctx.session && ctx.session.user.role == "USER") {
        throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not authorized to access this resource",
            cause: "User does not have a role",
        });
    }

    return await next({
        ctx: {
            ...ctx,
            session: ctx.session,
        },
    });
});


export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
    if (!ctx.session) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
            cause: "No session",
        });
    }

    if (ctx.session && ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not authorized to access this resource",
            cause: "User is not an admin",
        });
    }

    return await next({
        ctx: {
            ...ctx,
            session: ctx.session,
        },
    });
});

export const businessProcedure = t.procedure.use(({ ctx, next }) => {
    if (!ctx.session) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
            cause: "No session",
        });
    }

    if (ctx.session && ctx.session.user.role !== "BUSINESS") {
        throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not authorized to access this resource",
            cause: "User is not an admin",
        });
    }

    return next({
        ctx: {
            ...ctx,
            session: ctx.session,
        },
    });
});

export const expertProcedures = t.procedure.use(({ ctx, next }) => {
    if (!ctx.session) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
            cause: "No session",
        });
    }

    if (ctx.session && ctx.session.user.role !== "EXPERT") {
        throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not authorized to access this resource",
            cause: "User is not an admin",
        });
    }

    return next({
        ctx: {
            ...ctx,
            session: ctx.session,
        },
    });
});