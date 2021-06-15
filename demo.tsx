import React, { useState } from 'react';
import { render } from 'react-dom';
import { ValidateInput, PatternRule, LengthRangeRule, RequiredRule, UniqueValueRule } from './src';

const flexColumn: React.CSSProperties = { display: 'flex', flexDirection: 'column' };

const Demo = () => {
    const [unique, setUnique] = useState(['aa', 'bb']);
    const [text, setText] = useState('');
    return (
        <main
            style={{
                ...flexColumn,
                justifyContent: 'center',
                alignItems: 'center',
                width: '60vw',
                height: '100vh',
                margin: 'auto',
            }}
        >
            <h1>Validation Input Demo I</h1>
            <ValidateInput
                name="demo-text"
                title="demo-text"
                placeholder="Must start with @ with max length of 5"
                rules={[
                    PatternRule(/^@/, { message: 'Input must start with "@"' }),
                    LengthRangeRule(-1, 5, { message: 'Max character: 5' }),
                ]}
                inputValueParser={(e) => {
                    return e.target.value.trim();
                }}
                onValidityChanged={(state, _, name) => {
                    console.log(name, { state });
                }}
            >
                {({ passed, messages }) =>
                    passed ? null : (
                        <div style={flexColumn}>
                            <span>Validation Errors:</span>
                            {messages.map((m, idx) => (
                                <div key={idx}>{m}</div>
                            ))}
                        </div>
                    )
                }
            </ValidateInput>
            <h1>Validation Input Demo II</h1>
            <ValidateInput
                name="demo-number"
                type="number"
                title="demo-number"
                defaultValue={12}
                rules={[
                    RequiredRule({
                        exceptions: [0], //otherwise value of 0 will be treated as not filled in
                        transformer: (value) => parseInt(value),
                    }),
                    LengthRangeRule(2, -1),
                ]}
                onValidityChanged={(state, _, name) => {
                    console.log(name, { state });
                }}
            >
                {({ passed, messages }) =>
                    passed ? null : (
                        <div style={flexColumn}>
                            {messages.map((m, idx) => (
                                <div key={idx}>{m}</div>
                            ))}
                        </div>
                    )
                }
            </ValidateInput>
            <h1>Validation Input Demo III</h1>
            <ValidateInput
                name="demo-select"
                title="demo-select"
                InputComponent={(props) => (
                    <select {...props}>
                        <option value="">None</option>
                        <option value="haha">Haha</option>
                    </select>
                )}
                rules={[RequiredRule()]}
                onValidityChanged={(state, _, name) => {
                    console.log(name, { state });
                }}
                validateOnMount={true}
            >
                {({ passed, messages }) =>
                    passed ? null : (
                        <div style={flexColumn}>
                            {messages.map((m, idx) => (
                                <div key={idx}>{m}</div>
                            ))}
                        </div>
                    )
                }
            </ValidateInput>
            <h1>Validation Input Demo IV</h1>
            <div>
                <h5>Can not be one of the following:</h5>
                {unique.map((u, idx) => (
                    <div key={idx}>{u}</div>
                ))}
            </div>
            <ValidateInput
                name="demo-uniq"
                title="demo-uniq"
                rules={[UniqueValueRule(unique)]}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setText(e.currentTarget.value)
                }
                onBlur={(e, v, ...args) => {
                    console.log('onBlur', {
                        e,
                        v,
                        r: args,
                    });
                }}
                bindEventListener={['onBlur', 'onChange']}
                bindValidityToEvent={['onKeyDown']}
                onKeyDown={(e, v) => {
                    //this does not run validate fn as its binded using bindValidityToEvent
                    //this just has validity info (but may not be correct since validate isn't called)
                    console.log(v);
                }}
                onValidityChanged={(state, _, name) => {
                    console.log(name, { state });
                }}
                validateOnMount={true}
                Wrapper={'div'}
                value={text}
            >
                {({ passed, messages }) => (
                    <div style={flexColumn}>
                        {messages.map((m, idx) => (
                            <div key={idx}>{m}</div>
                        ))}
                        <button
                            type="button"
                            onClick={() => {
                                setUnique((prev) => [...prev, text]);
                                setText('');
                            }}
                            disabled={!passed}
                        >
                            Add
                        </button>
                    </div>
                )}
            </ValidateInput>
        </main>
    );
};

render(<Demo />, document.getElementById('root'));
