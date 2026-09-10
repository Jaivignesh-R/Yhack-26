/**
 * Approval Dependency & Compliance Roadmap Engine
 * Analyzes prerequisites, constructs the Directed Acyclic Graph (DAG),
 * and builds a phased, sequential compliance execution roadmap.
 */

function buildDependencyGraph(approvalIds, allDependencies) {
  const graph = {}; // approval_id -> array of depends_on_ids
  const reverseGraph = {}; // depends_on_id -> array of dependent approval_ids

  approvalIds.forEach(id => {
    graph[id] = [];
    reverseGraph[id] = [];
  });

  allDependencies.forEach(dep => {
    const fromId = dep.approval_type_id;
    const toId = dep.depends_on_approval_type_id;

    // Only include dependencies relevant to the applicable approval list
    if (graph[fromId] && approvalIds.includes(toId)) {
      graph[fromId].push(toId);
    }
    if (reverseGraph[toId] && approvalIds.includes(fromId)) {
      reverseGraph[toId].push(fromId);
    }
  });

  return { graph, reverseGraph };
}

/**
 * Calculates topological execution stages (Phases) for the compliance roadmap
 */
function calculateRoadmapPhases(approvalTypesMap, graph) {
  const inDegree = {};
  const approvalIds = Object.keys(graph).map(id => parseInt(id, 10));

  approvalIds.forEach(id => {
    inDegree[id] = graph[id].length;
  });

  const phases = [];
  let remaining = new Set(approvalIds);

  while (remaining.size > 0) {
    // Items with no prerequisites in this iteration form the current stage
    const currentStage = [];
    remaining.forEach(id => {
      if (inDegree[id] === 0) {
        currentStage.push(id);
      }
    });

    // Fallback in case of circular dependency (unlikely, but prevents infinite loop)
    if (currentStage.length === 0) {
      currentStage.push(...Array.from(remaining));
      remaining.clear();
      phases.push(currentStage);
      break;
    }

    phases.push(currentStage);

    // Remove processed items and reduce inDegree for dependents
    currentStage.forEach(id => {
      remaining.delete(id);
      approvalIds.forEach(depId => {
        if (graph[depId] && graph[depId].includes(id)) {
          inDegree[depId] = Math.max(0, inDegree[depId] - 1);
        }
      });
    });
  }

  return phases;
}

/**
 * Generates personalized compliance roadmap with live readiness states
 * @param {Array} applicableApprovals - Objects with approval details
 * @param {Array} dependencies - Rows from approval_dependencies
 * @param {Array} userApplications - Applications already submitted by the user
 */
function generatePersonalizedRoadmap(applicableApprovals, dependencies, userApplications) {
  const approvalIds = applicableApprovals.map(a => a.id);
  const approvalMap = {};
  applicableApprovals.forEach(a => { approvalMap[a.id] = a; });

  const { graph } = buildDependencyGraph(approvalIds, dependencies);
  const phases = calculateRoadmapPhases(approvalMap, graph);

  // Map of existing application status: approval_type_id -> application
  const appStatusMap = {};
  userApplications.forEach(app => {
    appStatusMap[app.approval_type_id] = app;
  });

  // Stage naming helper
  const stageNames = [
    'Stage 1: Primary Entity Setup & Land Allocation',
    'Stage 2: Environmental Clearance & Preliminary Safety',
    'Stage 3: Building Plan & Structural Approvals',
    'Stage 4: Operational Consents, Safety & Labour Welfare'
  ];

  const roadmap = phases.map((stageItemIds, index) => {
    const stageName = stageNames[index] || `Stage ${index + 1}: Final Approvals`;

    const items = stageItemIds.map(approvalId => {
      const approval = approvalMap[approvalId];
      const existingApp = appStatusMap[approvalId];
      const prerequisites = graph[approvalId] || [];

      // Check if all prerequisites are approved
      const missingPrereqs = prerequisites.filter(prereqId => {
        const prereqApp = appStatusMap[prereqId];
        return !prereqApp || prereqApp.status !== 'Approved';
      });

      let readiness = 'LOCKED';
      let statusText = 'Locked (Waiting on Prerequisites)';

      if (existingApp) {
        readiness = existingApp.status.toUpperCase();
        statusText = existingApp.status;
      } else if (missingPrereqs.length === 0) {
        readiness = 'READY_TO_APPLY';
        statusText = 'Ready to Apply';
      }

      return {
        ...approval,
        prerequisites: prerequisites.map(pId => approvalMap[pId]?.name || `Approval #${pId}`),
        missingPrerequisites: missingPrereqs.map(pId => approvalMap[pId]?.name || `Approval #${pId}`),
        readiness,
        statusText,
        applicationId: existingApp ? existingApp.id : null,
        applicationNumber: existingApp ? existingApp.application_number : null,
        riskScore: existingApp ? existingApp.risk_score : null
      };
    });

    return {
      stageNumber: index + 1,
      stageName,
      items
    };
  });

  return roadmap;
}

module.exports = {
  buildDependencyGraph,
  calculateRoadmapPhases,
  generatePersonalizedRoadmap
};
