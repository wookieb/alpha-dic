import {Annotation, Service} from "../../src";
import {controller} from "../container";

@Service()
@Annotation(controller('/recipients')) // this is obviously dumb solution but good enough for example purposes
export class RecipientsController {

}