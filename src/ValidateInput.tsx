import React, { useState } from 'react';
import { ValidationInputProps } from './types';
import { useValidation } from './useValidation';

const defaultProps: ValidationInputProps = {
    rules: [],
    Wrapper: React.Fragment,
    InputComponent: 'input',
    type: 'text',
    bindEventListener: 'onChange',
    children: () => null,
    defaultValue: undefined,
    validateOnMount: false,
    onValidityChanged: () => {},
    onValiditySuccess: () => {},
    onValidityFailure: () => {},
};

const ValidateInput = ({
    rules,
    config,
    defaultValue,
    Wrapper,
    InputComponent,
    inputValueParser,
    bindEventListener,
    validateOnMount,
    onValidityChanged,
    onValiditySuccess,
    onValidityFailure,
    children,
    ...props
}: ValidationInputProps) => {
    const [inputValue, setInputValue] = useState(defaultValue);
    const validity = useValidation(inputValue, rules, {
        inputName: props.name,
        validateOnMount,
        onValidityChanged,
        onValiditySuccess,
        onValidityFailure,
    });

    const attachedEventListener = (event: React.ChangeEvent<any>, ...args) => {
        if (inputValueParser) {
            setInputValue(inputValueParser(event, ...args));
        } else if (typeof event.currentTarget?.value !== 'undefined') {
            setInputValue(event.currentTarget.value);
        } else {
            console.log('Can not find input value to validate against');
        }

        if (typeof props[bindEventListener] === 'function') {
            props[bindEventListener](event);
        }
    };

    const componentProps: { [key: string]: any } = {
        ...props,
        defaultValue,
        [bindEventListener]: attachedEventListener,
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
            {children(validity)}
        </Wrapper>
    );
};
ValidateInput.defaultProps = defaultProps;

export { ValidateInput };
