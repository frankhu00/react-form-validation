import {
    ValidatorFn,
    ValidationRule,
    ValidationRuleTypes,
    ValidationRuleOptions,
    RequiredRuleOptions,
    PatternRuleOptions,
} from './types';

/**
 * Requires the input to be filled. Use exceptions array to define falsy values that should result to true.
 * I.E. Numeric 0 evaluates to false by default, but having `{ exceptions: [0] }` will make it so numeric 0 is accepted as
 * a valid value
 *
 * @param options RequiredRuleOptions
 * @returns ValidationRule
 */
export const RequiredRule: (options?: RequiredRuleOptions) => ValidationRule = ({
    message,
    transformer,
    validator,
    exceptions = [],
} = {}) => {
    const verify: ValidatorFn = (inputValue) => {
        const input: any = transformer ? transformer(inputValue) : inputValue;
        return validator
            ? validator(input, exceptions)
            : !!(input || exceptions.indexOf(input) > -1);
    };

    return {
        type: ValidationRuleTypes.required,
        value: exceptions,
        message: message ?? 'Validation: RequiredRule failed',
        validator: verify,
    };
};

/**
 * The input's value must match the defined regex (pattern as a string is converted to regex).
 * The inverse option makes it so the input must not match the defined pattern
 * @param pattern RegExp | string
 * @param options PatternRuleOptions
 * @returns ValidationRule
 */
export const PatternRule: (
    pattern: RegExp | string,
    options?: PatternRuleOptions
) => ValidationRule = (pattern, { message, transformer, validator, inverse = false } = {}) => {
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    const verify: ValidatorFn = (inputValue) => {
        const input: string = transformer ? transformer(inputValue) : inputValue;
        const validated = validator ? validator(input, regex) : regex.test(input);
        return inverse ? !validated : validated;
    };
    return {
        type: ValidationRuleTypes.pattern,
        value: regex,
        message: message ?? 'Validation: PatternRule failed',
        validator: verify,
    };
};

const defaultLengthRangeValidator: (value: any, range: number[]) => boolean = (value, range) => {
    const inputValue = typeof value === 'string' ? value.length : Number(value) || 0;
    const [min, max] = range;
    let passed = true;
    if (min > 0) {
        passed = inputValue >= min;
        //early termination
        if (!passed) {
            return passed;
        }
    }
    if (max > 0 && max > min) {
        passed = inputValue <= max;
    }
    return passed;
};

/**
 * Defines the number of characters required for the input. Use -1 for min / max to disable min / max checks.
 * @param min number
 * @param max number
 * @param options ValidationRuleOptions
 * @returns ValidationRule
 */
export const LengthRangeRule: (
    min: number,
    max: number,
    options?: ValidationRuleOptions
) => ValidationRule = (min = -1, max = -1, { message, transformer, validator } = {}) => {
    const range = [min, max];
    const verify: ValidatorFn = (inputValue) => {
        const input: number = transformer ? transformer(inputValue) : Number(inputValue);
        return validator ? validator(input, range) : defaultLengthRangeValidator(inputValue, range);
    };

    return {
        type: ValidationRuleTypes.lengthRange,
        value: range,
        message: message ?? 'Validation: LengthRule failed',
        validator: verify,
    };
};
