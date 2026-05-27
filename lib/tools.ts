export const TOOL_CATEGORIES: Record<string, string[]> = {
  'Developers / IDE & More': [
    'Anaconda', 'Visual Studio Code', 'Windsurf', 'Cursor', 'Cline', 'PyCharm', 'RStudio',
  ],
  'Project Management': [
    'Jira', 'Monday.com', 'Notion', 'Microsoft Project', 'Microsoft Loop', 'Smartsheet',
  ],
  'Graphic Design': [
    'Canva', 'Adobe InDesign', 'Adobe Photoshop', 'GIMP',
  ],
  'Diagramming Tools': [
    'Visio', 'Draw.io', 'LucidChart', 'SmartDraw',
  ],
  'Collaboration Tools': [
    'Microsoft Teams', 'Slack', 'Discord', 'WhatsApp', 'Cisco Webex',
  ],
  'API Tools': [
    'Postman', 'Apigee', 'APIdog', 'Kong Gateway', 'Tyk',
  ],
  'Other': [
    'Adobe Acrobat', 'Foxit', 'Microsoft OneDrive', 'iCloud',
  ],
};

export const ALL_TOOLS = Object.values(TOOL_CATEGORIES).flat();

export const SERVICE_REQUIREMENTS = [
  'Develop the application',
  'Collaborate with your team',
  'Design visuals and diagrams',
  'Manage the project',
  'Test APIs and integrations',
  'Store and share documents',
];

export const CATEGORY_ICONS: Record<string, string> = {
  'Developers / IDE & More': '⌨',
  'Project Management': '📋',
  'Graphic Design': '🎨',
  'Diagramming Tools': '📐',
  'Collaboration Tools': '🤝',
  'API Tools': '🔌',
  'Other': '📁',
};
