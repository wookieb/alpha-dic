import {Annotation, Service} from "../../src";
import {controller} from "../container";

// "UsersController" will be inferred as service name
@Service()
@Annotation(controller('/user')) // this is obviously dumb solution but good enough for example purposes
export class UsersController {

}