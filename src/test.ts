import {Service} from "./decorators/Service";
import {Inject} from "./decorators/Inject";

@Service()
class Test {

    @Inject('b')
    property: any;

    constructor(@Inject('a') arg1: any) {

    }
}