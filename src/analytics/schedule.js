/**
 * Scheduled analytics jobs for automated data collection
 * 
 * This module contains functions that run on scheduled intervals
 * to collect and send analytics data that doesn't originate from
 * direct user interactions.
 */
import {handleGroup} from "./dispatcher";
import {groupIdFromContext} from "./utils";

/**
 * Daily scheduled job to update organization analytics
 * 
 * This function runs once per day (configured in manifest.yml) to update
 * instance-level information in the analytics platform. It captures:
 * 
 * - License status (active/inactive)
 * - Evaluation status (trial vs. paid)
 * - Last sync timestamp for tracking data freshness
 * 
 * The scheduled trigger ensures we have current organizational data
 * even for inactive instances or apps that aren't being actively used.
 * 
 * @param {Object} context - Forge context with license and instance information
 */
export const dailyGroupAnalytics = async ({ context }) => {
    // Collect instance-level traits from Forge context
    const traits = {
        name: context.cloudId,
        isActive: context?.license?.isActive,
        isEvaluation: context?.license?.isEvaluation,
        lastDailySync: new Date().toISOString(), // Track when analytics were last updated
    };

    const groupId = groupIdFromContext(context);
    
    // Send group update directly (not through queue since this is already scheduled)
    handleGroup(groupId, traits);
}