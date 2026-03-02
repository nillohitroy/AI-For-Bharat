export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

export interface ThreatMessage {
  id: string;
  sender: string;
  content: string;
  riskScore: RiskLevel;
  timestamp: string;
  culturalContextFlag?: string;
  peerName?: string;
}