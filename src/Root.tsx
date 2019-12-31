import React from "react";
import { createPack } from "react-component-pack";
import AuthProvider from "./context/auth";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

const ProviderPack = createPack(AuthProvider);

function Root() {
  return (
    <BrowserRouter>
      <ProviderPack>
        <App />
      </ProviderPack>
    </BrowserRouter>
  );
}

export default Root;
