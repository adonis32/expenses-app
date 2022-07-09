import { Flex, CircularProgress } from "@chakra-ui/react";

function LoadingScreen() {
  return (
    <Flex
      height="100%"
      width="100%"
      alignItems="center"
      justifyContent="center"
    >
      <CircularProgress isIndeterminate={true} />
    </Flex>
  );
}

export default LoadingScreen;
