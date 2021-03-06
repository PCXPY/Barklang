/**
 * @fileoverview Util Error Test
 */

import { expect } from 'chai';
import { error, ERROR_CODE, errorMessage } from '../../src/execute/error';

describe('test error util functions', (): void => {

    it('error a error code should return target error', (): void => {
        const result = error(ERROR_CODE.INSTANT_EXTERNAL_FUNCTION_EXECUTE_FAILED);
        expect(result.message).to.be.equal('102: Instant instant function execute failed');
    });

    it('a returned arrow should be throwable', (): void => {
        const result = error(ERROR_CODE.INSTANT_FUNCTION_EXECUTE_FAILED);
        const throwThis = () => {
            throw result;
        };
        expect(throwThis).to.be.throw("101: Instant function execute failed");
    });

    it('error a unknown error code should return 900 error', (): void => {
        const result = error(999);
        expect(result.message).to.be.equal(errorMessage(ERROR_CODE.UNKNOWN_ERROR_CODE));
    });
});
