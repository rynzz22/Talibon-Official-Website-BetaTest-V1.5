import { Injectable } from "@nestjs/common";

@Injectable()
export class LegislativeService {
  getMandate() {
    return {
      title: "Legislative Mandate",
      content: "The Sangguniang Bayan is the legislative body of the municipality, responsible for enacting ordinances and resolutions.",
    };
  }

  getStructure() {
    return {
      title: "Organizational Structure",
      imageUrl: "https://talibon.gov.ph/wp-content/themes/yootheme/cache/05/viber_image_2025-10-24_14-50-54-459-05f74d51.webp",
    };
  }

  getOrdinances() {
    return [
      { id: "2023-01", title: "Environmental Protection Ordinance", date: "2023-01-15" },
      { id: "2023-02", title: "Traffic Management Code", date: "2023-02-20" },
    ];
  }

  getResolutions() {
    return [
      { id: "RES-2023-01", title: "Resolution for New Public Market", date: "2023-01-10" },
    ];
  }
}
