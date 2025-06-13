import { Queue } from '@forge/events';
import {groupIdFromContext, userIdFromContext} from "./utils";

// Central analytics queue for reliable event delivery
// Events are processed asynchronously by the analytics-consumer
const analyticsQueue = new Queue({ key: 'analytics-queue' });

/**
 * Core tracking function that creates identify, group, and track events
 * 
 * This approach ensures every track call also updates user and group information,
 * maintaining consistency across analytics platforms that require separate identify/group calls.
 * 
 * @param {Object} context - Forge resolver context containing accountId, cloudId, etc.
 * @param {string} eventName - Human-readable event name for tracking
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
        {type: "identify", userId: userId, groupId: groupId, traits: identifyTraits},
        {type: "group", groupId: groupId, traits: groupTraits},
        {type: "track", userId: userId, event: eventName},
    ];
    
    await analyticsQueue.push(events);
}

/**
 * BACKEND EVENT DEFINITIONS
 * 
 * This file serves as the single source of truth for all backend analytics events.
 * By centralizing event definitions here, we can:
 * 
 * 1. **Audit all tracked events** - See every backend event in one place
 * 2. **Maintain consistency** - Ensure event names follow conventions
 * 3. **Easy discovery** - Find where specific events are tracked without hunting through code
 * 4. **Change management** - Update event names or add properties in one location
 * 
 * NAMING CONVENTION:
 * Event names should follow the "Object Verb" format for consistency and clarity.
 * Examples:
 * - "Todo Created" (not "Create Todo" or "Backend: Create")
 * - "Todo Updated" (not "Update Todo" or "Todo Modified")
 * - "Todo Deleted" (not "Delete Todo" or "Removed Todo")
 * - "Todo Cleared" (not "Delete All" or "Clear All Todos")
 * 
 * Each function here represents a specific user action or system event that we want
 * to track in our analytics platform. When adding new events, define them here first,
 * then call them from the appropriate business logic locations.
 */

/**
 * Track todo item creation
 * Called when a new todo item is successfully created
 */
export const trackCreate = async (context) => {
    await track(context, "Todo Created");
}

/**
 * Track todo item updates (e.g., checking/unchecking items)
 * Called when a todo item is modified
 */
export const trackUpdate = async (context) => {
    await track(context, "Todo Updated");
}

/**
 * Track single todo item deletion
 * Called when a user deletes a specific todo item
 */
export const trackDelete = async (context) => {
    await track(context, "Todo Deleted");
}

/**
 * Track bulk deletion of all todos
 * Called when a user clears their entire todo list
 */
export const trackDeleteAll = async (context) => {
    await track(context, "Todo Cleared");
}