import { useState, useEffect, useRef } from 'react';
import { ValidationRule, ValidationState, ValidationConfig } from './types';

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

export const useValidation: (
    inputValue: any,
    rules: ValidationRule[],
    config: ValidationConfig
) => ValidationState = (inputValue, rules, config) => {
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

    const updateValidationState = (value: any) =>
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

    return validity[0]; //1st element is the current state
};
