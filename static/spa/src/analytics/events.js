/**
 * FRONTEND EVENT DEFINITIONS
 * 
 * This file serves as the single source of truth for all frontend analytics events.
 * By centralizing event definitions here, we can:
 * 
 * 1. **Audit all tracked events** - See every frontend event in one place
 * 2. **Maintain consistency** - Ensure event names follow conventions  
 * 3. **Easy discovery** - Find where specific events are tracked without hunting through code
 * 4. **Change management** - Update event names or add properties in one location
 * 
 * NAMING CONVENTION:
 * Event names should follow the "Object Verb" format for consistency and clarity.
 * Examples:
 * - "Todos Loaded" (not "Load Todos" or "Todo Items Loaded")
 * - "View Opened" (not "Open View" or "Page Viewed")
 * - "Button Clicked" (not "Click Button" or "User Clicked")
 * 
 * PRIVACY & SECURITY:
 * All events are sent to backend resolvers via Forge bridge, ensuring no direct
 * external API calls from the frontend. This prevents End User Data (EUD) leakage:
 * - No user IP addresses logged (only Atlassian Forge server IPs are visible)
 * - No browser referrer information that might contain sensitive URLs
 * - No client-side data that could inadvertently include PII
 * - No URL parameters or fragments that might contain user information
 * 
 * Usage pattern:
 * 1. Define new events in this file first
 * 2. Import tracking functions in React components
 * 3. Call tracking functions at appropriate interaction points
 * 4. Events are automatically forwarded to backend via invoke()
 * 5. Backend processes events through queue system to analytics API
 */
import {invoke} from "@forge/bridge";

/**
 * Core frontend tracking function
 * 
 * Sends events to backend resolver via Forge bridge. The backend
 * handles all external API communication to maintain privacy compliance.
 * 
 * @param {string} eventName - Human-readable event name
 */
const track = (eventName) => {
    invoke('track-event', {event: eventName});
}

/**
 * Track when todo items are successfully loaded from storage
 * 
 * This event indicates app engagement and successful data retrieval.
 * Called in App.js when the initial data fetch completes.
 */
export const trackTodoItemsLoaded = () => {
    track('Todos Loaded');
}

/**
 * Trigger user identification in analytics platform
 * 
 * NOTE: This function is provided as an example but is typically not used.
 * The backend automatically handles identify calls when processing track events,
 * so explicit identify calls from the frontend are unnecessary in most cases.
 * 
 * Use only if you need to update user traits independently of tracking events.
 */
export const identify = () => {
    invoke('identify');
}

/**
 * Trigger group/organization update in analytics platform
 * 
 * NOTE: This function is provided as an example but is typically not used.
 * The backend automatically handles group calls when processing track events,
 * and scheduled jobs handle regular group updates with fresh license data.
 * 
 * Use only if you need to update group traits independently of tracking events.
 */
export const group = () => {
    invoke('group');
}