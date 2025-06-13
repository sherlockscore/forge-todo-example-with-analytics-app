export const userIdFromContext = (context) => {
    if (process.env.ANALTYICS_GROUP_ID_OVERRIDE?.toLowerCase() === "true") {
        return groupIdFromContext(context);
    } else {
        return context.accountId;
    }
}

export const groupIdFromContext = (context) => {
    return context.cloudId;
}