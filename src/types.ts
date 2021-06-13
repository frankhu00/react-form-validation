import React from 'react';

export enum ValidationRuleTypes {
    required = 'required',
    pattern = 'pattern',
    lengthRange = 'length-range',
    uniqueValue = 'unique-value',
}

export type ValidatorFn = (inputValue: any) => boolean;

export interface ValidationRule {
    type: ValidationRuleTypes;
    value: any;
    message: string;
    validator: ValidatorFn;
}

export interface ValidationRuleOptions {
    message?: string;
    transformer?: (inputValue: any) => any;
    validator?: (inputValue: any, ruleValue: any) => boolean;
}

export interface RequiredRuleOptions extends ValidationRuleOptions {
    exceptions?: any[];
}

export interface PatternRuleOptions extends ValidationRuleOptions {
    inverse?: boolean;
}

export type ComparatorFn = (a: any, b: any) => boolean;

export interface UniqueValueRuleOptions extends ValidationRuleOptions {
    inverse?: boolean;
    comparator?: ComparatorFn;
    haystackTransformer?: (hay: any) => any;
}

export interface ValidationState {
    passed: boolean;
    messages: string[];
}

//For manually running the validate fn inside the useValidation hook
export type ValidateFn = (value: any) => void;

export interface UseValidationResponse {
    validity: ValidationState;
    validate: ValidateFn;
}

export type ValidationEventListener = (state: ValidationState, value: any, name?: string) => void;

export interface ValidationConfig {
    inputName?: string;
    validateOnMount?: boolean;
    onValidityFailure?: ValidationEventListener;
    onValiditySuccess?: ValidationEventListener;
    onValidityChanged?: ValidationEventListener;
}

export interface ValidationInputProps {
    rules: ValidationRule[];
    children: (validity: ValidationState, validate: ValidateFn) => React.ReactNode;
    InputComponent?: React.ElementType | React.FC<any>;
    validateOnMount?: boolean;
    onValidityChanged?: ValidationEventListener;
    onValiditySuccess?: ValidationEventListener;
    onValidityFailure?: ValidationEventListener;
    bindEventListener?: string;
    defaultValue?: any;
    inputValueParser?: (...args: [...any]) => any;
    Wrapper?: React.ElementType;
    [key: string]: any;
}
