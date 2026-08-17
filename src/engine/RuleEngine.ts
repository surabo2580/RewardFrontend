import { EventRequest, RewardRule, EvaluationResult } from '../types';

/**
 * Smart Reward Rule Engine
 * Port of com.smartReward.backend.ruleengine.RuleEngine
 */
export class RuleEngine {
  /**
   * Evaluates incoming event request against rules matching eventType and businessId
   */
  static evaluate(event: EventRequest, allRules: RewardRule[]): EvaluationResult {
    const normalizedEvent = (event.event || '').trim().toUpperCase();
    const normalizedBusinessId = (event.businessId || '').trim();

    // Filter rules by eventType and businessId and isActive
    const candidateRules = allRules.filter(
      (rule) =>
        rule.isActive &&
        rule.businessId.toLowerCase() === normalizedBusinessId.toLowerCase() &&
        rule.eventType.toUpperCase() === normalizedEvent
    );

    let totalPoints = 0;
    const rawAmount = event.properties?.['amount'];
    const amount = typeof rawAmount === 'number' ? rawAmount : parseFloat(rawAmount) || 0.0;

    const matchedRules: EvaluationResult['matchedRules'] = [];

    for (const rule of candidateRules) {
      // Condition check: minAmount
      if (rule.minAmount !== null && rule.minAmount !== undefined && amount < rule.minAmount) {
        matchedRules.push({
          rule,
          amount,
          passedCondition: false,
          pointsAwarded: 0,
          explanation: `Transaction amount ($${amount.toFixed(2)}) is below required minimum ($${rule.minAmount.toFixed(2)})`,
        });
        continue;
      }

      // Reward calculation: FLAT or PERCENTAGE
      let points = 0;
      let explanation = '';

      if (rule.rewardType === 'FLAT') {
        points = Math.floor(rule.rewardValue);
        explanation = `Awarded flat ${points} points for ${rule.eventType}`;
      } else if (rule.rewardType === 'PERCENTAGE') {
        // (amount * rule.rewardValue / 100).toInt()
        points = Math.floor((amount * rule.rewardValue) / 100);
        explanation = `Awarded ${rule.rewardValue}% of $${amount.toFixed(2)} = ${points} points`;
      } else {
        points = 0;
        explanation = `Unknown reward type "${rule.rewardType}"`;
      }

      matchedRules.push({
        rule,
        amount,
        passedCondition: true,
        pointsAwarded: points,
        explanation,
      });

      totalPoints += points;
    }

    return {
      totalPoints,
      matchedRules,
    };
  }
}
