/**
 * Analytics resolver functions for frontend-triggered events
 * 
 * These functions serve as the bridge between frontend analytics calls
 * and the backend analytics processing system. They are registered
 * as Forge resolvers and called via invoke() from the React frontend.
 * 
 * PRIVACY PROTECTION:
 * By routing all frontend events through these backend resolvers, we ensure
 * that no End User Data (EUD) or PII reaches the analytics provider:
 * - Only Atlassian Forge server IP addresses are logged (not user IPs)
 * - No browser referrer or URL data that might contain sensitive information
 * - No client-side environment data that could inadvertently include PII
 * - Complete control over what data is sent to external analytics services
 */
import {handleGroup, handleIdentify, handleTrackEvent} from "./dispatcher";
import {track} from "./events";
import {groupIdFromContext, userIdFromContext} from "./utils";

/**
 * Handle frontend-triggered track events
 * 
 * This resolver is called when the frontend uses invoke('track-event', {...})
 * It forwards the event to the main tracking system which handles queuing
 * and processing through the analytics pipeline.
 * 
 * @param {Object} payload - Event data from frontend (contains event name)
 * @param {Object} context - Forge context with user/instance information
 */
export const trackEvent = async ({ payload, context }) => {
    await track(context, payload.event);
}

/**
 * Handle frontend-triggered identify calls
 * 
 * NOTE: This resolver is provided as an example but is typically not used.
 * The backend automatically handles identify calls when processing track events
 * (see src/analytics/events.js track() function), so explicit identify calls
 * from the frontend are unnecessary in most cases.
 * 
 * Updates user profile information in the analytics platform.
 * Use only if you need to update user traits independently of tracking events.
 * 
 * @param {Object} context - Forge context with user information
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
 * Handle frontend-triggered group calls
 * 
 * NOTE: This resolver is provided as an example but is typically not used.
 * The backend automatically handles group calls when processing track events
 * (see src/analytics/events.js track() function), and scheduled jobs handle
 * regular group updates with fresh license data (see src/analytics/schedule.js).
 * 
 * Updates organization/instance profile in the analytics platform.
 * Use only if you need to update group traits independently of tracking events.
 * 
 * @param {Object} context - Forge context with instance information
 */
export const group = async ({ context }) => {
    const groupId = groupIdFromContext(context);
    await handleGroup(groupId, {name: groupId});
}