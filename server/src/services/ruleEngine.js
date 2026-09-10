/**
 * Intelligent Rule Engine
 * Evaluates business profile attributes against data-driven rules stored in the database.
 * Supports dynamic operators: '=', '!=', '>', '>=', '<', '<=', 'IN', 'CONTAINS'.
 */

function evaluateCondition(fieldValue, operator, ruleValue) {
  if (fieldValue === undefined || fieldValue === null) return false;

  const numField = parseFloat(fieldValue);
  const numRule = parseFloat(ruleValue);
  const isNumeric = !isNaN(numField) && !isNaN(numRule);

  switch (operator.trim().toUpperCase()) {
    case '=':
    case '==':
      return String(fieldValue).trim().toLowerCase() === String(ruleValue).trim().toLowerCase();
    case '!=':
    case '<>':
      return String(fieldValue).trim().toLowerCase() !== String(ruleValue).trim().toLowerCase();
    case '>':
      return isNumeric ? numField > numRule : String(fieldValue) > String(ruleValue);
    case '>=':
      return isNumeric ? numField >= numRule : String(fieldValue) >= String(ruleValue);
    case '<':
      return isNumeric ? numField < numRule : String(fieldValue) < String(ruleValue);
    case '<=':
      return isNumeric ? numField <= numRule : String(fieldValue) <= String(ruleValue);
    case 'IN': {
      const allowedList = ruleValue.split(',').map(s => s.trim().toLowerCase());
      return allowedList.includes(String(fieldValue).trim().toLowerCase());
    }
    case 'CONTAINS':
      return String(fieldValue).toLowerCase().includes(String(ruleValue).toLowerCase());
    default:
      return false;
  }
}

/**
 * Evaluates which approval types are applicable for a given business profile
 * @param {Object} profile - The business profile
 * @param {Array} approvalTypes - All approval types
 * @param {Array} approvalRules - All rule rows from approval_rules table
 */
function evaluateApplicableApprovals(profile, approvalTypes, approvalRules) {
  const applicableApprovalIds = new Set();

  // Group rules by approval_type_id
  const rulesByType = {};
  approvalRules.forEach(rule => {
    if (!rulesByType[rule.approval_type_id]) {
      rulesByType[rule.approval_type_id] = [];
    }
    rulesByType[rule.approval_type_id].push(rule);
  });

  approvalTypes.forEach(approval => {
    const rules = rulesByType[approval.id] || [];

    // If an approval has no specific rules, it is universally applicable (e.g. general company registration)
    if (rules.length === 0) {
      applicableApprovalIds.add(approval.id);
      return;
    }

    // By default, all rules for an approval must evaluate to true (AND logic)
    const matchesAll = rules.every(rule => {
      const val = profile[rule.condition_field];
      return evaluateCondition(val, rule.condition_operator, rule.condition_value);
    });

    if (matchesAll) {
      applicableApprovalIds.add(approval.id);
    }
  });

  return Array.from(applicableApprovalIds);
}

/**
 * Calculates a dynamic Risk Score (0-100) based on business attributes
 */
function calculateRiskScore(profile) {
  let score = 20; // Base score

  // 1. Environmental Category impact
  if (profile.environmental_category === 'Red') score += 40;
  else if (profile.environmental_category === 'Orange') score += 25;
  else if (profile.environmental_category === 'Green') score += 10;
  else if (profile.environmental_category === 'White') score += 0;

  // 2. Capital Investment impact
  const inv = parseFloat(profile.investment) || 0;
  if (inv > 50000000) score += 20; // > 5 Crore
  else if (inv > 10000000) score += 12; // > 1 Crore
  else if (inv > 2500000) score += 5;

  // 3. Workforce scale
  const emp = parseInt(profile.employees, 10) || 0;
  if (emp > 100) score += 15;
  else if (emp >= 20) score += 8;

  // 4. Sector specific risk factors
  const highRiskSectors = ['Chemicals', 'Pesticides', 'Mining', 'Explosives', 'Heavy Engineering'];
  if (highRiskSectors.includes(profile.sector)) {
    score += 15;
  }

  return Math.min(100, Math.max(10, score));
}

module.exports = {
  evaluateCondition,
  evaluateApplicableApprovals,
  calculateRiskScore
};
