"use cache";

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ["", "/shop", "/products/vyro-one", "/about", "/legal"];
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : route === "/products/vyro-one" ? 0.9 : 0.6,
  }));
}
