/**
 * @param {import('../../app/components/Example.mjs').ControlOptions} options - The options.
 * @returns {JSX.Element} The returned JSX Element.
 */
const controls = ({ observer, ReactPCUI, React, jsx, fragment }) => {
    const { BindingTwoWay, BooleanInput, LabelGroup, Panel } = ReactPCUI;
    return fragment(
        jsx(
            Panel,
            { headerText: 'Lights' },
            jsx(
                LabelGroup,
                { text: '🟢 Omni' },
                jsx(BooleanInput, {
                    type: 'toggle',
                    binding: new BindingTwoWay(),
                    link: { observer, path: 'data.lights.omni' },
                    value: observer.get('data.lights.omni')
                })
            ),
            jsx(
                LabelGroup,
                { text: '🔴 Spot' },
                jsx(BooleanInput, {
                    type: 'toggle',
                    binding: new BindingTwoWay(),
                    link: { observer, path: 'data.lights.spot' },
                    value: observer.get('data.lights.spot')
                })
            ),
            jsx(
                LabelGroup,
                { text: '🟡 Directional' },
                jsx(BooleanInput, {
                    type: 'toggle',
                    binding: new BindingTwoWay(),
                    link: { observer, path: 'data.lights.directional' },
                    value: observer.get('data.lights.directional')
                })
            ),
            jsx(
                LabelGroup,
                { text: '    🟡 Soft' },
                jsx(BooleanInput, {
                    type: 'toggle',
                    binding: new BindingTwoWay(),
                    link: { observer, path: 'data.lights.soft' },
                    value: observer.get('data.lights.soft')
                })
            )
        )
    );
};

export { controls };
