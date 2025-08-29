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
 * Supports multiple debug modes:
 * - ANALYTICS_DEBUG: Shows what would be sent (no actual HTTP request)
 * - ANALYTICS_TRACE_DEBUG: Makes real HTTP requests and logs full request/response details
 */
const dispatch = async (eventType, event) => {
    const apiKey = process.env.ANALYTICS_API_KEY;
    const isDebugMode = process.env.ANALYTICS_DEBUG?.toLowerCase() === "true";
    const isTraceDebugMode = process.env.ANALYTICS_TRACE_DEBUG?.toLowerCase() === "true";
    
    const payload = JSON.stringify({
        ...event,
        api_key: apiKey,
        timestamp: Date.now(),
    });
    
    const url = `https://in.accoil.com/v1/${eventType}`;

    // Create debug payload without API key for logging
    const debugPayload = JSON.stringify({
        ...event,
        api_key: "[REDACTED]",
        timestamp: Date.now(),
    });

    if (isDebugMode && !isTraceDebugMode) {
        // Standard debug mode: log payload but don't make HTTP request
        console.log(`Running analytics in debug. The following payload would be sent to ${url}:\n${debugPayload}`);
    } else {
        // Either normal mode or trace debug mode: make the actual HTTP request
        const startTime = Date.now();
        
        if (isTraceDebugMode) {
            console.log(`TRACE DEBUG: Making HTTP request to ${url}`);
            console.log(`TRACE DEBUG: Request headers:`, JSON.stringify({"Content-Type": "application/json"}, null, 2));
            console.log(`TRACE DEBUG: Request payload:\n${debugPayload}`);
        }

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: payload
            });

            const responseTime = Date.now() - startTime;
            
            if (isTraceDebugMode) {
                console.log(`TRACE DEBUG: Response received in ${responseTime}ms`);
                console.log(`TRACE DEBUG: Response status: ${response.status} ${response.statusText}`);
                console.log(`TRACE DEBUG: Response headers:`, JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
                
                // Try to read response body
                try {
                    const responseText = await response.text();
                    console.log(`TRACE DEBUG: Response body: ${responseText || '[empty]'}`);
                } catch (bodyError) {
                    console.log(`TRACE DEBUG: Could not read response body:`, bodyError.message);
                }
            }

            // Check if request was successful
            if (!response.ok) {
                const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                if (isTraceDebugMode) {
                    console.error(`TRACE DEBUG: Request failed:`, error.message);
                }
                throw error;
            }

            if (isTraceDebugMode) {
                console.log(`TRACE DEBUG: Request completed successfully`);
            }

        } catch (error) {
            const responseTime = Date.now() - startTime;
            
            if (isTraceDebugMode) {
                console.error(`TRACE DEBUG: Request failed after ${responseTime}ms`);
                console.error(`TRACE DEBUG: Error type:`, error.constructor.name);
                console.error(`TRACE DEBUG: Error message:`, error.message);
                console.error(`TRACE DEBUG: Full error:`, error);
            }
            
            // Re-throw error so calling code can handle it
            throw error;
        }
    }
}