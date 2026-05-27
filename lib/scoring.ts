export interface Finding {
  description: string;
  category: string;
  points: number;
  triggered: boolean;
}

export interface ScoreBreakdown {
  baseToolCount: number;
  findings: Finding[];
  totalComplexityScore: number;
}

const COLLABORATION_TOOLS = ['Microsoft Teams', 'Slack', 'Discord', 'WhatsApp', 'Cisco Webex'];
const DIAGRAMMING_TOOLS = ['Visio', 'Draw.io', 'LucidChart', 'SmartDraw'];
const STORAGE_DOC_TOOLS = ['Microsoft OneDrive', 'iCloud', 'Adobe Acrobat', 'Foxit'];
const PREMIUM_DESIGN_TOOLS = ['Adobe InDesign', 'Adobe Photoshop'];
const PM_TOOLS = ['Jira', 'Monday.com', 'Notion', 'Microsoft Project', 'Microsoft Loop', 'Smartsheet'];
const API_TOOLS = ['Postman', 'Apigee', 'APIdog', 'Kong Gateway', 'Tyk'];
const MICROSOFT_TOOLS = ['Microsoft Teams', 'Microsoft Project', 'Microsoft Loop', 'Microsoft OneDrive', 'Visio'];
const COMPETITOR_TOOLS = ['Slack', 'Discord', 'Notion', 'Monday.com', 'iCloud', 'Google Drive'];

export function calculateScore(allSelectedTools: string[]): ScoreBreakdown {
  const unique = [...new Set(allSelectedTools.filter(Boolean))];

  const collabUsed = unique.filter(t => COLLABORATION_TOOLS.includes(t));
  const diagramUsed = unique.filter(t => DIAGRAMMING_TOOLS.includes(t));
  const storageUsed = unique.filter(t => STORAGE_DOC_TOOLS.includes(t));
  const hasPremiumDesign = unique.some(t => PREMIUM_DESIGN_TOOLS.includes(t));
  const hasPM = unique.some(t => PM_TOOLS.includes(t));
  const hasAPI = unique.some(t => API_TOOLS.includes(t));
  const hasMicrosoft = unique.some(t => MICROSOFT_TOOLS.includes(t));
  const hasCompetitor = unique.some(t => COMPETITOR_TOOLS.includes(t));
  const ecosystemConflict = hasMicrosoft && hasCompetitor;

  const findings: Finding[] = [
    {
      description: 'More than one collaboration tool selected',
      category: 'Duplicate Capability',
      points: 2,
      triggered: collabUsed.length > 1,
    },
    {
      description: 'More than one diagramming tool selected',
      category: 'Duplicate Capability',
      points: 1,
      triggered: diagramUsed.length > 1,
    },
    {
      description: 'More than one storage / document tool selected',
      category: 'Governance Risk',
      points: 2,
      triggered: storageUsed.length > 1,
    },
    {
      description: 'Premium design tool selected (InDesign / Photoshop)',
      category: 'Cost Risk',
      points: 1,
      triggered: hasPremiumDesign,
    },
    {
      description: 'No project management tool selected',
      category: 'Delivery Risk',
      points: 2,
      triggered: !hasPM,
    },
    {
      description: 'No API / testing tool selected',
      category: 'Delivery Risk',
      points: 1,
      triggered: !hasAPI,
    },
    {
      description: 'Mixed Microsoft and competitor ecosystem tools',
      category: 'Support Burden',
      points: 2,
      triggered: ecosystemConflict,
    },
  ];

  const totalComplexityScore = findings
    .filter(f => f.triggered)
    .reduce((sum, f) => sum + f.points, 0);

  return {
    baseToolCount: unique.length,
    findings,
    totalComplexityScore,
  };
}

export function getScoreLabel(score: number): { label: string; color: string } {
  if (score === 0) return { label: 'Clean Stack', color: '#5DB840' };
  if (score <= 2) return { label: 'Manageable', color: '#C9A84C' };
  if (score <= 5) return { label: 'Complex', color: '#E07B39' };
  return { label: 'High Risk', color: '#C94C4C' };
}
