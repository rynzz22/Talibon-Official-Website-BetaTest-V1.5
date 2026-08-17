import { Injectable } from "@nestjs/common";

@Injectable()
export class TransparencyService {
  getCitizenCharter() {
    return {
      title: "Citizen's Charter",
      content: "The Citizen's Charter of Talibon outlines the services provided by the LGU and the standards for each service.",
    };
  }

  getFullDisclosure() {
    return {
      title: "Full Disclosure Policy",
      content: "Compliance with the DILG Full Disclosure Policy, ensuring transparency in local governance.",
    };
  }

  getInfrastructure() {
    return [
      { id: 1, title: "Construction of New Health Center", status: "Ongoing", budget: "5M" },
      { id: 2, title: "Road Concreting - Brgy. San Jose", status: "Completed", budget: "2M" },
    ];
  }

  getFinanceReports() {
    return [
      { id: 1, title: "Quarterly Financial Report - Q1 2024", url: "#" },
    ];
  }

  getExecutiveOrders() {
    return [
      { id: 1, title: "EO No. 1 - Reorganization of LGU Committees", date: "2024-01-05" },
    ];
  }

  getBudget() {
    return {
      title: "Budget and Finances",
      annualBudget: "TO BE POSTED",
      status: "TO BE POSTED",
      breakdown: [],
      message: "The approved annual budget, appropriation ordinances, and financial allocations for the current fiscal year are currently being finalized and will be posted upon official certification from the Municipal Budget Office and the Sangguniang Bayan.",
    };
  }

  getBayanihanGrant() {
    return {
      title: "Bayanihan Grant",
      content: "Reports on the utilization of the Bayanihan Grant for COVID-19 response.",
    };
  }

  getBiddings() {
    return [
      { id: 1, title: "Invitation to Bid: Office Supplies", deadline: "2024-04-10" },
    ];
  }

  getOrdinances() {
    return [
      { id: 1, title: "Tax Incentive Ordinance", year: 2024 },
    ];
  }

  getSroi() {
    return {
      title: "Social Return on Investment",
      content: "Measuring the social impact of LGU programs and projects.",
    };
  }
}
