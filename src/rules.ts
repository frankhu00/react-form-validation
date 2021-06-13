import {
    ValidatorFn,
    ValidationRule,
    ValidationRuleTypes,
    ValidationRuleOptions,
    RequiredRuleOptions,
    PatternRuleOptions,
    UniqueValueRuleOptions,
    ComparatorFn,
} from './types';

/**
 * Requires the input to be filled. Use exceptions array to define falsy values that should result to true.
 * I.E. Numeric 0 evaluates to false by default, but having `{ exceptions: [0] }` will make it so numeric 0 is accepted as
 * a valid value
 *
 * @param options RequiredRuleOptions:
 *  - **exceptions**: any[] - specifies an array of values that acts as exceptions and will validate to true when the input value matches any value
 * within the exceptions array. This is mainly used to make falsy values evaluate to true under certain cases, I.E., to evaluate numeric 0 as truthy.
 * Default `[]`
 *
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
 * @param options PatternRuleOptions:
 *  - **message**: string - Error message
 *  - **transformer**: (value: any) => any - Used to transform the input value before getting passed to validation fn
 *  - **validator**: (inputValue: any, ruleValue: any) => boolean - To override the validation fn for this rule. Default changes depending on the ValidationRule used
 *  - **inverse**: boolean - Reverses the validation result when true. Default: `false`
 *
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
 * Defines the length required for the input. Use -1 for min / max to disable min / max checks.
 * @param min number - Use -1 to ignore min length restriction. Default: `-1`
 * @param max number - Use -1 to ignore max length restriction. Default: `-1`
 * @param options ValidationRuleOptions:
 *  - **message**: string - Error message
 *  - **transformer**: (value: any) => any - Used to transform the input value before getting passed to validation fn
 *  - **validator**: (inputValue: any, ruleValue: any) => boolean - To override the validation fn for this rule. Default changes depending on the ValidationRule used
 *
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
        message: message ?? 'Validation: LengthRangeRule failed',
        validator: verify,
    };
};

const defaultComparator: ComparatorFn = (a, b) => a === b;

/**
 * Validate the input value against an array of values (haystack) to ensure input value's uniqueness among the array of values.
 * @param existing any[] - array of values that the input value can not be
 * @param options UniqueValueRuleOptions :
 *  - **message**: string - Error message
 *  - **transformer**: (value: any) => any - Used to transform the input value before getting passed to validation fn
 *  - **validator**: (inputValue: any, ruleValue: any) => boolean - To override the validation fn for this rule. Default changes depending on the ValidationRule used
 *  - **inverse**: boolean - reverses validation result when true. Default: `false`
 *  - **comparator**: (inputValue, haystackValue) => boolean - Used to override how input value and haystack values are compared. Defaults to using `===`
 *  - **haystackTransformer**: (haystayckValue: any) => any - Same as `transformer` but for the haystack
 *
 * @returns ValidationRule
 */
export const UniqueValueRule: (
    existing: any[],
    options?: UniqueValueRuleOptions
) => ValidationRule = (
    existing,
    {
        message,
        transformer,
        validator,
        inverse = false,
        comparator = defaultComparator,
        haystackTransformer,
    } = {}
) => {
    const verify: ValidatorFn = (inputValue) => {
        const input: any = transformer ? transformer(inputValue) : inputValue;
        const haystack = existing.map((exist) =>
            haystackTransformer ? haystackTransformer(exist) : exist
        );
        const result = validator
            ? validator(input, haystack)
            : haystack.filter((exist) => comparator(input, exist)).length === 0;
        return inverse ? !result : result;
    };

    return {
        type: ValidationRuleTypes.uniqueValue,
        value: existing,
        message: message ?? 'Validation: UniqueValueRule failed',
        validator: verify,
    };
};
