import {configMiddleware, getConfigProviderForContainer} from '@src/middlewares/config';
import {create, errors} from "@src/index";
import {configProviderForObject} from "@src/ConfigProvider";
import {assertThrowsErrorWithCode} from "../common";

describe('config', () => {

    it('sets config provider on attach', () => {
        const container = create();
        const provider = configProviderForObject({});
        const middleware = configMiddleware(provider);

        assertThrowsErrorWithCode(
            () => getConfigProviderForContainer(container),
            errors.CONFIG_PROVIDER_NOT_ATTACHED
        );
        container.addMiddleware(middleware);

        expect(getConfigProviderForContainer(container))
            .toStrictEqual(provider);
    });
});