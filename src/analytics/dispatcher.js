import { fetch } from '@forge/api';

/**
 * Handle track events by dispatching to Accoil's events endpoint
 * 
 * This function processes user action events (e.g., "Backend: Create", "Todo Items Loaded")
 * and sends them to the analytics platform with minimal, privacy-safe data. Accoil does not support
 * sending properties with events, so no provision is made for them in this method.
 * 
 * @param {string} userId - Privacy-safe user identifier (accountId or cloudId)
 * @param {string} event - Human-readable event name
 */
export const handleTrackEvent = async (userId, event) => {
    await dispatch("events", {
        user_id: userId,
        event: event
    });
}

/**
 * Handle user identification by updating user profile in analytics platform
 * 
 * Identify calls update user information and associate users with their organization.
 * We intentionally keep traits minimal to avoid transmitting PII.
 * 
 * @param {string} userId - Privacy-safe user identifier
 * @param {string} groupId - Organization/instance identifier (cloudId)
 * @param {Object} traits - User attributes (minimal, no PII)
 */
export const handleIdentify = async (userId, groupId, traits) => {
    await dispatch("users", {
        user_id: userId,
        group_id: groupId,
        traits: traits
    });
}

/**
 * Handle group (organization) profile updates
 * 
 * Group calls update organization-level information in the analytics platform.
 * Used for instance-level tracking and license/plan information.
 * 
 * @param {string} groupId - Organization identifier (cloudId)
 * @param {Object} traits - Organization attributes (license info, activity status, etc.)
 */
export const handleGroup = async (groupId, traits) => {
    await dispatch("groups", {
        group_id: groupId,
        traits: traits,
    });
}

/**
 * Core dispatch function that sends events to Accoil API
 * 
 * This function handles the HTTP transport layer for all analytics events.
 * It includes debug mode support and proper error handling for production use.
 * 
 * Design decisions:
 * - Uses environment variables for configuration to support multiple environments
 * - Includes timestamp at dispatch time for accurate event timing
 * - Debug mode prevents real API calls during development
 * - Proper Content-Type headers for JSON API communication
 * 
 * @param {string} eventType - API endpoint type ('events', 'users', 'groups')
 * @param {Object} event - Event payload with user_id, properties, etc.
 */
const dispatch = async (eventType, event) => {
    // API key must be set via Forge environment variables
    // Use: forge variables set ANALYTICS_API_KEY <your_key>
    // Note: Environment variable changes require a redeploy
    const apiKey = process.env.ANALYTICS_API_KEY;
    
    // Build complete payload with authentication and timing
    const payload = JSON.stringify({
        ...event,
        api_key: apiKey,
        timestamp: Date.now(), // Capture dispatch time for accurate analytics
    });
    
    const url = `https://in.accoil.com/v1/${eventType}`;

    // Debug mode: log payload instead of sending HTTP request
    // Useful for development and testing without affecting analytics data
    if (process.env.ANALYTICS_DEBUG?.toLowerCase() === "true") {
        console.log(`Running analytics in debug. The following payload would be sent to ${url}:\n${payload}`);
    } else {
        // Production mode: send actual HTTP request to Accoil API
        await fetch(url, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: payload
        });
        // Note: No explicit error handling here - let errors bubble up
        // The queue system will retry failed events automatically
    }
}