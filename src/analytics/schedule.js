import {handleGroup} from "./dispatcher";

export const dailyGroupAnalytics = async ({ context }) => {
    const traits = {
        name: context.cloudId,
        isActive: context?.license?.isActive,
        isEvaluation: context?.license?.isEvaluation,
        lastDailySync: new Date().toISOString(),
    };

    handleGroup(context.cloudId, traits);
}