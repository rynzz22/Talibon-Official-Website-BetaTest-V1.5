import { Injectable } from "@nestjs/common";

@Injectable()
export class NewsService {
  getArticles() {
    return [
      { id: 1, title: "Talibon Celebrates Seafood Festival", date: "2024-03-20", image: "https://picsum.photos/seed/news1/800/600" },
      { id: 2, title: "New Infrastructure Project Launched", date: "2024-03-15", image: "https://picsum.photos/seed/news2/800/600" },
    ];
  }

  getAdvisories() {
    return [
      { id: 1, title: "Water Service Interruption", date: "2024-03-25", content: "Scheduled maintenance on March 26." },
    ];
  }

  getDisasterPreparedness() {
    return {
      title: "Disaster Preparedness & Emergency Hotlines",
      content: "Guidelines and emergency contacts for disaster preparedness in Talibon.",
      hotlines: [
        { name: "BFP Talibon", number: "09506329025" },
        { name: "PNP Talibon", number: "09985986442" },
        { name: "MDRRMO (TESaRU)", number: "09105035390" },
        { name: "RHU Talibon (DOH)", number: "09175620239" },
        { name: "PCG Talibon", number: "09096938871" },
        { name: "TARSIER", number: "117 / 09497955530 / 09175101490" },
        { name: "RHU Birthing Center", number: "(0919) 767 0072" },
        { name: "RHU Main", number: "(0963) 347 6355" },
      ],
      socials: {
        email: "talibonofficial@gmail.com",
        mayorOffice: "(038) 422-2895",
      },
    };
  }

  getUpdates() {
    return [
      { id: 1, title: "LGU Update: New Health Protocols", date: "2024-03-10" },
    ];
  }

  getGallery() {
    return [
      { id: 1, url: "https://picsum.photos/seed/g1/800/600", caption: "Town Plaza" },
      { id: 2, url: "https://picsum.photos/seed/g2/800/600", caption: "Coastal View" },
    ];
  }

  getCommunity() {
    return {
      title: "Community News",
      content: "Updates and stories from the different barangays of Talibon.",
    };
  }

  getPublicNotices() {
    return [
      { id: 1, title: "Notice of Public Hearing", date: "2024-04-05" },
    ];
  }

  getDownloadableForms() {
    return [
      { id: 1, title: "Scholarship Application Form", url: "#" },
    ];
  }
}
