/**
 * @param {import('../src/app/components/Example.mjs').ControlOptions} options - The options.
 * @returns {JSX.Element} The returned JSX Element.
 */
function controls({ fragment }) {
    return fragment();
}

export { controls };
