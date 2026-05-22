import type { STATUS, TYPE } from "../../types";

export interface IIssue{
    title:string;
    description:string;
    type:TYPE;
    status:STATUS;
}