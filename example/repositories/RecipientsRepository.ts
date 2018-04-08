import {Config, Service} from "../../src";
import {names} from "../container";

@Service(names.repository.recipients)
export class RecipientsRepository {
    // just an example of configuration injection. If env.MAX_RECIPIENTS does not exist then default value (in that case: 10) is injected
    constructor(@Config('env.MAX_RECIPIENTS', 10) maxRecipients: number) {
        console.log('maxRecipients config value', maxRecipients);
    }
}