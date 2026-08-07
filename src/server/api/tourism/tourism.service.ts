import { Injectable } from "@nestjs/common";

@Injectable()
export class TourismService {
  getSpots() {
    return [
      { id: 1, name: "Talibon Cathedral", description: "The seat of the Diocese of Talibon.", image: "https://picsum.photos/seed/cathedral/800/600" },
      { id: 2, name: "Bongan Sandbar", description: "A beautiful sandbar perfect for swimming and relaxation.", image: "https://picsum.photos/seed/sandbar/800/600" },
    ];
  }

  getFestivities() {
    return [
      { id: 1, name: "Talibon Strings of Fiesta", date: "May" },
      { id: 2, name: "Foundation Day and Town Fiesta", date: "April 22" },
      { id: 3, name: "Abundayon Festival", date: "May" },
    ];
  }

  getDelicacies() {
    return [
      { id: 1, name: "Tatak Talibon Products", description: "Local products made in Talibon." },
      { id: 2, name: "Fresh Seafood", description: "The best seafood in Bohol." },
    ];
  }
}
