import { Injectable } from "@nestjs/common";

@Injectable()
export class ExecutiveService {
  getMandate() {
    return {
      title: "Executive Mandate",
      content: "The Executive Department is responsible for the overall administration and implementation of policies and programs in Talibon.",
    };
  }

  getVisionMission() {
    return {
      vision: "Talibon: The Seafood Capital of Bohol anchoring sustainable tourism, smart urban growth, and digital innovation, empowered by its marine wealth, cultural vibrance, and climate-resilient communities.",
      mission: "To promote inclusive economic development by sustainably managing marine resources, fostering innovation in governance, enhancing urban infrastructure, and empowering communities through education, culture, and enterprise.",
    };
  }

  getChart() {
    return {
      title: "Organizational Chart",
      mayor: { name: "HON. JANETTE GARCIA", role: "MUNICIPAL MAYOR" },
      level2: [
        { name: "MR. MANUELITO A. CAROSUS", role: "MUNICIPAL ADMINISTRATOR" },
        { name: "SANGGUNIANG BAYAN OFFICE", role: "LEGISLATIVE BODY" },
      ],
      departments: [
        { name: "MS. FLOR JEMMA P. CAJES", role: "MUNICIPAL ACCOUNTANT" },
        { name: "MS. BERNARDITA V. AUTENTICO", role: "MUNICIPAL TREASURER" },
        { name: "MS. FALCONIRIS A. LUGASIP", role: "MUNICIPAL BUDGET OFFICER" },
        { name: "MS. SARAH JANE R. HENSON", role: "HUMAN RESOURCE MANAGEMENT OFFICER" },
        { name: "ENGR. GERRY V. ARAÑETA", role: "MUNICIPAL PLANNING DEVELOPMENT COORDINATOR" },
        { name: "DR. MARY JECIEL D. CLEMENTE-DOLOR, RMT", role: "MUNICIPAL HEALTH OFFICER" },
        { name: "ENGR. LORENZO R. FLORES", role: "MUNICIPAL ENGINEER" },
        { name: "MR. FELIX D. EVANGELISTA", role: "MARKET SUPERVISOR" },
        { name: "MS. CELESTINA T. PENTACASE", role: "MUNICIPAL CIVIL REGISTRAR" },
        { name: "MS. ELLEN M. ARQUITA-MAGALLANES, RSW", role: "MUNICIPAL SOCIAL WELFARE DEVELOPMENT OFFICER" },
        { name: "MR. ANGELITO A. OROYAN", role: "MUNICIPAL AGRICULTURIST" },
        { name: "MR. ALMER D. POLO", role: "PESO MANAGER" },
        { name: "ENGR. RAMEL A. ARTIAGA", role: "MUNICIPAL ASSESSOR" },
        { name: "MR. CIELITO O. EVANGELISTA", role: "MUNICIPAL ENVIRONMENT NATURAL RESOURCE OFFICER" },
        { name: "MR. VLADIMIR G. AVENIDO", role: "DRRM OFFICER" },
        { name: "MS. RACHEL P. SAYSON", role: "SENIOR TOURISM OFFICER" },
        { name: "MS. JOCELYN A. BARON", role: "INTERNAL AUDITOR" },
        { name: "DR. STANLEY CLARK M. DIPAY", role: "COLLEGE ADMINISTRATOR" },
        { name: "MR. CIELITO O. EVANGELISTA", role: "GENERAL SERVICES OFFICER" },
        { name: "ENGR. FERDINAND Q. ARTIAGA", role: "PARKING INTEGRATION TRANSPORT TERMINAL OFFICER" },
      ],
    };
  }

  getDirectory() {
    return [
      { department: "Mayor's Office", contact: "038-123-4567" },
      { department: "Treasurer's Office", contact: "038-123-4568" },
    ];
  }

  getGadIms() {
    return {
      title: "Talibon GAD Information Management System (GAD-IMS)",
      subtitle: "Mainstreaming Gender-Responsive Governance through Data",
      sections: [
        {
          id: "overview",
          title: "I. System Overview",
          content: [
            {
              subTitle: "Background and Rationale",
              items: [
                "Legal bases (RA 9710 / Magna Carta of Women; PCW–DILG–DBM–NEDA JMCs)",
                "GAD mainstreaming in Talibon LGU",
                "Role of data in gender-responsive governance"
              ]
            },
            {
              subTitle: "Objectives of the Talibon GAD-IMS",
              items: [
                "Support evidence-based planning and budgeting",
                "Track gender issues, programs, and outcomes",
                "Improve compliance with GAD reporting requirements"
              ]
            },
            {
              subTitle: "Scope and Coverage",
              items: [
                "LGU offices and departments",
                "Barangays (coastal, island, urban, rural)",
                "Sectors covered (women, men, youth, children, elderly, PWDs, IPs, etc.)"
              ]
            }
          ]
        },
        {
          id: "governance",
          title: "II. Governance and Management Structure",
          content: [
            {
              subTitle: "Institutional Arrangement",
              items: [
                "GAD Focal Point System (GFPS)",
                "Roles of MPDC, MSWDO, HRMO, Budget, Accounting, and Barangays"
              ]
            },
            {
              subTitle: "Data Ownership and Accountability",
              items: [
                "Data custodians per office",
                "Approval and validation process"
              ]
            },
            {
              subTitle: "Policies and Protocols",
              items: [
                "Data privacy and confidentiality (RA 10173)",
                "Ethical use of gender-disaggregated data"
              ]
            }
          ]
        },
        {
          id: "data-modules",
          title: "III. Core Data Modules",
          content: [
            {
              subTitle: "A. Socio-Demographic Profile (Sex-Disaggregated Data)",
              items: [
                "Population by sex, age group, and barangay",
                "Household headship",
                "Civil status",
                "Education level",
                "Employment and livelihood",
                "Income and poverty indicators"
              ]
            },
            {
              subTitle: "B. Sectoral and Thematic Data",
              items: [
                "Health and Nutrition",
                "Education and Skills Development",
                "Economic Participation and Livelihood",
                "Governance and Political Participation",
                "Violence Against Women and Children (VAWC)",
                "Social Protection and Welfare",
                "Environment, Climate Change, and DRRM",
                "Infrastructure and Basic Services",
                "Fisheries, Agriculture, and Informal Economy"
              ]
            }
          ]
        },
        {
          id: "analysis",
          title: "IV. Gender Issues and Analysis Module",
          content: [
            {
              subTitle: "Gender Issues Database",
              items: [
                "Identified gender issues per sector and barangay",
                "Root causes and affected groups"
              ]
            },
            {
              subTitle: "Gender Analysis Tools",
              items: [
                "Harmonized GAD Guidelines (HGDG) results",
                "Gender Issue–Cause–Objective (GICO) tables",
                "Gender analysis matrices"
              ]
            },
            {
              subTitle: "Priority Gender Issues Dashboard",
              items: [
                "Municipal and barangay-level priorities"
              ]
            }
          ]
        },
        {
          id: "budgeting",
          title: "V. GAD Planning and Budgeting Module",
          content: [
            {
              subTitle: "GAD Plan and Budget (GPB) Encoding",
              items: [
                "Annual GPB per office and barangay",
                "GAD budget allocation and utilization"
              ]
            },
            {
              subTitle: "Program, Project, and Activity (PPA) Database",
              items: [
                "GAD-attributed PPAs",
                "Beneficiary profiles (sex-disaggregated)"
              ]
            },
            {
              subTitle: "Alignment and Integration",
              items: [
                "CDP, AIP, CLUP, DRRM, LCCAP, and SDGs"
              ]
            }
          ]
        },
        {
          id: "me",
          title: "VI. Monitoring, Evaluation, and Results Module",
          content: [
            {
              subTitle: "Performance Indicators",
              items: [
                "Output, outcome, and impact indicators",
                "Gender results indicators"
              ]
            },
            {
              subTitle: "Progress Tracking",
              items: [
                "Physical and financial accomplishments",
                "Beneficiary reach and outcomes"
              ]
            },
            {
              subTitle: "Results and Outcome Analysis",
              items: [
                "Changes in gender gaps",
                "Lessons learned and best practices"
              ]
            }
          ]
        },
        {
          id: "reporting",
          title: "VII. Reporting and Compliance Module",
          content: [
            {
              subTitle: "Standard Reports",
              items: [
                "GPB Accomplishment Report (AR)",
                "PCW/DILG compliance reports",
                "COA and audit-support reports"
              ]
            },
            {
              subTitle: "Custom Reports and Dashboards",
              items: [
                "Barangay-level reports",
                "Sectoral and thematic summaries"
              ]
            },
            {
              subTitle: "Data Visualization",
              items: [
                "Charts, maps, and infographics",
                "Gender gap indicators by barangay"
              ]
            }
          ]
        },
        {
          id: "barangay",
          title: "VIII. Barangay GAD Interface",
          content: [
            {
              subTitle: "Barangay Data Entry Module",
              items: [
                "Barangay GPB and AR",
                "Local gender issues and PPAs"
              ]
            },
            {
              subTitle: "Capacity-Building Support",
              items: [
                "Templates, guides, and manuals",
                "IEC and advocacy materials"
              ]
            },
            {
              subTitle: "Feedback and Validation Mechanism",
              items: [
                "Data review and consolidation process"
              ]
            }
          ]
        },
        {
          id: "knowledge",
          title: "IX. Knowledge Management and Learning",
          content: [
            {
              subTitle: "Good Practices and Case Studies",
              items: [
                "Successful GAD initiatives in Talibon"
              ]
            },
            {
              subTitle: "IEC and Advocacy Materials",
              items: [
                "Gender awareness campaigns",
                "Training modules and presentations"
              ]
            },
            {
              subTitle: "Research and Policy Support",
              items: [
                "Studies, assessments, and policy briefs"
              ]
            }
          ]
        },
        {
          id: "admin",
          title: "X. System Administration and Sustainability",
          content: [
            {
              subTitle: "User Management",
              items: [
                "Access levels and permissions"
              ]
            },
            {
              subTitle: "Data Quality Assurance",
              items: [
                "Validation, updating, and archiving"
              ]
            },
            {
              subTitle: "System Maintenance and Upgrading",
              items: [
                "Continuous improvement and scalability"
              ]
            },
            {
              subTitle: "Sustainability Plan",
              items: [
                "Institutionalization",
                "Budget and capacity requirements"
              ]
            }
          ]
        },
        {
          id: "annexes",
          title: "XI. Annexes",
          content: [
            {
              subTitle: "Reference Documents",
              items: [
                "Glossary of GAD Terms",
                "Standard Forms and Templates",
                "Data Dictionary",
                "Relevant Laws, JMCs, and Circulars"
              ]
            },
            {
              subTitle: "Interactive Panels",
              items: [
                "Dashboards and Reports"
              ]
            }
          ]
        }
      ]
    };
  }
}
