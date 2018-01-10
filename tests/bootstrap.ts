import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

// disable @Service warning
process.env.ALPHA_DIC_NO_SERVICE_CONTAINER = "1";