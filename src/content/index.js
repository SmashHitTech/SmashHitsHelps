import { compute } from "./categories/compute";
import { storage } from "./categories/storage";
import { databases } from "./categories/databases";
import { networking } from "./categories/networking";
import { dataAnalytics } from "./categories/dataAnalytics";
import { aiMl } from "./categories/aiMl";
import { security } from "./categories/security";
import { devops } from "./categories/devops";
import { serverless } from "./categories/serverless";
import { containers } from "./categories/containers";
import { migration } from "./categories/migration";
import { iotEdge } from "./categories/iotEdge";
import { validateGcpData } from "./validate";

export const GCP_DATA = {
  compute,
  storage,
  databases,
  networking,
  data_analytics: dataAnalytics,
  ai_ml: aiMl,
  security,
  devops,
  serverless,
  containers,
  migration,
  iot_edge: iotEdge,
};

export const CATEGORIES = Object.entries(GCP_DATA);

// Runs in most dev environments; harmless in production.
try {
  const errors = validateGcpData(GCP_DATA);
  if (errors.length) {
    // eslint-disable-next-line no-console
    console.warn(`[GCP Navigator] content validation warnings:\n- ${errors.join("\n- ")}`);
  }
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn("[GCP Navigator] content validation failed to run.", e);
}

