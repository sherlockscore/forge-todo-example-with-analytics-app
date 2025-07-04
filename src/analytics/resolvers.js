/**
 * Frontend-backend bridge for analytics events
 * 
 * Routes frontend events through backend to ensure privacy compliance.
 * See: https://developer.accoil.com/docs/analytics-architecture-overview-for-forge-apps
 */
import {handleGroup, handleIdentify, handleTrackEvent} from "./dispatcher";
import {track} from "./events";
import {groupIdFromContext, userIdFromContext} from "./utils";

/**
 * Process track events from frontend
 */
export const trackEvent = async ({ payload, context }) => {
    await track(context, payload.event);
}

/**
 * Example: Direct identify calls (rarely needed - handled automatically by track events)
 */
export const identify = async ({ context }) => {
    const userId = userIdFromContext(context);
    const groupId = groupIdFromContext(context);
    
    await handleIdentify(
        userId,
        groupId,
        {
            name: userId, // Minimal traits to avoid PII
        }
    );
}

/**
 * Example: Direct group calls (rarely needed - handled automatically)
 */
export const group = async ({ context }) => {
    const groupId = groupIdFromContext(context);
    await handleGroup(groupId, {name: groupId});
}