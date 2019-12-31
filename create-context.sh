#!/bin/bash

# Parameter 1: Component name in PascalCase
# Paremeter 2 (Optional): Parent component folder 

function toKebabCase {
  echo $1 | sed -e 's/\([A-Z]\)/-\1/g' -e 'y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/' -e 's/^-//'
}

function toCamelCase {
  WORD=$1
  echo $(echo ${WORD:0:1} | tr "[A-Z]" "[a-z]")${WORD:1}
}

COMPONENT_NAME=$1
PARENT_COMPONENT_DIR=$2
COMPONENT_NAME_CAMELCASE=$(toCamelCase $COMPONENT_NAME)
COMPONENT_NAME_KEBABCASE=$(toKebabCase $COMPONENT_NAME)
INIT_PATH=$(pwd)

cd ./src/context/$PARENT_COMPONENT_DIR
mkdir $COMPONENT_NAME_KEBABCASE
cd $COMPONENT_NAME_KEBABCASE

COMPONENT_TEMPLATE="import React, { createContext, useContext } from 'react';

export interface ${COMPONENT_NAME}Context {

}

export const ${COMPONENT_NAME}Context = createContext<${COMPONENT_NAME}Context>({});

export function use${COMPONENT_NAME}() {
  return useContext(${COMPONENT_NAME}Context);
}

interface ${COMPONENT_NAME}ProviderProps {
  children: React.ReactNode;
}

function ${COMPONENT_NAME}Provider({ children }: ${COMPONENT_NAME}ProviderProps) {
  return (
    <${COMPONENT_NAME}Context.Provider value={{}}>
      {children}
    </${COMPONENT_NAME}Context.Provider>
  );
}

export default ${COMPONENT_NAME}Provider;
"

INDEX_TEMPLATE="export { default } from './${COMPONENT_NAME}Context';
export * from './${COMPONENT_NAME}Context';
"

echo "$COMPONENT_TEMPLATE" > ${COMPONENT_NAME}Context.tsx
echo "$INDEX_TEMPLATE" > index.tsx

cd $INIT_PATH
