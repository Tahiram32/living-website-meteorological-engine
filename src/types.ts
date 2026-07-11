/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WeatherCopy {
  heroTitle: string;
  heroSubtitle: string;
  alertBanner: string;
  seoHeading: string;
  seoArticle: string;
  promotions: string[];
  cacheTags: string[];
}

export interface HVACClient {
  domain: string; // Document ID (e.g. 'hendersonhvac.com')
  businessName: string;
  city: string;
  phone: string;
  isrUrl: string;
  isrSecret: string;
  lastUpdated?: string;
  lastWeatherCopy?: WeatherCopy;
}

export interface WeatherMetrics {
  temp: number;
  condition: string;
  humidity: number;
  isExtreme: boolean;
  advice: string;
}

export interface PipelineLog {
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
}

export interface PipelineRun {
  id: string;
  status: "idle" | "running" | "completed" | "failed";
  city: string;
  startedAt: string;
  completedAt?: string;
  totalClients: number;
  processedClients: number;
  successfulClients: number;
  failedClients: number;
  logs: PipelineLog[];
}
