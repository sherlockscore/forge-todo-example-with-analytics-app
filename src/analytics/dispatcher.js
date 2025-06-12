import { fetch } from '@forge/api';

export const handleTrackEvent = async (userId, event) => {
    // any specific handling relevant to track events you want
    await dispatch("events", {
        user_id: userId,
        event: event
    });
}

export const handleIdentify = async (userId, groupId, traits) => {
    // any specific handling relevant to identify events you want
    await dispatch("users", {
        user_id: userId,
        group_id: groupId,
        traits: traits
    });
}

export const handleGroup = async (groupId, traits) => {
    // any specific handling relevant to group events you want
    await dispatch("groups", {
        group_id: groupId,
        traits: traits,
    });
}

const dispatch = async (eventType, event) => {
    // This needs to be set with "forge variables set ANALYTICS_API_KEY <key>" (optionally with an environment)
    // Any changes to this key will require a re-deploy
    const apiKey = process.env.ANALYTICS_API_KEY;
    await fetch(`https://in.accoil.com/v1/${eventType}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            ...event,
            api_key: apiKey,
            timestamp: Date.now(),
        })
    });
}