import { Text, TextProps } from "@chakra-ui/react";

function DiffValue({ diff, ...props }: { diff: number } & TextProps) {
  const value = isNaN(diff) ? 0 : Number(diff.toFixed(2));
  let color: string;

  switch (true) {
    case value > 0:
      color = "green.400";
      break;
    case value < 0:
      color = "red.400";
      break;
    default:
      color = "gray.500";
  }

  return (
    <Text as="span" color={color} {...props}>
      {value}€
    </Text>
  );
}

export default DiffValue;
