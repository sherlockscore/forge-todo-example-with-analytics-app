/**
 * Analytics queue consumer (Forge Events 2.0)
 * Configured in manifest.yml with direct function handler pattern
 */
import {handleGroup, handleIdentify, handleTrackEvent} from "./dispatcher";

/**
 * Process analytics events from the queue
 * See: https://developer.accoil.com/docs/implementing-the-event-queue-system
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
