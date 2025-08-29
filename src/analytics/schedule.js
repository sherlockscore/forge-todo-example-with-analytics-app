/**
 * Scheduled analytics jobs for automated data collection
 *
 * This module contains functions that run on scheduled intervals
 * to collect and send analytics data that doesn't originate from
 * direct user interactions.
 */
import {handleGroup} from "./dispatcher";
import {groupIdFromContext} from "./utils";
import {getTodoCount} from "../index";
import {getAppContext} from "@forge/api";

/**
 * Daily scheduled job to update organization analytics
 *
 * This function runs once per day (configured in manifest.yml) to update
 * instance-level information in the analytics platform. It captures:
 *
 * - App version and environment information
 * - License status (active/inactive)
 * - All available license attributes as individual traits
 * - Evaluation status (trial vs. paid)
 * - Last sync timestamp for tracking data freshness
 *
 * The scheduled trigger ensures we have current organizational data
 * even for inactive instances or apps that aren't being actively used.
 *
 * @param {Object} context - Forge context with license and instance information
 */
export const dailyGroupAnalytics = async ({ context }) => {
    // Get the full app context using the API
    const appContext = await getAppContext();

    // Collect instance-level traits from Forge context
    const traits = {
        name: context.cloudId,
        lastDailySync: new Date().toISOString(), // Track when analytics were last updated
        totalTodoCount: `${await getTodoCount()}`,
        
        // App Context API - App Version
        appVersion: appContext.appVersion,
        
        // App Context API - Environment Type
        environmentType: appContext.environmentType,
        
        // App Context API - License attributes (all as individual traits)
        licenseIsActive: appContext?.license?.isActive,
        licenseIsEvaluation: appContext?.license?.isEvaluation,
        licenseBillingPeriod: appContext?.license?.billingPeriod,
        licenseCapabilitySet: appContext?.license?.capabilitySet ? JSON.stringify(appContext.license.capabilitySet) : undefined,
        licenseCcpEntitlementId: appContext?.license?.ccpEntitlementId,
        licenseCcpEntitlementSlug: appContext?.license?.ccpEntitlementSlug,
        licenseSubscriptionEndDate: appContext?.license?.subscriptionEndDate,
        licenseSupportEntitlementNumber: appContext?.license?.supportEntitlementNumber,
        licenseTrialEndDate: appContext?.license?.trialEndDate,
        licenseType: appContext?.license?.type,
    };

    // Filter out undefined values to keep payload clean
    const filteredTraits = Object.fromEntries(
        Object.entries(traits).filter(([_, value]) => value !== undefined)
    );

    const groupId = groupIdFromContext(context);

    // Send group update directly (not through queue since this is already scheduled)
    handleGroup(groupId, filteredTraits);
}