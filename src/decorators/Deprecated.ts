import {deprecated} from "../middlewares/deprecated";
import {Annotation} from "./Annotation";

export function Deprecated(deprecationNote: string): any {
    return function (target: any) {
        Annotation(deprecated(deprecationNote))(target);
    }
}