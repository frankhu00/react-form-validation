import { useState, useEffect, useRef } from 'react';
import {
    ValidationRule,
    ValidationState,
    ValidationConfig,
    UseValidationResponse,
    ValidateFn,
} from './types';

const executeValidators = (inputValue: any, rules: ValidationRule[]) => {
    const messages: string[] = [];
    const validationResults: boolean[] = rules.map((rule) => {
        const verified = rule.validator(inputValue);
        if (!verified) {
            messages.push(rule.message);
        }
        return verified;
    });

    const result: ValidationState = {
        passed: validationResults.every((r) => r),
        messages,
    };

    return result;
};

const defaultInitialValidity: ValidationState = {
    passed: true,
    messages: [],
};

/**
 * Core logic to parses the validation rules and validates the input value whenever it changes.
 * Returns `{ validity: ValidationState, validate: ValidateFn }`. The `validate` fn is so you can manually trigger the validation logic
 *
 * @param inputValue Value of the input component
 * @param rules Validation rules that applies
 * @param config ValidationConfig:
 * - **inputName?**: string - Name associated with the input component. This is passed as the 3rd argument in onValidity handlers
 * - **validateOnMount?**: boolean - Immediately call the validation fn on mount when true
 * - **onValidityFailure?**: ValidationEventListener - Handler called when validation failed
 * - **onValiditySuccess?**: ValidationEventListener - Handler called when validation passed
 * - **onValidityChanged?**: ValidationEventListener - Handler called when validation state switches
 * - **ValidationEventListener** is defined as `(state: ValidationState, value: any, name?: string) => void`
 *
 * @returns UseValidationResponse:
 * - **validity**: ValidationState - State of the validation result. Defined as `{ passed: boolean, messages: string[] }`
 * - **validate**: ValidateFn - Fn to directly trigger validation logic. Defined as `(inputValue: any, updateState?: boolean) => any`.
 *
 * ***Note***: When `updateState` argument in `validate` fn is `true`, nothing will be returned from the call and will directly update the internal state
 * that tracks the validation state. If `false`, the internal state will NOT be updated, but will return the validation state from the call.
 * This is useful when you want to do the validation check manually before performing another action.
 */
export const useValidation: (
    inputValue: any,
    rules: ValidationRule[],
    config: ValidationConfig
) => UseValidationResponse = (inputValue, rules, config) => {
    const {
        inputName,
        validateOnMount,
        onValidityChanged,
        onValiditySuccess,
        onValidityFailure,
    } = config;
    const initialValidity: ValidationState = !!validateOnMount
        ? executeValidators(inputValue, rules)
        : defaultInitialValidity;
    const [validity, setValidity] = useState<ValidationState[]>([
        initialValidity, //current
        initialValidity, //prev
    ]);
    const isOnMount = useRef<boolean>(true);

    const updateValidationState: ValidateFn = (value: any) =>
        setValidity((prev) => {
            const state = executeValidators(value, rules);
            if (state.passed !== prev[0].passed && onValidityChanged) {
                onValidityChanged(state, value, inputName);
            }
            if (state.passed && onValiditySuccess) {
                onValiditySuccess(state, value, inputName);
            } else if (!state.passed && onValidityFailure) {
                onValidityFailure(state, value, inputName);
            }
            return [state, prev[0]];
        });

    // This is for manual trigger, which may not want to update state and just test if the newest value will pass validation
    const validate: ValidateFn = (value, updateState = true) =>
        updateState ? updateValidationState(value) : executeValidators(value, rules);

    useEffect(() => {
        if (isOnMount.current && !!validateOnMount) {
            updateValidationState(inputValue);
        }
    }, []);

    useEffect(() => {
        if (!isOnMount.current) {
            updateValidationState(inputValue);
        }
        return () => {
            isOnMount.current = false;
        };
    }, [inputValue]);

    return {
        validity: validity[0],
        validate,
    };
};
