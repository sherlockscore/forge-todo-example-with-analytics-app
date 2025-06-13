/**
 * Extract privacy-safe user identifier from Forge context
 * 
 * This function provides flexible user identification strategy:
 * - Default: Uses individual accountId for per-user tracking
 * - Override mode: Uses cloudId for instance-level tracking (reduces MTU costs)
 * 
 * The override is useful for reducing Monthly Tracked Users (MTU) billing
 * by consolidating all users in an instance under a single identifier.
 * 
 * @param {Object} context - Forge resolver context
 * @returns {string} User identifier (accountId or cloudId based on configuration)
 */
export const userIdFromContext = (context) => {
    if (process.env.ANALTYICS_USER_ID_OVERRIDE?.toLowerCase() === "true") {
        // Cost optimization: Use instance ID for all users to reduce MTU
        return groupIdFromContext(context);
    } else {
        // Standard mode: Track individual users via Atlassian account ID
        return context.accountId;
    }
}

/**
 * Extract organization/instance identifier from Forge context
 * 
 * Uses cloudId which represents the Atlassian Cloud instance/site.
 * This provides instance-level tracking for organizational analytics.
 * 
 * @param {Object} context - Forge resolver context
 * @returns {string} Cloud instance identifier
 */
export const groupIdFromContext = (context) => {
    return context.cloudId;
}