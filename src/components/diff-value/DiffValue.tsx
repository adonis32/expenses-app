import { Text, TextProps } from "@chakra-ui/react";
import Dinero from "dinero.js";

function DiffValue({
  diff,
  positiveColor = "green.400",
  currency = "EUR",
  ...props
}: {
  diff: Dinero.Dinero;
  currency?: Dinero.Currency;
  positiveColor?: string;
} & TextProps) {
  let color: string;

  const amount = diff.getAmount();

  switch (true) {
    case amount > 0:
      color = positiveColor;
      break;
    case amount < 0:
      color = "red.400";
      break;
    default:
      color = "gray.500";
  }

  return (
    <Text as="span" color={color} {...props}>
      {Dinero({ amount, currency }).setLocale("es-ES").toFormat("$0.00")}
    </Text>
  );
}

export default DiffValue;
