/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ManifestItem {
  id: string;
  name: string;
  qty: number;
}

export interface ShipmentFormData {
  orderId: string;
  customerName: string;
  destination: string;
  origin?: string;
  items: ManifestItem[];
  weight: number; // in kg
  dimensions: string; // "LxWxH cm"
  fragile: boolean;
  uploadedFiles: string[];
  packageWeight?: number;
  weightUnit?: 'kg' | 'lbs';
  paymentMethod?: string;
}

export interface AiInsightsResponse {
  suggestedCarrier: string;
  predictedTransitDays: string;
  riskAssessment: 'LOW' | 'MEDIUM' | 'HIGH';
  directives: string[];
  buyerDispatchScript: string;
}
