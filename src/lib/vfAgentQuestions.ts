// VF Agent - Comprehensive Question Reference
// Organized by category with MoSCoW priority

export interface VFQuestion {
  id: string;
  question: string;
  category: string;
  priority: 'must' | 'should' | 'could' | 'wont';
}

export interface QuestionCategory {
  id: string;
  name: string;
  icon: string;
  questions: VFQuestion[];
}

export const VF_QUESTION_CATEGORIES: QuestionCategory[] = [
  {
    id: 'basic',
    name: 'Basic Queries',
    icon: '🔍',
    questions: [
      { id: '1.1', question: 'How many hospitals have cardiology?', category: 'basic', priority: 'must' },
      { id: '1.2', question: 'How many hospitals in this region have the ability to perform cardiac surgery?', category: 'basic', priority: 'must' },
      { id: '1.3', question: 'What services does each major facility offer?', category: 'basic', priority: 'must' },
      { id: '1.4', question: 'Are there any clinics that do emergency services?', category: 'basic', priority: 'must' },
      { id: '1.5', question: 'Which region has the most hospitals?', category: 'basic', priority: 'must' },
    ]
  },
  {
    id: 'geospatial',
    name: 'Geospatial Analysis',
    icon: '🗺️',
    questions: [
      { id: '2.1', question: 'How many hospitals treating cardiac conditions are within 50 km of Accra?', category: 'geospatial', priority: 'must' },
      { id: '2.2', question: 'What areas have known disease prevalence but no facilities treating it nearby?', category: 'geospatial', priority: 'could' },
      { id: '2.3', question: 'Where are the largest geographic cold spots where cardiac care is absent?', category: 'geospatial', priority: 'must' },
      { id: '2.4', question: 'What is the service gap between urban and rural areas for emergency care?', category: 'geospatial', priority: 'could' },
    ]
  },
  {
    id: 'validation',
    name: 'Validation & Verification',
    icon: '✅',
    questions: [
      { id: '3.1', question: 'Which facilities claim to offer cardiac surgery but lack basic equipment?', category: 'validation', priority: 'should' },
      { id: '3.2', question: 'Which facilities have equipment that appears temporary rather than permanent?', category: 'validation', priority: 'could' },
      { id: '3.3', question: 'What percentage of facilities claiming surgical capability show evidence of permanent services?', category: 'validation', priority: 'could' },
      { id: '3.4', question: 'For each procedure, what % of facilities also list the minimum required equipment?', category: 'validation', priority: 'should' },
      { id: '3.5', question: 'Which procedures/equipment claims are most often corroborated by multiple sources?', category: 'validation', priority: 'should' },
    ]
  },
  {
    id: 'anomaly',
    name: 'Anomaly Detection',
    icon: '⚠️',
    questions: [
      { id: '4.1', question: 'What correlation exists between website quality and actual facility capabilities?', category: 'anomaly', priority: 'should' },
      { id: '4.2', question: 'Which facilities have high bed-to-operating-room ratios indicative of misrepresentation?', category: 'anomaly', priority: 'should' },
      { id: '4.3', question: 'Which facilities show abnormal patterns where expected features do not match?', category: 'anomaly', priority: 'should' },
      { id: '4.4', question: 'Which facilities claim an unrealistic number of procedures relative to their size?', category: 'anomaly', priority: 'must' },
      { id: '4.5', question: 'What physical facility features correlate with genuine advanced capabilities?', category: 'anomaly', priority: 'should' },
      { id: '4.6', question: 'What facilities show mismatches between claimed subspecialties and infrastructure?', category: 'anomaly', priority: 'should' },
      { id: '4.7', question: 'What correlations exist between facility characteristics that move together?', category: 'anomaly', priority: 'must' },
      { id: '4.8', question: 'Which facilities have unusually high procedure breadth relative to infrastructure?', category: 'anomaly', priority: 'must' },
      { id: '4.9', question: 'Where do we see things that should not move together (large bed count but minimal equipment)?', category: 'anomaly', priority: 'must' },
    ]
  },
  {
    id: 'classification',
    name: 'Service Classification',
    icon: '📋',
    questions: [
      { id: '5.1', question: 'Which procedures are delivered via itinerant outreach vs permanently staffed?', category: 'classification', priority: 'could' },
      { id: '5.2', question: 'Which facilities refer patients for procedures rather than perform them?', category: 'classification', priority: 'could' },
      { id: '5.3', question: 'How often do strong clinical claims appear alongside weak operational signals?', category: 'classification', priority: 'could' },
      { id: '5.4', question: 'What combinations of procedures/equipment co-occur as stable service bundles?', category: 'classification', priority: 'could' },
    ]
  },
  {
    id: 'workforce',
    name: 'Workforce Distribution',
    icon: '👥',
    questions: [
      { id: '6.1', question: 'Where is the workforce for cardiology actually practicing in this region?', category: 'workforce', priority: 'must' },
      { id: '6.3', question: 'Which regions have specialists but unclear information about where they practice?', category: 'workforce', priority: 'could' },
      { id: '6.4', question: 'How many facilities have evidence of visiting specialists vs permanent staff?', category: 'workforce', priority: 'should' },
      { id: '6.5', question: 'What areas show evidence of surgical camps or temporary medical missions?', category: 'workforce', priority: 'should' },
      { id: '6.6', question: 'Where do signals indicate services are tied to individuals rather than institutions?', category: 'workforce', priority: 'should' },
    ]
  },
  {
    id: 'resources',
    name: 'Resource Distribution',
    icon: '📦',
    questions: [
      { id: '7.1', question: 'What is the problem type by region: lack of equipment, training, or practitioners?', category: 'resources', priority: 'could' },
      { id: '7.2', question: 'What areas have high practitioner numbers but insufficient equipment?', category: 'resources', priority: 'could' },
      { id: '7.3', question: 'Are there facilities in resource-poor areas that lack web presence but show high volume?', category: 'resources', priority: 'could' },
      { id: '7.5', question: 'In each region, which procedures depend on very few facilities?', category: 'resources', priority: 'must' },
      { id: '7.6', question: 'Where is there oversupply concentration vs scarcity of high-complexity procedures?', category: 'resources', priority: 'must' },
    ]
  },
  {
    id: 'ngo',
    name: 'NGO Analysis',
    icon: '🏛️',
    questions: [
      { id: '8.1', question: 'Which regions have multiple NGOs providing overlapping services?', category: 'ngo', priority: 'should' },
      { id: '8.2', question: 'What facilities show evidence of coordination vs competition between organizations?', category: 'ngo', priority: 'could' },
      { id: '8.3', question: 'Where are gaps where no organizations are working despite evident need?', category: 'ngo', priority: 'must' },
      { id: '8.4', question: 'Where does periodic NGO activity substitute for permanent capacity?', category: 'ngo', priority: 'could' },
    ]
  },
  {
    id: 'needs',
    name: 'Unmet Needs Analysis',
    icon: '📊',
    questions: [
      { id: '9.1', question: 'Which regions have population that would demand more surgeries but lack services?', category: 'needs', priority: 'could' },
      { id: '9.2', question: 'Which population centers show highest likelihood of unmet surgical need?', category: 'needs', priority: 'could' },
      { id: '9.4', question: 'Which regions have age demographics indicating high need but insufficient services?', category: 'needs', priority: 'could' },
      { id: '9.5', question: 'Which facilities serve population areas too large for their stated capabilities?', category: 'needs', priority: 'could' },
    ]
  },
  {
    id: 'benchmarking',
    name: 'Benchmarking',
    icon: '📈',
    questions: [
      { id: '10.1', question: 'How does the ratio of specialists per population compare to WHO guidelines?', category: 'benchmarking', priority: 'could' },
      { id: '10.2', question: 'What facilities fall into the sweet spot cluster (high population, some infrastructure, currently ignored)?', category: 'benchmarking', priority: 'should' },
      { id: '10.3', question: 'Which regions show highest probability of being high-impact intervention sites?', category: 'benchmarking', priority: 'should' },
    ]
  },
  {
    id: 'quality',
    name: 'Data Quality',
    icon: '🔬',
    questions: [
      { id: '11.1', question: 'Which facilities have the most incomplete or missing data fields?', category: 'quality', priority: 'must' },
      { id: '11.2', question: 'What percentage of facilities have equipment data vs only specialty claims?', category: 'quality', priority: 'should' },
    ]
  },
];

// Get all questions flattened
export function getAllQuestions(): VFQuestion[] {
  return VF_QUESTION_CATEGORIES.flatMap(cat => cat.questions);
}

// Get questions by priority
export function getQuestionsByPriority(priority: VFQuestion['priority']): VFQuestion[] {
  return getAllQuestions().filter(q => q.priority === priority);
}

// Get featured prompts (mix of must-have across categories)
export function getFeaturedPrompts(): string[] {
  return [
    'How many hospitals have cardiology?',
    'Which facilities claim to offer cardiac surgery but lack basic equipment?',
    'Where are the largest geographic cold spots where cardiac care is absent?',
    'Which facilities have unrealistic procedure claims relative to their size?',
    'Which regions have specialists but unclear information about where they practice?',
    'In each region, which procedures depend on very few facilities?',
    'Where are gaps where no organizations are working despite evident need?',
    'Which facilities have the most incomplete or missing data fields?',
  ];
}
