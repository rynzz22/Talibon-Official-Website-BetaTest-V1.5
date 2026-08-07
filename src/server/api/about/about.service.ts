import { Injectable } from "@nestjs/common";

@Injectable()
export class AboutService {
  getProfile() {
    return {
      title: "Brief Profile",
      content: `BRIEF PROFILE OF TALIBON

(Yvux A. Apawan)

Talibon, officially the Municipality of Talibon (Cebuano: Lungsod sa Talibon; Tagalog: Bayan ng Talibon), is a 1st class municipality that lies in the northernmost part of the island Province of Bohol in Central Visayas, Philippines. It is located approximately 114.8 km North of Tagbilaran City, 611.28 km Southeast of Manila, and 49.01 km Southeast of Cebu City.

Its coastline has significant patches of the Danajon Bank, the only documented double barrier reef in the Philippines that is teeming with bountiful natural marine resources. Hence, Talibon is considered as the official Seafood Capital of Bohol. The municipality is bounded on the North by the Camotes Sea, South by the municipality of Trinidad, East by the municipality of Bien Unido, West by the municipality of Getafe, and Southwest by the municipality of Buenavista. Specifically, it is located within 10° 09’ 06” North longitude 124° 17’ 25” East latitude.[01]

Accessibility to Talibon from the capital, Tagbilaran City, is facilitated by the western or eastern exits of the Bohol Circumferential Road, located 114.8 and 150 km away, respectively. Alternatively, travelers can reach Talibon through the Loay Interior Road via Loboc and Carmen, which is just 109 km away. It is easily accessible to Cebu City directly by boat, approximately 4 hours (36 nautical miles), and proximity to the province of Southern Leyte by boat via Bato, Ubay, Bohol to Bato Leyte (36 nautical miles) trip, taking approximately 3 hours. It can also be accessed by roll-on roll-off (RORO) ferries or by high-speed catamaran and monohull crafts via Ports of Tubigon or Getafe, followed by an hour or 30-minute journey by road, respectively.

The municipality possesses a total land area of 140.46 sq km, of which about 7.97 sq km or 5.7% is classified as urban, while the remaining 132.49 sq km is rural. It has twenty-five (25) barangays divided into three (3) groups of eight (8) island barangays, nine (9) coastal barangays, and eight (8) inland barangays. Urbanized barangays include Población, San Jose, San Francisco, San Isidro, Balintawak, and San Agustin.

According to the 2020 Philippine Statistics Authority Population Census, it has a population of 71,272 people and a population density of 507 people per square kilometer, making it the second-most populous town in Bohol, behind Ubay. It is also the home of some of the world’s most densely populated islands, namely, Nocnocan, Guindacpan, Calituban, and Cataban.[02]

The bustling municipality’s major industries are farming and fishing with major products such as fishculture (which includes bangus, shrimp, and tilapia), banana, coconut, oyster, rice, seaweeds, swine, cassava, corn, and native chicken.[03] It is becoming a leading commercial hub for at least 1,409 registered retailers, wholesalers, and traders, as well as strong presence of banks and other financial institutions in northern part of Bohol. The municipality is also home to one of the branches of Alturas Group of Companies, which has established a mall and supermarket in the area since 2003. It also has a shipyard in Sitio Tabon, Barangay San Francisco since 2024.[04]

The locals are also into making artisanal fish traps, hats, and pottery. Silica, limestone, diorites, sand, iron ore, and gravel are also a large industry at present. These minerals are shipped to Cebu and Iligan aboard bulk carriers and barges as these locations are known for cement production and mineral processing.

Talibon has achieved a significant milestone, securing the 17th position among 1st and 2nd class municipalities in the entire country on the Cities and Municipalities Competitiveness Index (CMCI) 2024 by the Department of Trade & Industry (DTI). It has also made a huge leap from ranking 336th in 2023 to 178th in 2024 among all local government units. This ranking underscores Talibon’s effective performance and significant improvement across key indicators such as economic dynamism, government efficiency, infrastructure development, resilience, and innovation. The recognition thus solidifies Talibon’s position as a thriving and progressive municipality.[05]



REFERENCES:

Talibon, Bohol Profile. (n.d.). PhilAtlas. Retrieved August 27, 2024, from https://www.philatlas.com/visayas/r07/bohol/talibon.html

Highlights of the Population of the Municipality of Talibon (Based on the Results of 2020 Census of Population and Housing) (No. 2022-SR12-050). (2022). Philippine Statistics Authority. Retrieved August 27, 2024, from https://rsso07.psa.gov.ph/system/files/attachment-dir/2022-SR12-050.pdf

Agriculture and Fishery Modernization Plan 2024-2028. (n.d.). Local Government Unit of Talibon – Municipal Agriculturist’s Office.

Business Permit Listing Database (as of 19 August 2024). (n.d.). Local Government Unit of Talibon – Municipal Treasurer’s Office.

Cities and Municipalities Competitiveness Index (CMCI) 2024. (n.d.). Department of Trade and Industry. Retrieved August 27, 2024, from https://cmci.dti.gov.ph/rankings-data.php?unit=1st%20to%202nd%20Class%20Municipalities`,
    };
  }

  getSeal() {
    return {
      title: "Official Seal",
      description: "The official seal of Talibon represents its rich maritime heritage and its status as a key coastal municipality.",
    };
  }

  getHistory() {
    return {
      title: "Brief History",
      content: `BRIEF HISTORY OF TALIBON

(Yvux A. Apawan)

Talibon, officially the Municipality of Talibon (Cebuano: Lungsod sa Talibon; Tagalog: Bayan ng Talibon), is a 1st class municipality that lies in the northernmost part of the island Province of Bohol in Central Visayas, Philippines. It is located approximately 114.8 km North of Tagbilaran City, 611.28 km Southeast of Manila, and 49.01 km Southeast of Cebu City.

Its coastline has significant patches of the Danajon Bank, the only documented double barrier reef in the Philippines that is teeming with bountiful natural marine resources. Hence, Talibon is considered as the official Seafood Capital of Bohol. The municipality is bounded on the North by the Camotes Sea, South by the municipality of Trinidad, East by the municipality of Bien Unido, West by the municipality of Getafe, and Southwest by the municipality of Buenavista. Specifically, it is located within 10° 09’ 06” North longitude 124° 17’ 25” East latitude.[01]

Accessibility to Talibon from the capital, Tagbilaran City, is facilitated by the western or eastern exits of the Bohol Circumferential Road, located 114.8 and 150 km away, respectively. Alternatively, travelers can reach Talibon through the Loay Interior Road via Loboc and Carmen, which is just 109 km away. It is easily accessible to Cebu City directly by boat, approximately 4 hours (36 nautical miles), and proximity to the province of Southern Leyte by boat via Bato, Ubay, Bohol to Bato Leyte (36 nautical miles) trip, taking approximately 3 hours. It can also be accessed by roll-on roll-off (RORO) ferries or by high-speed catamaran and monohull crafts via Ports of Tubigon or Getafe, followed by an hour or 30-minute journey by road, respectively.

The municipality possesses a total land area of 140.46 sq km, of which about 7.97 sq km or 5.7% is classified as urban, while the remaining 132.49 sq km is rural. It has twenty-five (25) barangays divided into three (3) groups of eight (8) island barangays, nine (9) coastal barangays, and eight (8) inland barangays. Urbanized barangays include Población, San Jose, San Francisco, San Isidro, Balintawak, and San Agustin.

According to the 2020 Philippine Statistics Authority Population Census, it has a population of 71,272 people and a population density of 507 people per square kilometer, making it the second-most populous town in Bohol, behind Ubay. It is also the home of some of the world’s most densely populated islands, namely, Nocnocan, Guindacpan, Calituban, and Cataban.[02]

The bustling municipality’s major industries are farming and fishing with major products such as fishculture (which includes bangus, shrimp, and tilapia), banana, coconut, oyster, rice, seaweeds, swine, cassava, corn, and native chicken.[03] It is becoming a leading commercial hub for at least 1,409 registered retailers, wholesalers, and traders, as well as strong presence of banks and other financial institutions in northern part of Bohol. The municipality is also home to one of the branches of Alturas Group of Companies, which has established a mall and supermarket in the area since 2003. It also has a shipyard in Sitio Tabon, Barangay San Francisco since 2024.[04]

The locals are also into making artisanal fish traps, hats, and pottery. Silica, limestone, diorites, sand, iron ore, and gravel are also a large industry at present. These minerals are shipped to Cebu and Iligan aboard bulk carriers and barges as these locations are known for cement production and mineral processing.

Talibon has achieved a significant milestone, securing the 17th position among 1st and 2nd class municipalities in the entire country on the Cities and Municipalities Competitiveness Index (CMCI) 2024 by the Department of Trade & Industry (DTI). It has also made a huge leap from ranking 336th in 2023 to 178th in 2024 among all local government units. This ranking underscores Talibon’s effective performance and significant improvement across key indicators such as economic dynamism, government efficiency, infrastructure development, resilience, and innovation. The recognition thus solidifies Talibon’s position as a thriving and progressive municipality.[05]



REFERENCES:

Talibon, Bohol Profile. (n.d.). PhilAtlas. Retrieved August 27, 2024, from https://www.philatlas.com/visayas/r07/bohol/talibon.html

Highlights of the Population of the Municipality of Talibon (Based on the Results of 2020 Census of Population and Housing) (No. 2022-SR12-050). (2022). Philippine Statistics Authority. Retrieved August 27, 2024, from https://rsso07.psa.gov.ph/system/files/attachment-dir/2022-SR12-050.pdf

Agriculture and Fishery Modernization Plan 2024-2028. (n.d.). Local Government Unit of Talibon – Municipal Agriculturist’s Office.

Business Permit Listing Database (as of 19 August 2024). (n.d.). Local Government Unit of Talibon – Municipal Treasurer’s Office.

Cities and Municipalities Competitiveness Index (CMCI) 2024. (n.d.). Department of Trade and Industry. Retrieved August 27, 2024, from https://cmci.dti.gov.ph/rankings-data.php?unit=1st%20to%202nd%20Class%20Municipalities`,
      timeline: [
        { year: "1733", title: "Founding", description: "Talibon became a separate municipality from Inabanga, with Nicolas Calagan elected as its first mayor." },
        { year: "1854", title: "Official Recognition", description: "The municipality was officially recognized under the Spanish colonial regime." },
        { year: "1912", title: "American Occupation", description: "Transitioned to Municipal Presidents under the American Insular Government." },
        { year: "1942", title: "Japanese Occupation", description: "Japanese soldiers invaded Talibon on April 13, 1942. Atty. Maximino C. Boiser, Sr. served as mayor during this period." },
        { year: "1946", title: "Postwar Era", description: "Reconstruction and transition to Municipal Mayors under the new Philippine Republic." },
        { year: "1972", title: "Martial Law", description: "Vidal V. Crescencio, Sr. served as mayor during the onset of the Martial Law period." },
        { year: "2019", title: "Modern Era", description: "Hon. Janette A. Garcia was elected, focusing on modernization and government efficiency." },
        { year: "2024", title: "Competitiveness", description: "Talibon secured the 17th position among municipalities in the CMCI 2024 by DTI." }
      ]
    };
  }

  getMayors() {
    return [
      {
        section: "Capitanes Municipales under the Spanish Colonial Regime (1733 to 1898)",
        mayors: [
          { name: "Nicolas Calagan", term: "1733 – ? (First Elected Mayor)" },
          { name: "Mateo Auxtero", term: "1854 – ?" },
          { name: "Francisco Auxtero", term: "" },
          { name: "Feliciano Evangelista", term: "" },
          { name: "Anatalio Orjaleza", term: "" },
          { name: "Maximo Evangelista", term: "" },
          { name: "Pablo Gurrea", term: "" },
          { name: "Maximino Mumar", term: "" },
          { name: "Cipriano Tabigue", term: "" },
          { name: "Santiago Evangelista", term: "" },
          { name: "Gregorio Evangelista", term: "" },
          { name: "Modesto Evangelista", term: "" },
          { name: "Quiterio Garcia", term: "" },
          { name: "Eugenio Evangelista", term: "" },
          { name: "Maximo Rosales", term: "" },
        ]
      },
      {
        section: "Alcaldes Mayores under the Republic of Bohol and Early American Occupation (1898 to 1912)",
        mayors: [
          { name: "Eufemio Mumar", term: "" },
          { name: "Miguel Valmoria", term: "" },
          { name: "Pedro Valmoria", term: "" },
          { name: "Fortunato Boncales", term: "" },
          { name: "Marcelino Avergonzado", term: "" },
        ],
        commentary: {
          source: "Apawan, Y. A. (2024). Commentary on the historical accounts of Talibon’s founding [Unpublished commentary].",
          content: "Recent research by Prof. Emmanuel Luis A. Romanillos, as detailed in his 2022 book History of Bohol (1521-1937): Essays, Notes, and Sources published under the auspices of the National Historical Commission of the Philippines, reveals that Talibon became a separate municipality from Inabanga in 1733, with Nicolas Calagan elected as its first mayor. This finding, based on primary sources such as the Las Cosas Notables de los Pueblos de Bohol Legajo 66 No. 3 by the Augustinian Recollect fathers, contrasted with the existing ordinance that officially recognizes Talibon’s founding year as April 22, 1854, which was based on the writings of Atty. Simplicio Apalisok.\n\nNotably, Prof. Romanillos’s work is the most detailed and comprehensive historical reference on Bohol and Talibon to date, combining extensive archival research with critical analysis. Given the NHCP’s endorsement, the use of primary sources, and the scholarly rigor of this publication, this claim carries substantial historical weight. Since official records of mayoral successors from 1733 to 1854, as well as detailed accounts of terms from 1854 to 1912 (based on the 1950 Talibon Postwar Profile edited by Gregorio Eronico), are lost or irretrievable, ongoing efforts are being made to reconcile these historical accounts."
        }
      },
      {
        section: "Municipal Presidents under the Jones Law / Insular Government of the Philippine Islands and the Philippine Commonwealth (1912 to 1946)",
        mayors: [
          { name: "Policronio Garcia, Sr.", term: "1912-1916" },
          { name: "Gregorio G. Valmoria", term: "1916-1919" },
          { name: "Longino Avergonzado", term: "1919-1922" },
          { name: "Rosendo Evangelista", term: "1922-1925" },
          { name: "Policronio Garcia, Sr.", term: "1925-1933" },
          { name: "Ernesto B. Flores", term: "1934-1937" },
          { name: "Maximino A. Garcia, Sr.", term: "1938-1946" },
        ]
      },
      {
        section: "Municipal Mayors under the Japanese Occupation (1942 to 1945)",
        mayors: [
          { name: "Maximino Boiser, Sr.", term: "1942-1943 (Died in office; execution)" },
          { name: "Luis B. Goyeneche", term: "1944 (Appointed Mayor)" },
          { name: "Frederico Aguhar", term: "1946 (Acting Mayor)" },
          { name: "Eulalio Revilles", term: "1946-1948" },
        ]
      },
      {
        section: "Municipal Mayors under the Postwar Philippines (1946 to 1972)",
        mayors: [
          { name: "Pio Mabanag", term: "1948-1951 (Appointed Mayor)" },
          { name: "Deogracias Mumar", term: "1951 (Acting Mayor)" },
          { name: "Maximino A. Garcia, Sr.", term: "1952-1957" },
          { name: "Lazaro Evardo", term: "1957-1963" },
          { name: "Catalino Y. Casoyla", term: "1964-1971" },
        ],
        commentary: {
          source: "Apawan, Y. A. (2024). Commentary on the historical events in Talibon during World War II [Unpublished commentary].",
          content: "On April 13, 1942, Japanese soldiers invaded Talibon, ransacked the town, and demanded local officials surrender. When they found out the officials, including Mayor Maximino Garcia and then-Senator Carlos P. Garcia, had fled to Inopacan, Leyte, they forced the townspeople to form a new government under a young lawyer, Atty. Maximino C. Boiser, Sr., threatening to burn the town if they refused. From 1942 to 1944, Boiser acted as the de facto mayor while Garcia represented the Commonwealth government-in-exile and the guerrilla movement.\n\nOn November 4, 1943, Boiser was unfairly tried by a guerrilla court martial from Tagbilaran for allegedly collaborating with the Japanese. Denied a proper defense, he was found guilty and executed by firing squad at exactly 3 o’clock in the morning in the present-day Talibon Veterans’ Memorial Cemetery. Months after his death, Luis B. Goyeneche was appointed by the guerrillas and became mayor.\n\nLocal historian and educator Gregorio C. Eronico, in his article published in the 1973 Souvenir Program for Talibon Annual Town Fiesta Celebration, argued that Boiser was a misunderstood patriot who took the role of mayor to protect the people of Talibon. Eronico believed Boiser was a martyr who sacrificed himself to save the town from further harm, and his reputation was eventually cleared after the war."
        }
      },
      {
        section: "Municipal Mayors under the Martial Law Period (1972 to 1986)",
        mayors: [
          { name: "Vidal V. Crescencio, Sr.", term: "1972-1979" },
          { name: "Aureliano Evardo", term: "1979-1986" },
        ]
      },
      {
        section: "Municipal Mayors in the Fifth Philippine Republic (1986 to present)",
        mayors: [
          { name: "Sergio E. Credo", term: "1986 (OIC)" },
          { name: "Esperanza E. Cañete", term: "1986-1987 (OIC)" },
          { name: "Samuel T. Turtoga", term: "1987-1988 (OIC)" },
          { name: "Flordelis A. Garcia", term: "1988-1988 (OIC)" },
          { name: "Gaudencio A. Artiaga", term: "1988-1995" },
          { name: "Juanario A. Item", term: "1995-2001" },
          { name: "Marcos Q. Aurestila", term: "2001-2004" },
          { name: "Juanario A. Item", term: "2004-2010" },
          { name: "Restituto B. Auxtero", term: "2010-2019" },
          { name: "Janette A. Garcia", term: "2019-present" },
        ]
      }
    ];
  }

  getDepartments() {
    return [
      {
        name: "Agriculture Office",
        officialName: "Office Of Municipal Agriculturist",
        type: "Development Office",
        description: "Supports farmers through agricultural programs, modernization, and food security projects.",
        logoUrl: "http://talibon.gov.ph/wp-content/uploads/2025/10/1.png",
        head: "Engr. Melchor B. Evangelista",
        contact: "+63 38 515 9011",
        serviceLink: "/forms/business"
      },
      {
        name: "City Treasurer's Office",
        officialName: "Municipal Treasury Office",
        type: "Financial Office",
        description: "Manages the city’s financial resources, including revenue collection and disbursements.",
        logoUrl: "http://talibon.gov.ph/wp-content/uploads/2025/10/10.png",
        head: "Maria Elena C. Garcia",
        contact: "+63 38 515 9012",
        serviceLink: "/transparency/finance"
      },
      {
        name: "City Planning & Development",
        officialName: "Municipal Planning And Development Office",
        type: "Planning Office",
        description: "Formulates development plans and land-use policies for sustainable city growth.",
        logoUrl: "http://talibon.gov.ph/wp-content/uploads/2025/10/7.png",
        head: "Arch. Jose S. Mumar Jr.",
        contact: "+63 38 515 9013",
        serviceLink: "/transparency/infrastructure"
      },
      {
        name: "Local Civil Registrar (LCR)",
        officialName: "Office Of The Municipal Civil Registrar",
        type: "Administrative",
        description: "Responsible for the registration of vital events like births, marriages, and deaths.",
        logoUrl: "https://talibon.gov.ph/wp-content/uploads/2022/01/LCR.png",
        head: "Atty. Felicisimo A. Tabigue",
        contact: "+63 38 515 9014",
        serviceLink: "/transparency/charter"
      },
      {
        name: "Engineering Office",
        officialName: "Municipal Engineering Office",
        type: "Infrastructure",
        description: "Plans and supervises public infrastructure projects and building permits.",
        logoUrl: "https://talibon.gov.ph/wp-content/uploads/2022/01/Engineering-Office.png",
        head: "Engr. Restituto B. Auxtero",
        contact: "+63 38 515 9015",
        serviceLink: "/forms/building"
      },
      {
        name: "Health Office",
        officialName: "Municipal Health Office",
        type: "Health",
        description: "Provides primary healthcare services and implements public health programs.",
        logoUrl: "https://talibon.gov.ph/wp-content/uploads/2022/01/Health-Office.png",
        head: "Dr. Janette A. Garcia",
        contact: "+63 38 515 9016",
        serviceLink: "/about/services"
      }
    ];
  }

  getVicinityMap() {
    return {
      title: "Vicinity Map",
      url: "https://talibon.gov.ph/wp-content/themes/yootheme/cache/df/Vicinity-Map-photo-scaled-dffa0e8c.webp",
      description: "Talibon is located in the northern part of Bohol, approximately 114 kilometers from Tagbilaran City.",
    };
  }

  getBarangays() {
    return [
      "Bagacay", "Balintawak", "Burgos", "Caboy", "Calituban", "Cataban", "Guindacpan", "Magsaysay", "Mahanay", "Nocnocan", "Poblacion", "San Agustin", "San Francisco", "San Isidro", "San Jose", "San Pedro", "San Roque", "Santo Niño", "Sikatuna", "Suba", "Tanghaligue", "Tapal", "Trinidad", "Via Victoria", "Zamora"
    ];
  }

  getIndustry() {
    return {
      title: "Industry",
      content: "Industry\nEconomic sectors\nKey Businesses\nWorkforce\nWorkforce",
    };
  }

  getServices() {
    return [
      { name: "Business Licensing", description: "Issuance of permits for local businesses and investment promotions." },
      { name: "Health Services", description: "Primary healthcare, emergency services, and public health programs." },
      { name: "Social Welfare", description: "Assistance for marginalized sectors, senior citizens, and PWDs." },
      { name: "Civil Registration", description: "Registration of vital events like births, marriages, and deaths." },
      { name: "Real Property Assessment", description: "Management of real property assessments and tax mapping." },
      { name: "Building Permits", description: "Processing of building permits and infrastructure compliance." },
      { name: "Zoning Clearance", description: "Issuance of zoning clearances and land-use compliance." },
      { name: "Disaster Response", description: "Emergency response, disaster preparedness, and recovery efforts." },
      { name: "Tourism Promotion", description: "Promotion of local tourist spots and cultural heritage preservation." },
      { name: "Public Employment Service", description: "Job matching, training opportunities, and employment assistance." },
    ];
  }

  getHymn() {
    return {
      title: "Talibon Hymn",
      imageUrl: "https://talibon.gov.ph/wp-content/themes/yootheme/cache/43/Untitled-design-4-43cd0b59.webp",
    };
  }

  getDemographics() {
    return {
      title: "Demographics",
      content: "According to the 2020 Philippine Statistics Authority Population Census, Talibon has a population of 71,272 people and a population density of 507 people per square kilometer, making it the second-most populous town in Bohol. It is also home to some of the world’s most densely populated islands, namely Nocnocan, Guindacpan, Calituban, and Cataban.",
    };
  }

  getLocation() {
    return {
      title: "Location",
      lat: 10.1517,
      lng: 124.3311,
      logoUrl: "http://talibon.gov.ph/wp-content/uploads/2025/09/Talibon-Official-Seal-v4-2003-to-2023-.png",
      description: "Talibon is located in the northernmost part of Bohol, bounded by Camotes Sea to the north.",
    };
  }
}
