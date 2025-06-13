import {handleGroup} from "./dispatcher";
import {groupIdFromContext} from "./utils";

export const dailyGroupAnalytics = async ({ context }) => {
    const traits = {
        name: context.cloudId,
        isActive: context?.license?.isActive,
        isEvaluation: context?.license?.isEvaluation,
        lastDailySync: new Date().toISOString(),
    };

    const groupId = groupIdFromContext(context);
    handleGroup(groupId, traits);
}