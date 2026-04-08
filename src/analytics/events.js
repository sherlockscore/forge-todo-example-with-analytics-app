import { Queue } from '@forge/events';
import {groupIdFromContext, userIdFromContext} from "./utils";

// Central analytics queue for reliable event delivery
// Events are processed asynchronously by the analytics-consumer
const analyticsQueue = new Queue({ key: 'analytics-queue' });

/**
 * Queue analytics events (identify, group, track) for processing
 */
export const track = async (context, eventName) => {
    // Extract privacy-safe identifiers from Forge context
    const userId = userIdFromContext(context);
    const groupId = groupIdFromContext(context);
    
    // Minimal traits to avoid PII transmission
    const identifyTraits = {name: userId};
    const groupTraits = {name: groupId};

    // Bundle all three event types for atomic processing
    // This ensures user identity is always current when events are processed
    const events = [
        {body: {type: "identify", userId: userId, groupId: groupId, traits: identifyTraits}},
        {body: {type: "group", groupId: groupId, traits: groupTraits}},
        {body: {type: "track", userId: userId, event: eventName}},
    ];
    
    await analyticsQueue.push(events);
}

/**
 * Backend Event Definitions
 * 
 * Event naming convention: "Object Verb" (e.g., "Todo Created", "Todo Updated")
 * See: https://developer.accoil.com/docs/analytics-architecture-overview-for-forge-apps
 */

export const trackCreate = async (context) => {
    await track(context, "Todo Created");
}

export const trackUpdate = async (context) => {
    await track(context, "Todo Updated");
}

export const trackDelete = async (context) => {
    await track(context, "Todo Deleted");
}

export const trackDeleteAll = async (context) => {
    await track(context, "Todo Cleared");
}