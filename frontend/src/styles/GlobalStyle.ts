import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: 'Segoe UI', system-ui, sans-serif;
    background-color: #f4f6f8;
    color: #1f2933;
  }

  a {
    color: inherit;
  }

  button {
    font-family: inherit;
  }
`;
