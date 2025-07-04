import { fetch } from '@forge/api';

/**
 * Send track events to analytics provider
 */
export const handleTrackEvent = async (userId, event) => {
    await dispatch("events", {
        user_id: userId,
        event: event
    });
}

/**
 * Update user profile in analytics
 */
export const handleIdentify = async (userId, groupId, traits) => {
    await dispatch("users", {
        user_id: userId,
        group_id: groupId,
        traits: traits
    });
}

/**
 * Update organization profile in analytics
 */
export const handleGroup = async (groupId, traits) => {
    await dispatch("groups", {
        group_id: groupId,
        traits: traits,
    });
}

/**
 * Dispatch analytics events to Accoil API
 * Supports debug mode via ANALYTICS_DEBUG env var
 */
const dispatch = async (eventType, event) => {
    const apiKey = process.env.ANALYTICS_API_KEY;
    
    const payload = JSON.stringify({
        ...event,
        api_key: apiKey,
        timestamp: Date.now(),
    });
    
    const url = `https://in.accoil.com/v1/${eventType}`;

    if (process.env.ANALYTICS_DEBUG?.toLowerCase() === "true") {
        // Create debug payload without API key for logging
        const debugPayload = JSON.stringify({
            ...event,
            api_key: "[REDACTED]",
            timestamp: Date.now(),
        });
        console.log(`Running analytics in debug. The following payload would be sent to ${url}:\n${debugPayload}`);
    } else {
        await fetch(url, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: payload
        });
    }
}