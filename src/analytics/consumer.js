/**
 * Analytics queue consumer for processing analytics events
 * 
 * This consumer processes events from the 'analytics-queue' and routes them
 * to the appropriate dispatcher functions. It runs asynchronously.
 * 
 * The consumer is configured in manifest.yml as:
 * - consumer key: analytics-consumer
 * - queue: analytics-queue
 * - resolver method: analytics-listener
 */
import {handleGroup, handleIdentify, handleTrackEvent} from "./dispatcher";

/**
 * Main analytics event processor
 * 
 * Routes different types of analytics events to their appropriate handlers.
 * This function is invoked by the Forge Events system when items are
 * added to the analytics-queue.
 * 
 * Event types:
 * - identify: Update user profile information
 * - group: Update organization/instance information  
 * - track: Record user action events
 * 
 * @param {Object} event - Event data from the queue with type of AsyncEvent
 * @param {string} event.body.type - Event type (identify, group, track)
 * @param {string} event.body.userId - User identifier
 * @param {string} event.body.groupId - Organization identifier
 * @param {Object} event.body.traits - Additional attributes
 * @param {string} event.body.event - Event name (for track events)
 */
export const handler = async (event) => {
    const payload = event.body;
    switch (payload.type){
        case "identify":
            await handleIdentify(payload.userId, payload.groupId, payload.traits);
            break;
        case "group":
            await handleGroup(payload.groupId, payload.traits);
            break;
        case "track":
            await handleTrackEvent(payload.userId, payload.event);
            break;
        default:
            // Log unknown event types for debugging
            console.log(`analytics-listener: unable to process payload with type ${payload.type}`);
    }
};
