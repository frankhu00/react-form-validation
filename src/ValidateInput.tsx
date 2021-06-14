import React, { useState } from 'react';
import { UseValidationResponse, ValidationInputProps } from './types';
import { useValidation } from './useValidation';

const defaultProps: ValidationInputProps = {
    rules: [],
    Wrapper: React.Fragment,
    InputComponent: 'input',
    type: 'text',
    bindEventListener: ['onChange'],
    bindValidityToEvent: [],
    children: () => null,
    defaultValue: undefined,
    validateOnMount: false,
    onValidityChanged: () => {},
    onValiditySuccess: () => {},
    onValidityFailure: () => {},
};

/**
 * Higher order component that attaches the `useValidation` hook to the provided input component.
 * Default input component is set to `<input type="text" />` and binds the validation call to `onChange` event listener.
 *
 * Important props:
 * - **rules**: ValidationRule[] - an array of validation rules
 * - **InputComponent**: React.ElementType<any> | React.FC<any> - specifies what input component to use. Default: `<input />`
 * - **Wrapper**: React.ElementType<any> - specifies wrapper component around the input component. Default: `React.Fragment`
 * - **inputValueParser**: function - function used to specify how to get the input value from the input component.
 *  Pulls from `event.currentTarget.value` if undefined. Default: `undefined`
 * - **bindEventListener**: string[] - specifies which event listener to bind the validation call to and also return the validation state as 2nd argument to event handler.
 * Default: `["onChange"]`
 * - **bindValidityToEvent**: string[] - specifies which event listener to attach the validation state to (2nd argument) ***WITHOUT*** calling the validation function.
 * This has lower priority than `bindEventListener` if there is an overlap of events. Default: `[]`
 * - **validateOnMount**: boolean - validates the input on component mount when true. Default: `false`
 * - **onValidityChange**: (validity: ValidationState, inputValue: any, name?: string) => void - an event listener that triggers when validation state (`validity.passed`) changes
 * - **onValiditySuccess**: (validity: ValidationState, inputValue: any, name?: string) => void - an event listener that triggers when validation state (`validity.passed`) evaluates to true
 * - **onValidityFailure**: (validity: ValidationState, inputValue: any, name?: string) => void - an event listener that triggers when validation state (`validity.passed`) evaluates to false
 * - **children**: (validity: ValidationState, validate: ValidateFn) => React.ReactNode - Specifies additional elements to be rendered after the input component. Must be a function. Default: `undefined`.
 * The `validate` fn is to provide a manual way of calling the validation on that input component.
 *
 * The rest of the props are passed as-is into the input component
 * Note: `props.type` is defaulted to `"text"`
 * Note: `props.defaultValue` is used as the 1st input value to validate against
 *
 * @param props ValidationInputProps
 * @returns
 */
const ValidateInput = ({
    rules,
    defaultValue,
    Wrapper,
    InputComponent,
    inputValueParser,
    bindEventListener,
    bindValidityToEvent,
    validateOnMount,
    onValidityChanged,
    onValiditySuccess,
    onValidityFailure,
    children,
    ...props
}: ValidationInputProps) => {
    const [inputValue, setInputValue] = useState(defaultValue);
    const { validity, validate } = useValidation(inputValue, rules, {
        inputName: props.name,
        validateOnMount,
        onValidityChanged,
        onValiditySuccess,
        onValidityFailure,
    });

    /**
     * Generates a map of event handlers that will call the validate fn and the original event handler and attaches validation state
     * as the 2nd argument
     */
    const generateValidationEvent = () => {
        const validateOnEvent = {};
        bindEventListener.forEach((event: string) => {
            validateOnEvent[event] = attachedEventListener(event);
        });
        return validateOnEvent;
    };

    /**
     * Generates a map of event handlers that will attach the validation state (validity) to original event handler as 2nd argument
     */
    const generateAppendValidityEvent = () => {
        const validityForEvent = {};
        bindValidityToEvent.forEach((event: string) => {
            validityForEvent[event] = callOriginalEventHandlers(event);
        });
        return validityForEvent;
    };

    /**
     * Used to bind an event handler to call the validation logic in addition to its original functionality
     */
    const attachedEventListener = (bindEvent: string) => (
        event: React.ChangeEvent<any>,
        ...args
    ) => {
        if (inputValueParser) {
            setInputValue(inputValueParser(event, ...args));
        } else if (typeof event.currentTarget?.value !== 'undefined') {
            setInputValue(event.currentTarget.value);
        } else {
            console.log(
                'Can not find input value to validate against. Using fallback method. Consider defining "inputValueParser" to manually define input value'
            );
            setInputValue(args);
        }

        callOriginalEventHandlers(bindEvent)(event, ...args);
    };

    /**
     * Calls the original event handler but attaches UseValidationResponse to the 2nd argument
     */
    const callOriginalEventHandlers = (eventName: string) => (
        event: React.ChangeEvent<any>,
        ...args: [...any]
    ) => {
        if (typeof props[eventName] === 'function') {
            const ValidationResponse: UseValidationResponse = { validity, validate };
            props[eventName](event, ValidationResponse, ...args);
        }
    };

    const componentProps: { [key: string]: any } = {
        ...props,
        defaultValue,
        ...generateAppendValidityEvent(), //this first same events are overriden by generateValidationEvent
        ...generateValidationEvent(),
    };

    const renderInputComponent = () => {
        if (typeof InputComponent === 'function') {
            const comp = InputComponent as React.FC;
            return comp(componentProps);
        } else {
            return <InputComponent {...componentProps} />;
        }
    };

    return (
        <Wrapper>
            {renderInputComponent()}
            {children(validity, validate)}
        </Wrapper>
    );
};
ValidateInput.defaultProps = defaultProps;

export { ValidateInput };
