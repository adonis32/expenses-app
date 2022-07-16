import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  Tooltip,
  SliderThumb,
} from "@chakra-ui/react";
import { useState } from "react";

export interface PercentageInputControlProps {
  valueLabel: string;
  value: number;
  onChange: (value: number) => void;
}

export default function PercentageInputControl({
  valueLabel,
  value,
  onChange,
}: PercentageInputControlProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Slider
      id="slider"
      value={value}
      min={0}
      max={1}
      step={0.01}
      colorScheme="brand"
      onChange={onChange}
      onPointerMove={() => setShowTooltip(true)}
      onPointerLeave={() => setShowTooltip(false)}
    >
      <SliderTrack height={4} rounded="full">
        <SliderFilledTrack />
      </SliderTrack>
      <Tooltip
        hasArrow
        bg="brand.600"
        color="white"
        placement="top"
        isOpen={showTooltip}
        label={`${Number(value * 100).toFixed(0)}% - ${valueLabel}`}
      >
        <SliderThumb boxSize={6} boxShadow="lg" bgColor="blue.600" />
      </Tooltip>
    </Slider>
  );
}
