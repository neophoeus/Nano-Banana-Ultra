export const DEFAULT_TEMPERATURE = 1;
export const MIN_TEMPERATURE = 0;
export const MAX_TEMPERATURE = 2;
export const TEMPERATURE_STEP = 0.05;

const TEMPERATURE_UNITS_PER_POINT = 20;
const MIN_TEMPERATURE_UNITS = MIN_TEMPERATURE * TEMPERATURE_UNITS_PER_POINT;
const MAX_TEMPERATURE_UNITS = MAX_TEMPERATURE * TEMPERATURE_UNITS_PER_POINT;

const toTemperatureUnits = (value: number): number => Math.round(value * TEMPERATURE_UNITS_PER_POINT);

export const clampTemperature = (value: number): number => Math.max(MIN_TEMPERATURE, Math.min(MAX_TEMPERATURE, value));

export const normalizeTemperature = (value: number): number => {
    if (!Number.isFinite(value)) {
        return DEFAULT_TEMPERATURE;
    }

    const clampedUnits = Math.max(MIN_TEMPERATURE_UNITS, Math.min(MAX_TEMPERATURE_UNITS, toTemperatureUnits(value)));

    return clampedUnits / TEMPERATURE_UNITS_PER_POINT;
};

export const formatTemperature = (value: number): string => {
    if (!Number.isFinite(value)) {
        return formatTemperature(DEFAULT_TEMPERATURE);
    }

    const roundedToHundredths = Math.round(value * 100) / 100;
    const twoDecimalText = roundedToHundredths.toFixed(2);

    return twoDecimalText.endsWith('0') ? roundedToHundredths.toFixed(1) : twoDecimalText;
};
