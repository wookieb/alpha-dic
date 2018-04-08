import {Hook, onActivation} from "../";
import {Annotation} from "./Annotation";

export function OnActivation(hook: Hook) {
    return (target: any) => {
        Annotation(onActivation(hook))(target);
    }
}