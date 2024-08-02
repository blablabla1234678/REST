import {
    RepresentationValidator
} from '../lib/RepresentationValidator.js';
import assert from 'assert';

describe('RepresentationValidator.validate', function (){

    const validator = new RepresentationValidator();

    it('should validate simple types', () => {
        const doc = {
            opX: {
                type: "Hyperlink",
                response: {
                    type: "A"
                }
            },
            A: {
                type: "String",
                required: true,
                length: [1,255]
            }
        };
        validator.documentation(doc);
        const result = validator.validate(doc.opX.response, "example string");
        assert.deepEqual(result, []);
        const result2 = validator.validate(doc.opX.response, 2);
        assert.deepEqual(result2, [{message: "Value must be a string."}]);
    });
});
