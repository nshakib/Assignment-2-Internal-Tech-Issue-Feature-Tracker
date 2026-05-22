// roles
export const USER_ROLE ={
    contributor: "contributor",
    maintainer: "maintainer"
} as const;



// types
export const TYPE_CATEGORY ={
    bug:"bug",
    feature_request:"feature_request"
}as const


// status
export  const ISSUE_STATUS = {
    open: "open",
    in_progress: "in_progress",
    resolved:"resolved"
}as const

export type ROLES = keyof typeof USER_ROLE;
export type TYPE = keyof typeof TYPE_CATEGORY;
export type STATUS = keyof typeof ISSUE_STATUS;