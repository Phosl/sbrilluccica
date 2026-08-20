import type { CatalogRepository } from "./catalog-repository";
import { DataSourceUnavailableError } from "./data-errors";
import { MockCatalogRepository } from "./mock-catalog-repository";

export const DATA_PROVIDERS = ["mock", "supabase"] as const;
export type DataProvider = (typeof DATA_PROVIDERS)[number];

type ProviderEnvironment = {
  [key: string]: string | undefined;
  DATA_PROVIDER?: string;
  SBRILLUCCICA_DATA_SOURCE?: string;
};

export function resolveDataProvider(
  environment: ProviderEnvironment = process.env,
): DataProvider {
  const configuredProvider = (
    environment.DATA_PROVIDER ??
    environment.SBRILLUCCICA_DATA_SOURCE ??
    "mock"
  ).toLowerCase();

  if (configuredProvider === "mock" || configuredProvider === "supabase") {
    return configuredProvider;
  }

  throw new DataSourceUnavailableError(
    "configuration_missing",
    `Unsupported DATA_PROVIDER: ${configuredProvider}`,
  );
}

export function createCatalogRepository(
  provider: DataProvider = resolveDataProvider(),
): CatalogRepository {
  if (provider === "mock") return new MockCatalogRepository();

  throw new DataSourceUnavailableError(
    "configuration_missing",
    "DATA_PROVIDER=supabase was selected, but the Supabase catalog adapter has not been connected yet.",
  );
}
