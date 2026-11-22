import { GoogleBusinessProfileProvider } from "./gbp-interface";
import { DemoGoogleBusinessProfileAdapter } from "./gbp-demo-adapter";
import { LiveGoogleBusinessProfileAdapter } from "./gbp-live-adapter";
import { CustomerDirectBusinessProfileAdapter } from "./gbp-customer-adapter";
import { PartialBusinessIntake } from "../types/contracts";

const liveAdapter = new LiveGoogleBusinessProfileAdapter();

export function getGBPProvider(
  mode: "demo" | "live" | "customer" = "demo",
  intake?: PartialBusinessIntake
): GoogleBusinessProfileProvider {
  if (mode === "live") {
    return liveAdapter;
  }
  if (mode === "customer") {
    return new CustomerDirectBusinessProfileAdapter(intake);
  }
  return new DemoGoogleBusinessProfileAdapter(intake);
}
