# Validation for inputs and forms

# WIP

# Main Exports

## ValidationInput

Higher order component that calls `useValidation` hook to the input component

## useValidation

Main validation logic

## Validation Rules

### RequiredRule

Input must be have a value

### PatternRule

Input must match regex pattern

### LengthRangeRule

Input length must be within the specified range

### UniqueValueRule

Input must be unique within an array of existing values

### CustomRule

Must provide a validator function
