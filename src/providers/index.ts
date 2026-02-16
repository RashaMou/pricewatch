import type { Provider } from "../types.js";
import { garminProvider } from "./garmin.js";

export const providers: Record<string, Provider<any>> = {
  garmin: garminProvider,
};
