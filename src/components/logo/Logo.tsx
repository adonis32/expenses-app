import { Box, BoxProps } from "@chakra-ui/react";

export interface LogoProps {
  boxSize?: BoxProps["boxSize"];
  fontSize?: BoxProps["fontSize"];
}

function Logo({ boxSize, fontSize }: LogoProps) {
  return (
    <Box
      role="img"
      boxSize={boxSize}
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontSize={fontSize}
      lineHeight="1"
      bgColor="black"
      textColor="#FFFF00"
      rounded="full"
      userSelect="none"
      fontWeight="bold"
      fontFamily="monospace"
    >
      $
    </Box>
  );
}

export default Logo;
