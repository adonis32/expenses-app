import React from "react";
import { createPack } from "react-component-pack";
import AuthProvider from "./context/auth";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "@chakra-ui/pro-theme";

const ProviderPack = createPack(AuthProvider);

function Root() {
  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <ProviderPack>
          <App />
        </ProviderPack>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default Root;
