import type { CaptchaZone, Player, StageId } from '../types';
import { CONFIG } from './screenConfig';

export const CAMPAIGN_STAGES: StageId[] = ['STAGE_1_CROSSWALK', 'STAGE_2_SPAM_GRID', 'STAGE_3_DISTORTION'];
export const GATES_PER_LEVEL = 6;

export function allGatesSolved(zones: Pick<CaptchaZone, 'checked'>[]): boolean {
  return zones.length === GATES_PER_LEVEL && zones.every(zone => zone.checked);
}

export function nextCampaignStage(stage: StageId): StageId | undefined {
  const index = CAMPAIGN_STAGES.indexOf(stage);
  return index < 0 ? undefined : CAMPAIGN_STAGES[index + 1];
}

export function applyUpgrade(player: Player, upgradeId: string): void {
  const upgrade = CONFIG.upgrades.find(item => item.id === upgradeId);
  if (!upgrade) return;
  if (upgradeId === 'battery') player.battery = Math.min(player.maxBattery, player.battery + upgrade.amount);
  if (upgradeId === 'wifi') player.wifiLevel = Math.min(4, player.wifiLevel + upgrade.amount);
  if (upgradeId === 'speed') player.speed += upgrade.amount;
}