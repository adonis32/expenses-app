import React from "react";
import { createPack } from "react-component-pack";
import AuthProvider from "./context/auth";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CSSReset } from "@chakra-ui/core";

const ProviderPack = createPack(AuthProvider);

function Root() {
  return (
    <ThemeProvider>
      <CSSReset />
      <BrowserRouter>
        <ProviderPack>
          <App />
        </ProviderPack>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default Root;
