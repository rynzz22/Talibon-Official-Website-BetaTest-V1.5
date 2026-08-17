var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);

// src/server/serverless.ts
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";

// src/server/app.module.ts
import { Module as Module3, RequestMethod } from "@nestjs/common";
import { APP_GUARD, APP_FILTER } from "@nestjs/core";
import * as path from "path";
import * as express from "express";

// src/server/api/about/about.controller.ts
import { Controller, Get, Inject } from "@nestjs/common";

// src/server/api/about/about.service.ts
import { Injectable } from "@nestjs/common";
import { createClient } from "@supabase/supabase-js";
function getSupabaseClient() {
  const rawUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://iuzupzknnuimfyzcdtxl.supabase.co";
  const rawKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!rawKey) return null;
  let url = rawUrl.trim();
  if (url.endsWith("/rest/v1/")) url = url.slice(0, -9);
  if (url.endsWith("/rest/v1")) url = url.slice(0, -8);
  if (url.endsWith("/")) url = url.slice(0, -1);
  try {
    return createClient(url, rawKey);
  } catch {
    return null;
  }
}
var AboutService = class {
  getProfile() {
    return {
      title: "Brief Profile",
      content: `BRIEF PROFILE OF TALIBON

(Yvux A. Apawan)

Talibon, officially the Municipality of Talibon (Cebuano: Lungsod sa Talibon; Tagalog: Bayan ng Talibon), is a 1st class municipality that lies in the northernmost part of the island Province of Bohol in Central Visayas, Philippines. It is located approximately 114.8 km North of Tagbilaran City, 611.28 km Southeast of Manila, and 49.01 km Southeast of Cebu City.

Its coastline has significant patches of the Danajon Bank, the only documented double barrier reef in the Philippines that is teeming with bountiful natural marine resources. Hence, Talibon is considered as the official Seafood Capital of Bohol. The municipality is bounded on the North by the Camotes Sea, South by the municipality of Trinidad, East by the municipality of Bien Unido, West by the municipality of Getafe, and Southwest by the municipality of Buenavista. Specifically, it is located within 10\xB0 09\u2019 06\u201D North longitude 124\xB0 17\u2019 25\u201D East latitude.[01]

Accessibility to Talibon from the capital, Tagbilaran City, is facilitated by the western or eastern exits of the Bohol Circumferential Road, located 114.8 and 150 km away, respectively. Alternatively, travelers can reach Talibon through the Loay Interior Road via Loboc and Carmen, which is just 109 km away. It is easily accessible to Cebu City directly by boat, approximately 4 hours (36 nautical miles), and proximity to the province of Southern Leyte by boat via Bato, Ubay, Bohol to Bato Leyte (36 nautical miles) trip, taking approximately 3 hours. It can also be accessed by roll-on roll-off (RORO) ferries or by high-speed catamaran and monohull crafts via Ports of Tubigon or Getafe, followed by an hour or 30-minute journey by road, respectively.

The municipality possesses a total land area of 140.46 sq km, of which about 7.97 sq km or 5.7% is classified as urban, while the remaining 132.49 sq km is rural. It has twenty-five (25) barangays divided into three (3) groups of eight (8) island barangays, nine (9) coastal barangays, and eight (8) inland barangays. Urbanized barangays include Poblaci\xF3n, San Jose, San Francisco, San Isidro, Balintawak, and San Agustin.

According to the 2020 Philippine Statistics Authority Population Census, it has a population of 71,272 people and a population density of 507 people per square kilometer, making it the second-most populous town in Bohol, behind Ubay. It is also the home of some of the world\u2019s most densely populated islands, namely, Nocnocan, Guindacpan, Calituban, and Cataban.[02]

The bustling municipality\u2019s major industries are farming and fishing with major products such as fishculture (which includes bangus, shrimp, and tilapia), banana, coconut, oyster, rice, seaweeds, swine, cassava, corn, and native chicken.[03] It is becoming a leading commercial hub for at least 1,409 registered retailers, wholesalers, and traders, as well as strong presence of banks and other financial institutions in northern part of Bohol. The municipality is also home to one of the branches of Alturas Group of Companies, which has established a mall and supermarket in the area since 2003. It also has a shipyard in Sitio Tabon, Barangay San Francisco since 2024.[04]

The locals are also into making artisanal fish traps, hats, and pottery. Silica, limestone, diorites, sand, iron ore, and gravel are also a large industry at present. These minerals are shipped to Cebu and Iligan aboard bulk carriers and barges as these locations are known for cement production and mineral processing.

Talibon has achieved a significant milestone, securing the 17th position among 1st and 2nd class municipalities in the entire country on the Cities and Municipalities Competitiveness Index (CMCI) 2024 by the Department of Trade & Industry (DTI). It has also made a huge leap from ranking 336th in 2023 to 178th in 2024 among all local government units. This ranking underscores Talibon\u2019s effective performance and significant improvement across key indicators such as economic dynamism, government efficiency, infrastructure development, resilience, and innovation. The recognition thus solidifies Talibon\u2019s position as a thriving and progressive municipality.[05]



REFERENCES:

Talibon, Bohol Profile. (n.d.). PhilAtlas. Retrieved August 27, 2024, from https://www.philatlas.com/visayas/r07/bohol/talibon.html

Highlights of the Population of the Municipality of Talibon (Based on the Results of 2020 Census of Population and Housing) (No. 2022-SR12-050). (2022). Philippine Statistics Authority. Retrieved August 27, 2024, from https://rsso07.psa.gov.ph/system/files/attachment-dir/2022-SR12-050.pdf

Agriculture and Fishery Modernization Plan 2024-2028. (n.d.). Local Government Unit of Talibon \u2013 Municipal Agriculturist\u2019s Office.

Business Permit Listing Database (as of 19 August 2024). (n.d.). Local Government Unit of Talibon \u2013 Municipal Treasurer\u2019s Office.

Cities and Municipalities Competitiveness Index (CMCI) 2024. (n.d.). Department of Trade and Industry. Retrieved August 27, 2024, from https://cmci.dti.gov.ph/rankings-data.php?unit=1st%20to%202nd%20Class%20Municipalities`
    };
  }
  getSeal() {
    return {
      title: "Official Seal",
      description: "The official seal of Talibon represents its rich maritime heritage and its status as a key coastal municipality."
    };
  }
  getHistory() {
    return {
      title: "Brief History",
      content: `BRIEF HISTORY OF TALIBON

(Yvux A. Apawan)

Talibon, officially the Municipality of Talibon (Cebuano: Lungsod sa Talibon; Tagalog: Bayan ng Talibon), is a 1st class municipality that lies in the northernmost part of the island Province of Bohol in Central Visayas, Philippines. It is located approximately 114.8 km North of Tagbilaran City, 611.28 km Southeast of Manila, and 49.01 km Southeast of Cebu City.

Its coastline has significant patches of the Danajon Bank, the only documented double barrier reef in the Philippines that is teeming with bountiful natural marine resources. Hence, Talibon is considered as the official Seafood Capital of Bohol. The municipality is bounded on the North by the Camotes Sea, South by the municipality of Trinidad, East by the municipality of Bien Unido, West by the municipality of Getafe, and Southwest by the municipality of Buenavista. Specifically, it is located within 10\xB0 09\u2019 06\u201D North longitude 124\xB0 17\u2019 25\u201D East latitude.[01]

Accessibility to Talibon from the capital, Tagbilaran City, is facilitated by the western or eastern exits of the Bohol Circumferential Road, located 114.8 and 150 km away, respectively. Alternatively, travelers can reach Talibon through the Loay Interior Road via Loboc and Carmen, which is just 109 km away. It is easily accessible to Cebu City directly by boat, approximately 4 hours (36 nautical miles), and proximity to the province of Southern Leyte by boat via Bato, Ubay, Bohol to Bato Leyte (36 nautical miles) trip, taking approximately 3 hours. It can also be accessed by roll-on roll-off (RORO) ferries or by high-speed catamaran and monohull crafts via Ports of Tubigon or Getafe, followed by an hour or 30-minute journey by road, respectively.

The municipality possesses a total land area of 140.46 sq km, of which about 7.97 sq km or 5.7% is classified as urban, while the remaining 132.49 sq km is rural. It has twenty-five (25) barangays divided into three (3) groups of eight (8) island barangays, nine (9) coastal barangays, and eight (8) inland barangays. Urbanized barangays include Poblaci\xF3n, San Jose, San Francisco, San Isidro, Balintawak, and San Agustin.

According to the 2020 Philippine Statistics Authority Population Census, it has a population of 71,272 people and a population density of 507 people per square kilometer, making it the second-most populous town in Bohol, behind Ubay. It is also the home of some of the world\u2019s most densely populated islands, namely, Nocnocan, Guindacpan, Calituban, and Cataban.[02]

The bustling municipality\u2019s major industries are farming and fishing with major products such as fishculture (which includes bangus, shrimp, and tilapia), banana, coconut, oyster, rice, seaweeds, swine, cassava, corn, and native chicken.[03] It is becoming a leading commercial hub for at least 1,409 registered retailers, wholesalers, and traders, as well as strong presence of banks and other financial institutions in northern part of Bohol. The municipality is also home to one of the branches of Alturas Group of Companies, which has established a mall and supermarket in the area since 2003. It also has a shipyard in Sitio Tabon, Barangay San Francisco since 2024.[04]

The locals are also into making artisanal fish traps, hats, and pottery. Silica, limestone, diorites, sand, iron ore, and gravel are also a large industry at present. These minerals are shipped to Cebu and Iligan aboard bulk carriers and barges as these locations are known for cement production and mineral processing.

Talibon has achieved a significant milestone, securing the 17th position among 1st and 2nd class municipalities in the entire country on the Cities and Municipalities Competitiveness Index (CMCI) 2024 by the Department of Trade & Industry (DTI). It has also made a huge leap from ranking 336th in 2023 to 178th in 2024 among all local government units. This ranking underscores Talibon\u2019s effective performance and significant improvement across key indicators such as economic dynamism, government efficiency, infrastructure development, resilience, and innovation. The recognition thus solidifies Talibon\u2019s position as a thriving and progressive municipality.[05]



REFERENCES:

Talibon, Bohol Profile. (n.d.). PhilAtlas. Retrieved August 27, 2024, from https://www.philatlas.com/visayas/r07/bohol/talibon.html

Highlights of the Population of the Municipality of Talibon (Based on the Results of 2020 Census of Population and Housing) (No. 2022-SR12-050). (2022). Philippine Statistics Authority. Retrieved August 27, 2024, from https://rsso07.psa.gov.ph/system/files/attachment-dir/2022-SR12-050.pdf

Agriculture and Fishery Modernization Plan 2024-2028. (n.d.). Local Government Unit of Talibon \u2013 Municipal Agriculturist\u2019s Office.

Business Permit Listing Database (as of 19 August 2024). (n.d.). Local Government Unit of Talibon \u2013 Municipal Treasurer\u2019s Office.

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
          { name: "Nicolas Calagan", term: "1733 \u2013 ? (First Elected Mayor)" },
          { name: "Mateo Auxtero", term: "1854 \u2013 ?" },
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
          { name: "Maximo Rosales", term: "" }
        ]
      },
      {
        section: "Alcaldes Mayores under the Republic of Bohol and Early American Occupation (1898 to 1912)",
        mayors: [
          { name: "Eufemio Mumar", term: "" },
          { name: "Miguel Valmoria", term: "" },
          { name: "Pedro Valmoria", term: "" },
          { name: "Fortunato Boncales", term: "" },
          { name: "Marcelino Avergonzado", term: "" }
        ],
        commentary: {
          source: "Apawan, Y. A. (2024). Commentary on the historical accounts of Talibon\u2019s founding [Unpublished commentary].",
          content: "Recent research by Prof. Emmanuel Luis A. Romanillos, as detailed in his 2022 book History of Bohol (1521-1937): Essays, Notes, and Sources published under the auspices of the National Historical Commission of the Philippines, reveals that Talibon became a separate municipality from Inabanga in 1733, with Nicolas Calagan elected as its first mayor. This finding, based on primary sources such as the Las Cosas Notables de los Pueblos de Bohol Legajo 66 No. 3 by the Augustinian Recollect fathers, contrasted with the existing ordinance that officially recognizes Talibon\u2019s founding year as April 22, 1854, which was based on the writings of Atty. Simplicio Apalisok.\n\nNotably, Prof. Romanillos\u2019s work is the most detailed and comprehensive historical reference on Bohol and Talibon to date, combining extensive archival research with critical analysis. Given the NHCP\u2019s endorsement, the use of primary sources, and the scholarly rigor of this publication, this claim carries substantial historical weight. Since official records of mayoral successors from 1733 to 1854, as well as detailed accounts of terms from 1854 to 1912 (based on the 1950 Talibon Postwar Profile edited by Gregorio Eronico), are lost or irretrievable, ongoing efforts are being made to reconcile these historical accounts."
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
          { name: "Maximino A. Garcia, Sr.", term: "1938-1946" }
        ]
      },
      {
        section: "Municipal Mayors under the Japanese Occupation (1942 to 1945)",
        mayors: [
          { name: "Maximino Boiser, Sr.", term: "1942-1943 (Died in office; execution)" },
          { name: "Luis B. Goyeneche", term: "1944 (Appointed Mayor)" },
          { name: "Frederico Aguhar", term: "1946 (Acting Mayor)" },
          { name: "Eulalio Revilles", term: "1946-1948" }
        ]
      },
      {
        section: "Municipal Mayors under the Postwar Philippines (1946 to 1972)",
        mayors: [
          { name: "Pio Mabanag", term: "1948-1951 (Appointed Mayor)" },
          { name: "Deogracias Mumar", term: "1951 (Acting Mayor)" },
          { name: "Maximino A. Garcia, Sr.", term: "1952-1957" },
          { name: "Lazaro Evardo", term: "1957-1963" },
          { name: "Catalino Y. Casoyla", term: "1964-1971" }
        ],
        commentary: {
          source: "Apawan, Y. A. (2024). Commentary on the historical events in Talibon during World War II [Unpublished commentary].",
          content: "On April 13, 1942, Japanese soldiers invaded Talibon, ransacked the town, and demanded local officials surrender. When they found out the officials, including Mayor Maximino Garcia and then-Senator Carlos P. Garcia, had fled to Inopacan, Leyte, they forced the townspeople to form a new government under a young lawyer, Atty. Maximino C. Boiser, Sr., threatening to burn the town if they refused. From 1942 to 1944, Boiser acted as the de facto mayor while Garcia represented the Commonwealth government-in-exile and the guerrilla movement.\n\nOn November 4, 1943, Boiser was unfairly tried by a guerrilla court martial from Tagbilaran for allegedly collaborating with the Japanese. Denied a proper defense, he was found guilty and executed by firing squad at exactly 3 o\u2019clock in the morning in the present-day Talibon Veterans\u2019 Memorial Cemetery. Months after his death, Luis B. Goyeneche was appointed by the guerrillas and became mayor.\n\nLocal historian and educator Gregorio C. Eronico, in his article published in the 1973 Souvenir Program for Talibon Annual Town Fiesta Celebration, argued that Boiser was a misunderstood patriot who took the role of mayor to protect the people of Talibon. Eronico believed Boiser was a martyr who sacrificed himself to save the town from further harm, and his reputation was eventually cleared after the war."
        }
      },
      {
        section: "Municipal Mayors under the Martial Law Period (1972 to 1986)",
        mayors: [
          { name: "Vidal V. Crescencio, Sr.", term: "1972-1979" },
          { name: "Aureliano Evardo", term: "1979-1986" }
        ]
      },
      {
        section: "Municipal Mayors in the Fifth Philippine Republic (1986 to present)",
        mayors: [
          { name: "Sergio E. Credo", term: "1986 (OIC)" },
          { name: "Esperanza E. Ca\xF1ete", term: "1986-1987 (OIC)" },
          { name: "Samuel T. Turtoga", term: "1987-1988 (OIC)" },
          { name: "Flordelis A. Garcia", term: "1988-1988 (OIC)" },
          { name: "Gaudencio A. Artiaga", term: "1988-1995" },
          { name: "Juanario A. Item", term: "1995-2001" },
          { name: "Marcos Q. Aurestila", term: "2001-2004" },
          { name: "Juanario A. Item", term: "2004-2010" },
          { name: "Restituto B. Auxtero", term: "2010-2019" },
          { name: "Janette A. Garcia", term: "2019-present" }
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
        description: "Manages the city\u2019s financial resources, including revenue collection and disbursements.",
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
      description: "Talibon is located in the northern part of Bohol, approximately 114 kilometers from Tagbilaran City."
    };
  }
  getBarangays() {
    return [
      "Bagacay",
      "Balintawak",
      "Burgos",
      "Caboy",
      "Calituban",
      "Cataban",
      "Guindacpan",
      "Magsaysay",
      "Mahanay",
      "Nocnocan",
      "Poblacion",
      "San Agustin",
      "San Francisco",
      "San Isidro",
      "San Jose",
      "San Pedro",
      "San Roque",
      "Santo Ni\xF1o",
      "Sikatuna",
      "Suba",
      "Tanghaligue",
      "Tapal",
      "Trinidad",
      "Via Victoria",
      "Zamora"
    ];
  }
  getIndustry() {
    return {
      title: "Industry",
      content: "Industry\nEconomic sectors\nKey Businesses\nWorkforce\nWorkforce"
    };
  }
  async getServices() {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from("municipal_services").select("*, departments:office_responsible_id(id, name)").is("deleted_at", null).order("name", { ascending: true });
        if (!error && data) {
          return data.map((s) => ({
            id: s.id,
            name: s.name,
            slug: s.slug || s.id,
            description: s.description || "",
            purpose: s.purpose || "",
            requirements: Array.isArray(s.requirements) ? s.requirements : [],
            processing_time: s.processing_time || "",
            fees: s.fees || "",
            office_responsible_id: s.office_responsible_id || null,
            office_responsible: s.departments?.name || s.office_responsible || "Municipal Office",
            office_hours: s.office_hours || "Monday to Friday, 8:00 AM - 5:00 PM",
            contact_info: s.contact_info || "",
            physical_address: s.physical_address || "",
            status: s.status || "available",
            downloadable_forms: Array.isArray(s.downloadable_forms) ? s.downloadable_forms : []
          }));
        }
      } catch (e) {
        console.warn("[AboutService] Failed to fetch municipal_services from Supabase:", e);
      }
    }
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
      { name: "Public Employment Service", description: "Job matching, training opportunities, and employment assistance." }
    ];
  }
  getHymn() {
    return {
      title: "Talibon Hymn",
      imageUrl: "https://talibon.gov.ph/wp-content/themes/yootheme/cache/43/Untitled-design-4-43cd0b59.webp"
    };
  }
  getDemographics() {
    return {
      title: "Demographics",
      content: "According to the 2020 Philippine Statistics Authority Population Census, Talibon has a population of 71,272 people and a population density of 507 people per square kilometer, making it the second-most populous town in Bohol. It is also home to some of the world\u2019s most densely populated islands, namely Nocnocan, Guindacpan, Calituban, and Cataban."
    };
  }
  getLocation() {
    return {
      title: "Location",
      lat: 10.1517,
      lng: 124.3311,
      logoUrl: "http://talibon.gov.ph/wp-content/uploads/2025/09/Talibon-Official-Seal-v4-2003-to-2023-.png",
      description: "Talibon is located in the northernmost part of Bohol, bounded by Camotes Sea to the north."
    };
  }
};
AboutService = __decorateClass([
  Injectable()
], AboutService);

// src/server/api/about/about.controller.ts
var AboutController = class {
  constructor(aboutService) {
    this.aboutService = aboutService;
  }
  getProfile() {
    return this.aboutService.getProfile();
  }
  getSeal() {
    return this.aboutService.getSeal();
  }
  getHistory() {
    return this.aboutService.getHistory();
  }
  getMayors() {
    return this.aboutService.getMayors();
  }
  getDepartments() {
    return this.aboutService.getDepartments();
  }
  getVicinityMap() {
    return this.aboutService.getVicinityMap();
  }
  getBarangays() {
    return this.aboutService.getBarangays();
  }
  getIndustry() {
    return this.aboutService.getIndustry();
  }
  getServices() {
    return this.aboutService.getServices();
  }
  getHymn() {
    return this.aboutService.getHymn();
  }
  getDemographics() {
    return this.aboutService.getDemographics();
  }
  getLocation() {
    return this.aboutService.getLocation();
  }
};
__decorateClass([
  Get("profile")
], AboutController.prototype, "getProfile", 1);
__decorateClass([
  Get("seal")
], AboutController.prototype, "getSeal", 1);
__decorateClass([
  Get("history")
], AboutController.prototype, "getHistory", 1);
__decorateClass([
  Get("mayors")
], AboutController.prototype, "getMayors", 1);
__decorateClass([
  Get("departments")
], AboutController.prototype, "getDepartments", 1);
__decorateClass([
  Get("vicinity-map")
], AboutController.prototype, "getVicinityMap", 1);
__decorateClass([
  Get("barangays")
], AboutController.prototype, "getBarangays", 1);
__decorateClass([
  Get("industry")
], AboutController.prototype, "getIndustry", 1);
__decorateClass([
  Get("services")
], AboutController.prototype, "getServices", 1);
__decorateClass([
  Get("hymn")
], AboutController.prototype, "getHymn", 1);
__decorateClass([
  Get("demographics")
], AboutController.prototype, "getDemographics", 1);
__decorateClass([
  Get("location")
], AboutController.prototype, "getLocation", 1);
AboutController = __decorateClass([
  Controller("api/about"),
  __decorateParam(0, Inject(AboutService))
], AboutController);

// src/server/api/executive/executive.controller.ts
import { Controller as Controller2, Get as Get2, Inject as Inject2 } from "@nestjs/common";

// src/server/api/executive/executive.service.ts
import { Injectable as Injectable2 } from "@nestjs/common";
var ExecutiveService = class {
  getMandate() {
    return {
      title: "Executive Mandate",
      content: "The Executive Department is responsible for the overall administration and implementation of policies and programs in Talibon."
    };
  }
  getVisionMission() {
    return {
      vision: "Talibon: The Seafood Capital of Bohol anchoring sustainable tourism, smart urban growth, and digital innovation, empowered by its marine wealth, cultural vibrance, and climate-resilient communities.",
      mission: "To promote inclusive economic development by sustainably managing marine resources, fostering innovation in governance, enhancing urban infrastructure, and empowering communities through education, culture, and enterprise."
    };
  }
  getChart() {
    return {
      title: "Organizational Chart",
      mayor: { name: "HON. JANETTE GARCIA", role: "MUNICIPAL MAYOR" },
      level2: [
        { name: "MR. MANUELITO A. CAROSUS", role: "MUNICIPAL ADMINISTRATOR" },
        { name: "SANGGUNIANG BAYAN OFFICE", role: "LEGISLATIVE BODY" }
      ],
      departments: [
        { name: "MS. FLOR JEMMA P. CAJES", role: "MUNICIPAL ACCOUNTANT" },
        { name: "MS. BERNARDITA V. AUTENTICO", role: "MUNICIPAL TREASURER" },
        { name: "MS. FALCONIRIS A. LUGASIP", role: "MUNICIPAL BUDGET OFFICER" },
        { name: "MS. SARAH JANE R. HENSON", role: "HUMAN RESOURCE MANAGEMENT OFFICER" },
        { name: "ENGR. GERRY V. ARA\xD1ETA", role: "MUNICIPAL PLANNING DEVELOPMENT COORDINATOR" },
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
        { name: "ENGR. FERDINAND Q. ARTIAGA", role: "PARKING INTEGRATION TRANSPORT TERMINAL OFFICER" }
      ]
    };
  }
  getDirectory() {
    return [
      { department: "Mayor's Office", contact: "038-123-4567" },
      { department: "Treasurer's Office", contact: "038-123-4568" }
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
                "Legal bases (RA 9710 / Magna Carta of Women; PCW\u2013DILG\u2013DBM\u2013NEDA JMCs)",
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
                "Gender Issue\u2013Cause\u2013Objective (GICO) tables",
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
};
ExecutiveService = __decorateClass([
  Injectable2()
], ExecutiveService);

// src/server/api/executive/executive.controller.ts
var ExecutiveController = class {
  constructor(executiveService) {
    this.executiveService = executiveService;
  }
  getMandate() {
    return this.executiveService.getMandate();
  }
  getVisionMission() {
    return this.executiveService.getVisionMission();
  }
  getChart() {
    return this.executiveService.getChart();
  }
  getDirectory() {
    return this.executiveService.getDirectory();
  }
  getGadIms() {
    return this.executiveService.getGadIms();
  }
};
__decorateClass([
  Get2("mandate")
], ExecutiveController.prototype, "getMandate", 1);
__decorateClass([
  Get2("vision-mission")
], ExecutiveController.prototype, "getVisionMission", 1);
__decorateClass([
  Get2("chart")
], ExecutiveController.prototype, "getChart", 1);
__decorateClass([
  Get2("directory")
], ExecutiveController.prototype, "getDirectory", 1);
__decorateClass([
  Get2("gad-ims")
], ExecutiveController.prototype, "getGadIms", 1);
ExecutiveController = __decorateClass([
  Controller2("api/executive"),
  __decorateParam(0, Inject2(ExecutiveService))
], ExecutiveController);

// src/server/api/legislative/legislative.controller.ts
import { Controller as Controller3, Get as Get3, Inject as Inject3 } from "@nestjs/common";

// src/server/api/legislative/legislative.service.ts
import { Injectable as Injectable3 } from "@nestjs/common";
var LegislativeService = class {
  getMandate() {
    return {
      title: "Legislative Mandate",
      content: "The Sangguniang Bayan is the legislative body of the municipality, responsible for enacting ordinances and resolutions."
    };
  }
  getStructure() {
    return {
      title: "Organizational Structure",
      imageUrl: "https://talibon.gov.ph/wp-content/themes/yootheme/cache/05/viber_image_2025-10-24_14-50-54-459-05f74d51.webp"
    };
  }
  getOrdinances() {
    return [
      { id: "2023-01", title: "Environmental Protection Ordinance", date: "2023-01-15" },
      { id: "2023-02", title: "Traffic Management Code", date: "2023-02-20" }
    ];
  }
  getResolutions() {
    return [
      { id: "RES-2023-01", title: "Resolution for New Public Market", date: "2023-01-10" }
    ];
  }
};
LegislativeService = __decorateClass([
  Injectable3()
], LegislativeService);

// src/server/api/legislative/legislative.controller.ts
var LegislativeController = class {
  constructor(legislativeService) {
    this.legislativeService = legislativeService;
  }
  getMandate() {
    return this.legislativeService.getMandate();
  }
  getStructure() {
    return this.legislativeService.getStructure();
  }
  getOrdinances() {
    return this.legislativeService.getOrdinances();
  }
  getResolutions() {
    return this.legislativeService.getResolutions();
  }
};
__decorateClass([
  Get3("mandate")
], LegislativeController.prototype, "getMandate", 1);
__decorateClass([
  Get3("structure")
], LegislativeController.prototype, "getStructure", 1);
__decorateClass([
  Get3("ordinances")
], LegislativeController.prototype, "getOrdinances", 1);
__decorateClass([
  Get3("resolutions")
], LegislativeController.prototype, "getResolutions", 1);
LegislativeController = __decorateClass([
  Controller3("api/legislative"),
  __decorateParam(0, Inject3(LegislativeService))
], LegislativeController);

// src/server/api/news/news.controller.ts
import { Controller as Controller4, Get as Get4, Inject as Inject4 } from "@nestjs/common";

// src/server/api/news/news.service.ts
import { Injectable as Injectable4 } from "@nestjs/common";
var NewsService = class {
  getArticles() {
    return [
      { id: 1, title: "Talibon Celebrates Seafood Festival", date: "2024-03-20", image: "https://picsum.photos/seed/news1/800/600" },
      { id: 2, title: "New Infrastructure Project Launched", date: "2024-03-15", image: "https://picsum.photos/seed/news2/800/600" }
    ];
  }
  getAdvisories() {
    return [
      { id: 1, title: "Water Service Interruption", date: "2024-03-25", content: "Scheduled maintenance on March 26." }
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
        { name: "RHU Main", number: "(0963) 347 6355" }
      ],
      socials: {
        email: "talibonofficial@gmail.com",
        mayorOffice: "(038) 422-2895"
      }
    };
  }
  getUpdates() {
    return [
      { id: 1, title: "LGU Update: New Health Protocols", date: "2024-03-10" }
    ];
  }
  getGallery() {
    return [
      { id: 1, url: "https://picsum.photos/seed/g1/800/600", caption: "Town Plaza" },
      { id: 2, url: "https://picsum.photos/seed/g2/800/600", caption: "Coastal View" }
    ];
  }
  getCommunity() {
    return {
      title: "Community News",
      content: "Updates and stories from the different barangays of Talibon."
    };
  }
  getPublicNotices() {
    return [
      { id: 1, title: "Notice of Public Hearing", date: "2024-04-05" }
    ];
  }
  getDownloadableForms() {
    return [
      { id: 1, title: "Scholarship Application Form", url: "#" }
    ];
  }
};
NewsService = __decorateClass([
  Injectable4()
], NewsService);

// src/server/api/news/news.controller.ts
var NewsController = class {
  constructor(newsService) {
    this.newsService = newsService;
  }
  getArticles() {
    return this.newsService.getArticles();
  }
  getAdvisories() {
    return this.newsService.getAdvisories();
  }
  getDisasterPreparedness() {
    return this.newsService.getDisasterPreparedness();
  }
  getUpdates() {
    return this.newsService.getUpdates();
  }
  getGallery() {
    return this.newsService.getGallery();
  }
  getCommunity() {
    return this.newsService.getCommunity();
  }
  getPublicNotices() {
    return this.newsService.getPublicNotices();
  }
  getDownloadable() {
    return this.newsService.getDownloadableForms();
  }
};
__decorateClass([
  Get4("articles")
], NewsController.prototype, "getArticles", 1);
__decorateClass([
  Get4("advisories")
], NewsController.prototype, "getAdvisories", 1);
__decorateClass([
  Get4("disaster-preparedness")
], NewsController.prototype, "getDisasterPreparedness", 1);
__decorateClass([
  Get4("updates")
], NewsController.prototype, "getUpdates", 1);
__decorateClass([
  Get4("gallery")
], NewsController.prototype, "getGallery", 1);
__decorateClass([
  Get4("community")
], NewsController.prototype, "getCommunity", 1);
__decorateClass([
  Get4("public-notices")
], NewsController.prototype, "getPublicNotices", 1);
__decorateClass([
  Get4("downloadable")
], NewsController.prototype, "getDownloadable", 1);
NewsController = __decorateClass([
  Controller4("api/news"),
  __decorateParam(0, Inject4(NewsService))
], NewsController);

// src/server/api/transparency/transparency.controller.ts
import { Controller as Controller5, Get as Get5, Inject as Inject5 } from "@nestjs/common";

// src/server/api/transparency/transparency.service.ts
import { Injectable as Injectable5 } from "@nestjs/common";
var TransparencyService = class {
  getCitizenCharter() {
    return {
      title: "Citizen's Charter",
      content: "The Citizen's Charter of Talibon outlines the services provided by the LGU and the standards for each service."
    };
  }
  getFullDisclosure() {
    return {
      title: "Full Disclosure Policy",
      content: "Compliance with the DILG Full Disclosure Policy, ensuring transparency in local governance."
    };
  }
  getInfrastructure() {
    return [
      { id: 1, title: "Construction of New Health Center", status: "Ongoing", budget: "5M" },
      { id: 2, title: "Road Concreting - Brgy. San Jose", status: "Completed", budget: "2M" }
    ];
  }
  getFinanceReports() {
    return [
      { id: 1, title: "Quarterly Financial Report - Q1 2024", url: "#" }
    ];
  }
  getExecutiveOrders() {
    return [
      { id: 1, title: "EO No. 1 - Reorganization of LGU Committees", date: "2024-01-05" }
    ];
  }
  getBudget() {
    return {
      title: "Budget and Finances",
      annualBudget: "TO BE POSTED",
      status: "TO BE POSTED",
      breakdown: [],
      message: "The approved annual budget, appropriation ordinances, and financial allocations for the current fiscal year are currently being finalized and will be posted upon official certification from the Municipal Budget Office and the Sangguniang Bayan."
    };
  }
  getBayanihanGrant() {
    return {
      title: "Bayanihan Grant",
      content: "Reports on the utilization of the Bayanihan Grant for COVID-19 response."
    };
  }
  getBiddings() {
    return [
      { id: 1, title: "Invitation to Bid: Office Supplies", deadline: "2024-04-10" }
    ];
  }
  getOrdinances() {
    return [
      { id: 1, title: "Tax Incentive Ordinance", year: 2024 }
    ];
  }
  getSroi() {
    return {
      title: "Social Return on Investment",
      content: "Measuring the social impact of LGU programs and projects."
    };
  }
};
TransparencyService = __decorateClass([
  Injectable5()
], TransparencyService);

// src/server/api/transparency/transparency.controller.ts
var TransparencyController = class {
  constructor(transparencyService) {
    this.transparencyService = transparencyService;
  }
  getCitizenCharter() {
    return this.transparencyService.getCitizenCharter();
  }
  getFullDisclosure() {
    return this.transparencyService.getFullDisclosure();
  }
  getInfrastructure() {
    return this.transparencyService.getInfrastructure();
  }
  getFinanceReports() {
    return this.transparencyService.getFinanceReports();
  }
  getExecutiveOrders() {
    return this.transparencyService.getExecutiveOrders();
  }
  getBudget() {
    return this.transparencyService.getBudget();
  }
  getBayanihanGrant() {
    return this.transparencyService.getBayanihanGrant();
  }
  getBiddings() {
    return this.transparencyService.getBiddings();
  }
  getOrdinances() {
    return this.transparencyService.getOrdinances();
  }
  getSroi() {
    return this.transparencyService.getSroi();
  }
};
__decorateClass([
  Get5("citizen-charter")
], TransparencyController.prototype, "getCitizenCharter", 1);
__decorateClass([
  Get5("full-disclosure")
], TransparencyController.prototype, "getFullDisclosure", 1);
__decorateClass([
  Get5("infrastructure")
], TransparencyController.prototype, "getInfrastructure", 1);
__decorateClass([
  Get5("finance-reports")
], TransparencyController.prototype, "getFinanceReports", 1);
__decorateClass([
  Get5("executive-orders")
], TransparencyController.prototype, "getExecutiveOrders", 1);
__decorateClass([
  Get5("budget")
], TransparencyController.prototype, "getBudget", 1);
__decorateClass([
  Get5("bayanihan-grant")
], TransparencyController.prototype, "getBayanihanGrant", 1);
__decorateClass([
  Get5("biddings")
], TransparencyController.prototype, "getBiddings", 1);
__decorateClass([
  Get5("ordinances")
], TransparencyController.prototype, "getOrdinances", 1);
__decorateClass([
  Get5("sroi")
], TransparencyController.prototype, "getSroi", 1);
TransparencyController = __decorateClass([
  Controller5("api/transparency"),
  __decorateParam(0, Inject5(TransparencyService))
], TransparencyController);

// src/server/api/tourism/tourism.controller.ts
import { Controller as Controller6, Get as Get6, Inject as Inject6 } from "@nestjs/common";

// src/server/api/tourism/tourism.service.ts
import { Injectable as Injectable6 } from "@nestjs/common";
var TourismService = class {
  getSpots() {
    return [
      { id: 1, name: "Talibon Cathedral", description: "The seat of the Diocese of Talibon.", image: "https://picsum.photos/seed/cathedral/800/600" },
      { id: 2, name: "Bongan Sandbar", description: "A beautiful sandbar perfect for swimming and relaxation.", image: "https://picsum.photos/seed/sandbar/800/600" }
    ];
  }
  getFestivities() {
    return [
      { id: 1, name: "Talibon Strings of Fiesta", date: "May" },
      { id: 2, name: "Foundation Day and Town Fiesta", date: "April 22" },
      { id: 3, name: "Abundayon Festival", date: "May" }
    ];
  }
  getDelicacies() {
    return [
      { id: 1, name: "Tatak Talibon Products", description: "Local products made in Talibon." },
      { id: 2, name: "Fresh Seafood", description: "The best seafood in Bohol." }
    ];
  }
};
TourismService = __decorateClass([
  Injectable6()
], TourismService);

// src/server/api/tourism/tourism.controller.ts
var TourismController = class {
  constructor(tourismService) {
    this.tourismService = tourismService;
  }
  getSpots() {
    return this.tourismService.getSpots();
  }
  getFestivities() {
    return this.tourismService.getFestivities();
  }
  getDelicacies() {
    return this.tourismService.getDelicacies();
  }
};
__decorateClass([
  Get6("spots")
], TourismController.prototype, "getSpots", 1);
__decorateClass([
  Get6("festivities")
], TourismController.prototype, "getFestivities", 1);
__decorateClass([
  Get6("delicacies")
], TourismController.prototype, "getDelicacies", 1);
TourismController = __decorateClass([
  Controller6("api/tourism"),
  __decorateParam(0, Inject6(TourismService))
], TourismController);

// src/server/api/forms/forms.controller.ts
import {
  Controller as Controller7,
  Get as Get7,
  Post,
  Put,
  Body,
  Param,
  Inject as Inject11,
  BadRequestException as BadRequestException2
} from "@nestjs/common";

// src/server/api/forms/forms.service.ts
import { Injectable as Injectable9, BadRequestException, Inject as Inject8 } from "@nestjs/common";

// src/server/supabase.service.ts
import { Injectable as Injectable7, InternalServerErrorException } from "@nestjs/common";
import { createClient as createClient2 } from "@supabase/supabase-js";
var SupabaseService = class {
  constructor() {
    this.supabase = null;
    let rawUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const hasUrl = !!rawUrl && rawUrl.length > 5;
    const hasServiceRoleKey = !!supabaseKey && supabaseKey.length > 5;
    console.log(
      `[SUPABASE_SERVER] Initialization check: SUPABASE_URL: ${hasUrl ? "PRESENT" : "MISSING"}, SUPABASE_SERVICE_ROLE_KEY: ${hasServiceRoleKey ? "PRESENT" : "MISSING"}`
    );
    if (!rawUrl || !supabaseKey) {
      console.warn("[SUPABASE_SERVER] Warning: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Backend services requiring Supabase will fail.");
      return;
    }
    const sanitizeUrl = (url) => {
      let trimmed = url.trim();
      while (trimmed.endsWith("/")) {
        trimmed = trimmed.slice(0, -1);
      }
      if (trimmed.endsWith("/rest/v1")) {
        trimmed = trimmed.slice(0, -8);
      }
      while (trimmed.endsWith("/")) {
        trimmed = trimmed.slice(0, -1);
      }
      return trimmed;
    };
    const supabaseUrl = sanitizeUrl(rawUrl);
    try {
      this.supabase = createClient2(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    } catch (error) {
      console.error("[Supabase Server] Initialization error:", error);
    }
  }
  getClient() {
    if (!this.supabase) {
      throw new InternalServerErrorException(
        "Supabase server-side configuration is incomplete. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment variables."
      );
    }
    return this.supabase;
  }
};
SupabaseService = __decorateClass([
  Injectable7()
], SupabaseService);

// src/server/api/notifications/email-notification.service.ts
import { Injectable as Injectable8, Inject as Inject7, Logger } from "@nestjs/common";

// src/server/api/notifications/providers/resend-email.provider.ts
import axios from "axios";
var ResendEmailProvider = class {
  constructor() {
    this.name = "Resend";
    this.apiKey = (process.env.RESEND_API_KEY || "").trim();
    this.defaultFrom = (process.env.EMAIL_FROM_ADDRESS || "onboarding@resend.dev").trim();
    this.defaultFromName = (process.env.EMAIL_FROM_NAME || "Digital Talibon").trim();
    const hasKey = !!this.apiKey && this.apiKey.length > 5;
    console.log(
      `[EMAIL_PROVIDER] Resend Provider initialized. RESEND_API_KEY: ${hasKey ? "PRESENT" : "MISSING"}, EMAIL_FROM_ADDRESS: ${this.defaultFrom ? "PRESENT" : "MISSING"} (${this.defaultFrom}), EMAIL_FROM_NAME: ${this.defaultFromName ? "PRESENT" : "MISSING"}`
    );
  }
  isConfigured() {
    return !!this.apiKey && this.apiKey.length > 5;
  }
  /**
   * Helper to mask email address in logs
   */
  maskEmail(email) {
    if (!email || !email.includes("@")) return "invalid-email";
    const [user, domain] = email.split("@");
    if (user.length <= 2) return `${user[0]}*@${domain}`;
    return `${user[0]}${"*".repeat(Math.max(1, user.length - 2))}${user[user.length - 1]}@${domain}`;
  }
  async sendEmail(options) {
    if (!this.isConfigured()) {
      console.warn("[EMAIL_PROVIDER] Send aborted: RESEND_API_KEY is MISSING in environment variables.");
      return {
        success: false,
        error: "RESEND_API_KEY is not configured in server environment variables."
      };
    }
    const fromAddress = options.from || this.defaultFrom;
    const fromName = options.fromName || this.defaultFromName;
    const formattedFrom = `${fromName} <${fromAddress}>`;
    const maskedTo = this.maskEmail(options.to);
    console.log(`[EMAIL_PROVIDER] Dispatching via Resend API -> To: ${maskedTo}, From: ${formattedFrom}, Subject: "${options.subject}"`);
    const payload = {
      from: formattedFrom,
      to: [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text
    };
    if (options.replyTo) {
      payload.reply_to = options.replyTo;
    }
    if (options.tags) {
      payload.tags = Object.entries(options.tags).map(([name, value]) => ({ name, value }));
    }
    try {
      const response = await axios.post("https://api.resend.com/emails", payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 1e4
      });
      if (response.status >= 200 && response.status < 300 && response.data?.id) {
        const messageId = response.data.id;
        console.log(`[EMAIL_PROVIDER] Resend delivery SUCCESS. Message ID: ${messageId}, Status Code: ${response.status}`);
        return {
          success: true,
          messageId
        };
      }
      console.warn(`[EMAIL_PROVIDER] Resend returned unexpected HTTP status ${response.status}:`, response.data);
      return {
        success: false,
        error: `Unexpected provider response status: ${response.status}`
      };
    } catch (err) {
      const status = err.response?.status;
      const responseData = err.response?.data;
      const resendErrorName = responseData?.name || "error";
      const resendErrorMessage = responseData?.message || err.message || "Unknown error";
      if (status === 401) {
        console.error(`[EMAIL_PROVIDER] Resend HTTP 401 Unauthorized: Invalid or revoked RESEND_API_KEY.`);
      } else if (status === 403 || status === 400 || status === 422) {
        const isSandboxError = resendErrorMessage.toLowerCase().includes("testing emails") || resendErrorMessage.toLowerCase().includes("verify a domain") || resendErrorMessage.toLowerCase().includes("domain");
        if (isSandboxError) {
          const domain = fromAddress.includes("@") ? fromAddress.split("@")[1] : "talibon.gov.ph";
          console.error(
            `[EMAIL_PROVIDER] Resend Domain/Sandbox Error: Cannot deliver to citizen (${maskedTo}). Sender address "${fromAddress}" requires domain verification in Resend. Action Required: Add and verify the domain "${domain}" at https://resend.com/domains (with SPF & DKIM DNS records). Provider message: "${resendErrorMessage}"`
          );
        } else {
          console.error(
            `[EMAIL_PROVIDER] Resend HTTP ${status} Error: ${resendErrorName} - ${resendErrorMessage}`
          );
        }
      } else if (status === 429) {
        console.error(`[EMAIL_PROVIDER] Resend HTTP 429 Rate Limit Exceeded: ${resendErrorMessage}`);
      } else if (status >= 500) {
        console.error(`[EMAIL_PROVIDER] Resend HTTP ${status} Provider Server Error: ${resendErrorMessage}`);
      } else {
        console.error(`[EMAIL_PROVIDER] Resend Network/Connection Error: ${err.message}`);
      }
      return {
        success: false,
        error: `[${resendErrorName}] ${resendErrorMessage}`
      };
    }
  }
};

// src/server/api/notifications/providers/console-email.provider.ts
var ConsoleEmailProvider = class {
  constructor() {
    this.name = "Console (Development Simulator)";
  }
  isConfigured() {
    return true;
  }
  async sendEmail(options) {
    const maskedTo = options.to.replace(/^(.)(.*)(@.*)$/, (_, first, middle, domain) => {
      return `${first}${"*".repeat(Math.max(1, middle.length))}${domain}`;
    });
    console.log(`[EmailNotification:Simulated] Destination: ${maskedTo}`);
    console.log(`[EmailNotification:Simulated] Subject: ${options.subject}`);
    console.log(`[EmailNotification:Simulated] From: ${options.fromName || "Municipality of Talibon"} <${options.from || "notifications@talibon.gov.ph"}>`);
    return {
      success: true,
      messageId: `sim-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    };
  }
};

// src/server/api/notifications/email-templates.ts
function escapeHtml(unsafe) {
  if (!unsafe) return "";
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function formatPhDate(dateStr) {
  try {
    const d = dateStr ? new Date(dateStr) : /* @__PURE__ */ new Date();
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  } catch {
    return dateStr || (/* @__PURE__ */ new Date()).toISOString();
  }
}
function wrapLayout(content, preheader) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Municipality of Talibon - Service Notification</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 32px 12px;
    }
    .main-container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: #0f172a;
      padding: 28px 24px;
      text-align: center;
    }
    .header-logo-text {
      color: #ffffff;
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin: 0;
    }
    .header-subtext {
      color: #94a3b8;
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .content {
      padding: 32px 28px;
    }
    .badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .ticket-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 20px;
      margin: 20px 0;
    }
    .ticket-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #64748b;
      font-weight: 700;
      margin: 0;
    }
    .ticket-val {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      font-family: 'Courier New', Courier, monospace;
      margin-top: 4px;
    }
    .info-row {
      display: table;
      width: 100%;
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .info-label {
      display: table-cell;
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
      width: 38%;
      vertical-align: top;
    }
    .info-value {
      display: table-cell;
      font-size: 12px;
      color: #0f172a;
      font-weight: 700;
      vertical-align: top;
    }
    .remarks-box {
      background-color: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 10px;
      padding: 16px;
      margin: 20px 0;
    }
    .requirements-box {
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      padding: 16px;
      margin: 20px 0;
    }
    .action-btn {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 13px;
      font-weight: 700;
      padding: 14px 28px;
      border-radius: 10px;
      text-align: center;
      margin-top: 24px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 24px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #64748b;
      line-height: 1.6;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 24px 18px !important;
      }
      .main-container {
        border-radius: 8px !important;
      }
    }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${escapeHtml(preheader)}
  </div>
  <table role="presentation" class="wrapper" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center">
        <table role="presentation" class="main-container" cellspacing="0" cellpadding="0" border="0" width="100%">
          <!-- Header -->
          <tr>
            <td class="header">
              <h1 class="header-logo-text">Republic of the Philippines</h1>
              <div class="header-subtext">Municipality of Talibon \u2022 Province of Bohol</div>
              <div style="margin-top: 8px; color: #38bdf8; font-size: 12px; font-weight: 700; letter-spacing: 0.05em;">DIGITAL TALIBON CORE (V4)</div>
            </td>
          </tr>
          <!-- Main Content -->
          <tr>
            <td class="content">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td class="footer">
              <p style="margin: 0 0 6px 0; font-weight: 700; color: #334155;">Municipality of Talibon \u2014 Official E-Governance Portal</p>
              <p style="margin: 0 0 10px 0;">Municipal Hall, Poblacion, Talibon, Bohol, Philippines 6325</p>
              <p style="margin: 0 0 6px 0;">For inquiries or assistance, email us at <a href="mailto:talibonofficial@gmail.com">talibonofficial@gmail.com</a></p>
              <p style="margin: 12px 0 0 0; font-size: 10px; color: #94a3b8;">This is an automated administrative notification from the Municipality of Talibon Digital Core. Please do not reply directly to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
function generateEmailForEvent(eventType, data) {
  const safeName = escapeHtml(data.citizenName || "Citizen");
  const safeDoc = escapeHtml(data.documentType || "Certificate Request");
  const safeTicket = escapeHtml(data.ticketId);
  const safeRemarks = escapeHtml(data.remarks || "");
  const formattedDate = formatPhDate(data.updatedAt || data.submittedAt);
  const trackUrl = data.trackingUrl;
  const upper = (eventType || data.status || "").toUpperCase();
  if (upper === "SUBMITTED" || upper === "REQUEST_RECEIVED") {
    const subject2 = `[Received] Your ${data.documentType} Request has been logged (${data.ticketId})`;
    const preheader2 = `Your application for ${data.documentType} was received by the Municipality of Talibon. Ticket: ${data.ticketId}`;
    const bodyHtml2 = `
      <div style="margin-bottom: 20px;">
        <span class="badge" style="background-color: #e0f2fe; color: #0369a1;">Application Submitted</span>
      </div>
      <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Magandang Araw, ${safeName}!</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        We have successfully received and registered your online application for <strong>${safeDoc}</strong> in the Talibon Digital Governance Core.
      </p>

      <div class="ticket-card">
        <p class="ticket-label">Tracking Number / Ticket ID</p>
        <div class="ticket-val">${safeTicket}</div>
      </div>

      <div style="margin: 20px 0;">
        <div class="info-row">
          <div class="info-label">Service Type</div>
          <div class="info-value">${safeDoc}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Barangay</div>
          <div class="info-value">${escapeHtml(data.barangay || "Poblacion")}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Date Submitted</div>
          <div class="info-value">${formattedDate}</div>
        </div>
        <div class="info-row" style="border-bottom: none;">
          <div class="info-label">Current Status</div>
          <div class="info-value" style="color: #0284c7;">Submitted / In Queue</div>
        </div>
      </div>

      <p style="font-size: 13px; line-height: 1.6; color: #475569;">
        Our municipal intake officers will verify your details and route your application to the responsible department. You can monitor progress anytime using your tracking ticket.
      </p>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${escapeHtml(trackUrl)}" class="action-btn">Track Application Online</a>
      </div>
    `;
    const bodyText2 = `MUNICIPALITY OF TALIBON - SERVICE NOTIFICATION
===============================================
Application Submitted: ${data.documentType}
Tracking Ticket: ${data.ticketId}

Hello ${data.citizenName},

We have received and registered your online application for ${data.documentType}.

Ticket ID: ${data.ticketId}
Service Type: ${data.documentType}
Date: ${formattedDate}
Status: Submitted / In Queue

Track your request online:
${trackUrl}

Municipality of Talibon, Bohol`;
    return { subject: subject2, html: wrapLayout(bodyHtml2, preheader2), text: bodyText2 };
  }
  if (upper === "ASSIGNED" || upper === "ROUTED") {
    const dept = data.officeResponsible || "Responsible Municipal Department";
    const subject2 = `[Assigned] Your ${data.documentType} request has been routed (${data.ticketId})`;
    const preheader2 = `Your request is assigned to ${dept} for administrative processing.`;
    const bodyHtml2 = `
      <div style="margin-bottom: 20px;">
        <span class="badge" style="background-color: #f3e8ff; color: #7e22ce;">Assigned to Office</span>
      </div>
      <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Request Routed for Review</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        Dear <strong>${safeName}</strong>, your application for <strong>${safeDoc}</strong> has been routed to <strong>${escapeHtml(dept)}</strong>.
      </p>

      <div class="ticket-card">
        <p class="ticket-label">Tracking Number</p>
        <div class="ticket-val">${safeTicket}</div>
      </div>

      ${safeRemarks ? `
      <div class="remarks-box">
        <strong style="font-size: 11px; text-transform: uppercase; color: #92400e; display: block; margin-bottom: 4px;">Staff Routing Remarks:</strong>
        <span style="font-size: 13px; color: #78350f;">${safeRemarks}</span>
      </div>` : ""}

      <div style="text-align: center; margin-top: 24px;">
        <a href="${escapeHtml(trackUrl)}" class="action-btn">View Workflow Status</a>
      </div>
    `;
    const bodyText2 = `MUNICIPALITY OF TALIBON
Request Routed: ${data.documentType} (${data.ticketId})
Assigned Office: ${dept}
${data.remarks ? `Remarks: ${data.remarks}
` : ""}
Track: ${trackUrl}`;
    return { subject: subject2, html: wrapLayout(bodyHtml2, preheader2), text: bodyText2 };
  }
  if (upper === "PROCESSING" || upper === "UNDER REVIEW" || upper === "UNDER_REVIEW") {
    const subject2 = `[Under Review] Application Verification in Progress (${data.ticketId})`;
    const preheader2 = `Your application for ${data.documentType} is currently undergoing evaluation.`;
    const bodyHtml2 = `
      <div style="margin-bottom: 20px;">
        <span class="badge" style="background-color: #fef3c7; color: #b45309;">Under Review</span>
      </div>
      <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Evaluation In Progress</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        Dear <strong>${safeName}</strong>, our municipal evaluators are actively validating your submission for <strong>${safeDoc}</strong>.
      </p>

      <div class="ticket-card">
        <p class="ticket-label">Tracking Number</p>
        <div class="ticket-val">${safeTicket}</div>
      </div>

      ${safeRemarks ? `
      <div class="remarks-box">
        <strong style="font-size: 11px; text-transform: uppercase; color: #92400e; display: block; margin-bottom: 4px;">Evaluation Notes:</strong>
        <span style="font-size: 13px; color: #78350f;">${safeRemarks}</span>
      </div>` : ""}

      <p style="font-size: 13px; line-height: 1.6; color: #475569;">
        No additional action is required from you at this time. We will notify you immediately once the evaluation is finalized.
      </p>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${escapeHtml(trackUrl)}" class="action-btn">Track Request</a>
      </div>
    `;
    const bodyText2 = `MUNICIPALITY OF TALIBON
Under Review: ${data.documentType} (${data.ticketId})
Your application is currently being evaluated.
${data.remarks ? `Notes: ${data.remarks}
` : ""}
Track: ${trackUrl}`;
    return { subject: subject2, html: wrapLayout(bodyHtml2, preheader2), text: bodyText2 };
  }
  if (upper === "RETURNED" || upper === "ADDITIONAL REQUIREMENTS NEEDED" || upper === "ADDITIONAL_REQUIREMENTS") {
    const subject2 = `[Action Required] Additional Documents Needed for ${data.documentType} (${data.ticketId})`;
    const preheader2 = `Action required: Please provide additional requirements or updated files for ticket ${data.ticketId}.`;
    const reqsListHtml = data.requirements && data.requirements.length > 0 ? `<ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px; color: #1e3a8a; line-height: 1.6;">
          ${data.requirements.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}
         </ul>` : `<p style="margin: 6px 0 0 0; font-size: 13px; color: #1e3a8a;">Please review the evaluator remarks below or bring a valid government-issued ID and photocopy.</p>`;
    const bodyHtml2 = `
      <div style="margin-bottom: 20px;">
        <span class="badge" style="background-color: #fee2e2; color: #b91c1c;">Action Required</span>
      </div>
      <h2 style="font-size: 20px; font-weight: 800; color: #991b1b; margin: 0 0 12px 0;">Additional Requirements Needed</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        Dear <strong>${safeName}</strong>, our staff reviewed your application for <strong>${safeDoc}</strong> and determined that additional documents or clearer submissions are needed to continue processing.
      </p>

      <div class="ticket-card">
        <p class="ticket-label">Tracking Number</p>
        <div class="ticket-val">${safeTicket}</div>
      </div>

      ${safeRemarks ? `
      <div class="remarks-box" style="background-color: #fff1f2; border-color: #fecdd3;">
        <strong style="font-size: 11px; text-transform: uppercase; color: #9f1239; display: block; margin-bottom: 4px;">Staff Specific Remarks:</strong>
        <span style="font-size: 13px; color: #881337; font-weight: 600;">${safeRemarks}</span>
      </div>` : ""}

      <div class="requirements-box">
        <strong style="font-size: 11px; text-transform: uppercase; color: #1e40af; display: block; margin-bottom: 4px;">Official Service Requirements Checklist:</strong>
        ${reqsListHtml}
      </div>

      <p style="font-size: 13px; line-height: 1.6; color: #475569;">
        Please open your tracking link below to review requirements and upload the requested documentation to expedite your approval.
      </p>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${escapeHtml(trackUrl)}" class="action-btn" style="background-color: #dc2626;">Submit Required Documents</a>
      </div>
    `;
    const reqsText = data.requirements && data.requirements.length > 0 ? `Requirements:
` + data.requirements.map((r) => `\u2022 ${r}`).join("\n") : `Please bring or submit valid identification and supporting documents.`;
    const bodyText2 = `MUNICIPALITY OF TALIBON - ACTION REQUIRED
===============================================
Additional Requirements for ${data.documentType}
Ticket: ${data.ticketId}

Hello ${data.citizenName},

Additional information or documents are needed for your request.

${data.remarks ? `Staff Remarks: "${data.remarks}"
` : ""}
${reqsText}

Please update your application online:
${trackUrl}`;
    return { subject: subject2, html: wrapLayout(bodyHtml2, preheader2), text: bodyText2 };
  }
  if (upper === "APPROVED") {
    const subject2 = `[Approved] Your ${data.documentType} Request has been Approved (${data.ticketId})`;
    const preheader2 = `Good news! Your request for ${data.documentType} has been approved by the municipal registrar.`;
    const bodyHtml2 = `
      <div style="margin-bottom: 20px;">
        <span class="badge" style="background-color: #dcfce7; color: #15803d;">Application Approved</span>
      </div>
      <h2 style="font-size: 20px; font-weight: 800; color: #166534; margin: 0 0 12px 0;">Application Approved!</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        Dear <strong>${safeName}</strong>, we are pleased to inform you that your application for <strong>${safeDoc}</strong> has been officially approved.
      </p>

      <div class="ticket-card">
        <p class="ticket-label">Tracking Number</p>
        <div class="ticket-val">${safeTicket}</div>
      </div>

      ${safeRemarks ? `
      <div class="remarks-box">
        <strong style="font-size: 11px; text-transform: uppercase; color: #92400e; display: block; margin-bottom: 4px;">Approval Notes:</strong>
        <span style="font-size: 13px; color: #78350f;">${safeRemarks}</span>
      </div>` : ""}

      <p style="font-size: 13px; line-height: 1.6; color: #475569;">
        The office is currently generating your certificate. You will receive another notification as soon as it is sealed and ready for collection.
      </p>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${escapeHtml(trackUrl)}" class="action-btn" style="background-color: #16a34a;">View Status Online</a>
      </div>
    `;
    const bodyText2 = `MUNICIPALITY OF TALIBON
Approved: ${data.documentType} (${data.ticketId})

Hello ${data.citizenName},
Your application has been approved by the Municipality of Talibon.
${data.remarks ? `Notes: ${data.remarks}
` : ""}
Track: ${trackUrl}`;
    return { subject: subject2, html: wrapLayout(bodyHtml2, preheader2), text: bodyText2 };
  }
  if (upper === "PREPARING" || upper === "PREPARING DOCUMENT" || upper === "PREPARING_DOCUMENT") {
    const subject2 = `[Printing] Your ${data.documentType} is being prepared (${data.ticketId})`;
    const preheader2 = `Your official document is currently being printed, sealed, and signed.`;
    const bodyHtml2 = `
      <div style="margin-bottom: 20px;">
        <span class="badge" style="background-color: #e0e7ff; color: #4338ca;">Document Preparation</span>
      </div>
      <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Printing & Sealing in Progress</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        Dear <strong>${safeName}</strong>, your <strong>${safeDoc}</strong> is currently being prepared, dry-sealed, and signed by authorized municipal officials.
      </p>

      <div class="ticket-card">
        <p class="ticket-label">Tracking Number</p>
        <div class="ticket-val">${safeTicket}</div>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${escapeHtml(trackUrl)}" class="action-btn">Track Ready Status</a>
      </div>
    `;
    const bodyText2 = `MUNICIPALITY OF TALIBON
Document Preparation: ${data.documentType} (${data.ticketId})
Your document is currently being prepared and signed.
Track: ${trackUrl}`;
    return { subject: subject2, html: wrapLayout(bodyHtml2, preheader2), text: bodyText2 };
  }
  if (upper === "READY" || upper === "READY FOR CLAIM" || upper === "READY_FOR_CLAIM") {
    const subject2 = `[Ready for Pickup] Your ${data.documentType} is ready for collection (${data.ticketId})`;
    const preheader2 = `Your document is ready for collection at the Talibon Municipal Treasury Office.`;
    const bodyHtml2 = `
      <div style="margin-bottom: 20px;">
        <span class="badge" style="background-color: #dbeafe; color: #1d4ed8;">Ready for Collection</span>
      </div>
      <h2 style="font-size: 20px; font-weight: 800; color: #1e40af; margin: 0 0 12px 0;">Ready for Physical Collection</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        Dear <strong>${safeName}</strong>, your official document for <strong>${safeDoc}</strong> has been finalized and is now ready for claim.
      </p>

      <div class="ticket-card">
        <p class="ticket-label">Tracking Number (Present at Counter)</p>
        <div class="ticket-val">${safeTicket}</div>
      </div>

      <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <strong style="font-size: 11px; text-transform: uppercase; color: #0f172a; display: block; margin-bottom: 8px; letter-spacing: 0.05em;">Collection Guidelines & Location:</strong>
        <div class="info-row">
          <div class="info-label">Pick-up Location</div>
          <div class="info-value">Municipal Treasury Office, Talibon Town Hall</div>
        </div>
        <div class="info-row">
          <div class="info-label">Office Hours</div>
          <div class="info-value">Monday to Friday \u2022 8:00 AM \u2013 5:00 PM</div>
        </div>
        <div class="info-row" style="border-bottom: none;">
          <div class="info-label">What to Bring</div>
          <div class="info-value">
            \u2022 Tracking Number: <code>${safeTicket}</code><br>
            \u2022 Valid Government-issued ID<br>
            \u2022 Applicable fee receipt / authorization letter (if claiming on behalf)
          </div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${escapeHtml(trackUrl)}" class="action-btn" style="background-color: #1d4ed8;">View Collection Pass</a>
      </div>
    `;
    const bodyText2 = `MUNICIPALITY OF TALIBON - READY FOR PICKUP
===============================================
Document Ready: ${data.documentType}
Ticket: ${data.ticketId}

Hello ${data.citizenName},

Your requested document is ready for collection at the Municipal Treasury Office.

Location: Municipal Hall, Poblacion, Talibon, Bohol
Hours: Mon-Fri 8:00 AM - 5:00 PM
What to bring:
- Tracking Number: ${data.ticketId}
- Valid Government ID
- Applicable fee receipt

Track online: ${trackUrl}`;
    return { subject: subject2, html: wrapLayout(bodyHtml2, preheader2), text: bodyText2 };
  }
  if (upper === "CLAIMED" || upper === "COMPLETED" || upper === "CLAIMED / COMPLETED") {
    const subject2 = `[Completed] Transaction Completed for ${data.documentType} (${data.ticketId})`;
    const preheader2 = `Your transaction for ${data.documentType} has been successfully completed. Thank you!`;
    const bodyHtml2 = `
      <div style="margin-bottom: 20px;">
        <span class="badge" style="background-color: #f1f5f9; color: #334155;">Transaction Completed</span>
      </div>
      <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Salamat, Talibonanon!</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        Dear <strong>${safeName}</strong>, your document for <strong>${safeDoc}</strong> (Ticket: <strong>${safeTicket}</strong>) was successfully claimed and this service ticket is now closed.
      </p>

      <div class="ticket-card">
        <p class="ticket-label">Closed Ticket</p>
        <div class="ticket-val">${safeTicket}</div>
      </div>

      <p style="font-size: 13px; line-height: 1.6; color: #475569;">
        Thank you for transacting through Digital Talibon Core. We are dedicated to providing fast, transparent, and accessible public service.
      </p>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${escapeHtml(trackUrl)}" class="action-btn" style="background-color: #334155;">View Transaction Summary</a>
      </div>
    `;
    const bodyText2 = `MUNICIPALITY OF TALIBON
Transaction Completed: ${data.documentType} (${data.ticketId})

Hello ${data.citizenName},
Your document has been claimed and your ticket is closed.
Thank you for using Digital Talibon!`;
    return { subject: subject2, html: wrapLayout(bodyHtml2, preheader2), text: bodyText2 };
  }
  if (upper === "REJECTED") {
    const subject2 = `[Update] Regarding your ${data.documentType} Application (${data.ticketId})`;
    const preheader2 = `Important notice regarding your application for ${data.documentType}.`;
    const bodyHtml2 = `
      <div style="margin-bottom: 20px;">
        <span class="badge" style="background-color: #fee2e2; color: #b91c1c;">Application Declined</span>
      </div>
      <h2 style="font-size: 20px; font-weight: 800; color: #991b1b; margin: 0 0 12px 0;">Application Status Notice</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        Dear <strong>${safeName}</strong>, we regret to inform you that your application for <strong>${safeDoc}</strong> could not be approved at this time.
      </p>

      <div class="ticket-card">
        <p class="ticket-label">Tracking Number</p>
        <div class="ticket-val">${safeTicket}</div>
      </div>

      <div class="remarks-box" style="background-color: #fff1f2; border-color: #fecdd3;">
        <strong style="font-size: 11px; text-transform: uppercase; color: #9f1239; display: block; margin-bottom: 4px;">Reason for Disapproval:</strong>
        <span style="font-size: 13px; color: #881337; font-weight: 600;">${safeRemarks || "Incomplete requirements or verification failure."}</span>
      </div>

      <p style="font-size: 13px; line-height: 1.6; color: #475569;">
        You may submit a new application with complete and verified documentation, or visit our municipal helpdesk for personal assistance.
      </p>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${escapeHtml(trackUrl)}" class="action-btn" style="background-color: #475569;">View Full Details</a>
      </div>
    `;
    const bodyText2 = `MUNICIPALITY OF TALIBON
Application Notice: ${data.documentType} (${data.ticketId})

Hello ${data.citizenName},
Your application could not be approved at this time.
Reason: ${data.remarks || "Incomplete requirements or verification failure."}

Details: ${trackUrl}`;
    return { subject: subject2, html: wrapLayout(bodyHtml2, preheader2), text: bodyText2 };
  }
  if (upper === "CANCELLED") {
    const subject2 = `[Cancelled] Service Request ${data.ticketId} Cancelled`;
    const preheader2 = `Your request for ${data.documentType} was cancelled.`;
    const bodyHtml2 = `
      <div style="margin-bottom: 20px;">
        <span class="badge" style="background-color: #f1f5f9; color: #64748b;">Request Cancelled</span>
      </div>
      <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Request Cancelled</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        Dear <strong>${safeName}</strong>, your service ticket for <strong>${safeDoc}</strong> has been cancelled.
      </p>
      <div class="ticket-card">
        <p class="ticket-label">Cancelled Ticket</p>
        <div class="ticket-val">${safeTicket}</div>
      </div>
      ${safeRemarks ? `
      <div class="remarks-box">
        <strong style="font-size: 11px; text-transform: uppercase; color: #92400e; display: block; margin-bottom: 4px;">Cancellation Reason:</strong>
        <span style="font-size: 13px; color: #78350f;">${safeRemarks}</span>
      </div>` : ""}
    `;
    const bodyText2 = `MUNICIPALITY OF TALIBON
Cancelled: ${data.documentType} (${data.ticketId})
${data.remarks ? `Reason: ${data.remarks}
` : ""}`;
    return { subject: subject2, html: wrapLayout(bodyHtml2, preheader2), text: bodyText2 };
  }
  const subject = `[Update] Status Changed for your ${data.documentType} (${data.ticketId})`;
  const preheader = `Your application status was updated to ${data.statusLabel || data.status}.`;
  const bodyHtml = `
    <div style="margin-bottom: 20px;">
      <span class="badge" style="background-color: #e2e8f0; color: #1e293b;">${escapeHtml(data.statusLabel || data.status)}</span>
    </div>
    <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Workflow Status Update</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
      Dear <strong>${safeName}</strong>, the status of your request for <strong>${safeDoc}</strong> is now <strong>${escapeHtml(data.statusLabel || data.status)}</strong>.
    </p>

    <div class="ticket-card">
      <p class="ticket-label">Tracking Number</p>
      <div class="ticket-val">${safeTicket}</div>
    </div>

    ${safeRemarks ? `
    <div class="remarks-box">
      <strong style="font-size: 11px; text-transform: uppercase; color: #92400e; display: block; margin-bottom: 4px;">Staff Remarks:</strong>
      <span style="font-size: 13px; color: #78350f;">${safeRemarks}</span>
    </div>` : ""}

    <div style="text-align: center; margin-top: 24px;">
      <a href="${escapeHtml(trackUrl)}" class="action-btn">Track Request</a>
    </div>
  `;
  const bodyText = `MUNICIPALITY OF TALIBON
Status Update: ${data.documentType} (${data.ticketId})
Status: ${data.statusLabel || data.status}
${data.remarks ? `Remarks: ${data.remarks}
` : ""}
Track: ${trackUrl}`;
  return { subject, html: wrapLayout(bodyHtml, preheader), text: bodyText };
}

// src/server/api/notifications/email-notification.service.ts
var EmailNotificationService = class {
  // Dedup / Idempotency tracker
  constructor(supabaseService) {
    this.supabaseService = supabaseService;
    this.logger = new Logger("EmailNotification");
    this.recentNotifications = /* @__PURE__ */ new Map();
    const resend = new ResendEmailProvider();
    if (resend.isConfigured()) {
      this.provider = resend;
      this.logger.log(`[EMAIL] Initialized with active provider: ${this.provider.name}`);
    } else {
      this.provider = new ConsoleEmailProvider();
      this.logger.log(`[EMAIL] No third-party email API key configured. Active provider: ${this.provider.name} (Console fallback)`);
    }
    setInterval(() => {
      const now = Date.now();
      for (const [key, time] of this.recentNotifications.entries()) {
        if (now - time > 15 * 60 * 1e3) {
          this.recentNotifications.delete(key);
        }
      }
    }, 10 * 60 * 1e3);
  }
  /**
   * Helper to mask email address in logs
   */
  maskEmail(email) {
    if (!email || !email.includes("@")) return "invalid-email";
    const [user, domain] = email.split("@");
    if (user.length <= 2) return `${user[0]}*@${domain}`;
    return `${user[0]}${"*".repeat(user.length - 2)}${user[user.length - 1]}@${domain}`;
  }
  /**
   * Validate standard email address format
   */
  isValidEmail(email) {
    if (!email) return false;
    const trimmed = email.trim();
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(trimmed);
  }
  /**
   * Fetch live municipal service requirements dynamically from public.municipal_services
   */
  async fetchServiceRequirements(documentType) {
    try {
      const client = this.supabaseService.getClient();
      if (!client || !documentType) return [];
      const docClean = documentType.toLowerCase().trim();
      const { data, error } = await client.from("municipal_services").select("name, requirements").is("deleted_at", null);
      if (!error && data && data.length > 0) {
        const match = data.find((s) => {
          const sName = (s.name || "").toLowerCase();
          return sName.includes(docClean) || docClean.includes(sName);
        });
        if (match && Array.isArray(match.requirements)) {
          return match.requirements;
        }
      }
    } catch (err) {
      this.logger.warn(`[EmailNotification] Could not fetch live service requirements: ${err?.message || err}`);
    }
    return [];
  }
  /**
   * Check idempotency to prevent duplicate notifications (re-renders, double-clicks, retries)
   */
  async isDuplicate(ticketId, eventType, status) {
    const dedupKey = `${ticketId.trim().toUpperCase()}:${eventType.toUpperCase()}:${status.toUpperCase()}`;
    const now = Date.now();
    const lastSentTime = this.recentNotifications.get(dedupKey);
    if (lastSentTime && now - lastSentTime < 5 * 60 * 1e3) {
      return true;
    }
    try {
      const client = this.supabaseService.getClient();
      if (client) {
        const tenMinutesAgo = new Date(now - 10 * 60 * 1e3).toISOString();
        const { data, error } = await client.from("notification_delivery_logs").select("id").eq("ticket_id", ticketId).eq("notification_type", eventType).eq("channel", "email").eq("status", "sent").gte("created_at", tenMinutesAgo).limit(1);
        if (!error && data && data.length > 0) {
          return true;
        }
      }
    } catch (dbErr) {
    }
    return false;
  }
  /**
   * Record notification result into database audit log (public.notification_delivery_logs)
   */
  async logDelivery(requestId, ticketId, recipient, notificationType, status, messageId, errorMessage) {
    try {
      const client = this.supabaseService.getClient();
      if (!client) return;
      const logPayload = {
        ticket_id: ticketId,
        channel: "email",
        recipient,
        notification_type: notificationType,
        status,
        provider_message_id: messageId || null,
        error_message: errorMessage || null
      };
      const isUuid = requestId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId);
      if (isUuid) {
        logPayload.request_id = requestId;
      }
      const { error } = await client.from("notification_delivery_logs").insert([logPayload]);
      if (error) {
        this.logger.warn(`[EmailNotification] notification_delivery_logs insert notice: ${error.message}`);
      }
    } catch (err) {
      this.logger.warn(`[EmailNotification] Could not log delivery record: ${err?.message || err}`);
    }
  }
  /**
   * Core dispatching pipeline with full validation, templating, error handling, and logging
   */
  async dispatchNotification(request, eventType, remarks, customRequirements) {
    const ticketId = (request.ticketId || "TLB-UNKNOWN").trim();
    const recipientEmail = (request.email || "").trim();
    const documentType = request.documentType || "Certificate Request";
    const status = request.status || eventType;
    if (!this.isValidEmail(recipientEmail)) {
      this.logger.warn(`[EMAIL] Skipped notification for Ticket ${ticketId}: Recipient email is ${recipientEmail ? "INVALID (" + this.maskEmail(recipientEmail) + ")" : "ABSENT/MISSING"}.`);
      await this.logDelivery(request.id, ticketId, recipientEmail || "NONE", eventType, "skipped", void 0, "Missing or invalid email address");
      return { success: false, skipped: true, status: "skipped", error: "Missing or invalid email address." };
    }
    this.logger.log(`[EMAIL] Recipient email PRESENT (${this.maskEmail(recipientEmail)}). Evaluating notification for Ticket: ${ticketId}`);
    const isDup = await this.isDuplicate(ticketId, eventType, status);
    if (isDup) {
      this.logger.log(`[EMAIL] Idempotent skip: Duplicate notification event "${eventType}" already sent recently for ${ticketId}.`);
      return { success: true, skipped: true, status: "skipped" };
    }
    let requirements = customRequirements || [];
    const isReqsEvent = ["RETURNED", "ADDITIONAL REQUIREMENTS NEEDED", "ADDITIONAL_REQUIREMENTS"].includes(eventType.toUpperCase()) || ["RETURNED", "ADDITIONAL REQUIREMENTS NEEDED", "ADDITIONAL_REQUIREMENTS"].includes(status.toUpperCase());
    if (isReqsEvent && requirements.length === 0) {
      requirements = await this.fetchServiceRequirements(documentType);
    }
    const appUrl = (process.env.APP_URL || process.env.VITE_APP_URL || "http://localhost:3000").replace(/\/$/, "");
    const trackingUrl = `${appUrl}/e-services?track=${encodeURIComponent(ticketId)}`;
    const templateData = {
      citizenName: request.fullName || "Citizen",
      ticketId,
      documentType,
      status,
      statusLabel: status,
      statusColor: "#2563eb",
      remarks,
      requirements,
      submittedAt: request.submittedAt,
      updatedAt: request.updatedAt || (/* @__PURE__ */ new Date()).toISOString(),
      trackingUrl,
      barangay: request.barangay
    };
    const { subject, html, text } = generateEmailForEvent(eventType, templateData);
    this.logger.log(`[EMAIL] Selected template event: "${eventType}" -> Subject: "${subject}"`);
    try {
      this.logger.log(`[EMAIL_PROVIDER] Invoking ${this.provider.name} provider for Ticket: ${ticketId}, Recipient: ${this.maskEmail(recipientEmail)}`);
      const sendResult = await this.provider.sendEmail({
        to: recipientEmail,
        subject,
        html,
        text,
        tags: {
          ticket_id: ticketId,
          event_type: eventType,
          app: "digital-talibon"
        }
      });
      if (sendResult.success) {
        const dedupKey = `${ticketId.toUpperCase()}:${eventType.toUpperCase()}:${status.toUpperCase()}`;
        this.recentNotifications.set(dedupKey, Date.now());
        this.logger.log(`[EMAIL] Delivery SUCCESS for ticket ${ticketId}. Message ID: ${sendResult.messageId || "ok"}`);
        await this.logDelivery(request.id, ticketId, recipientEmail, eventType, "sent", sendResult.messageId);
        return {
          success: true,
          messageId: sendResult.messageId,
          status: "sent"
        };
      } else {
        this.logger.warn(`[EMAIL] Delivery FAILED for ticket ${ticketId}. Provider error: ${sendResult.error}`);
        await this.logDelivery(request.id, ticketId, recipientEmail, eventType, "failed", void 0, sendResult.error);
        return {
          success: false,
          error: sendResult.error,
          status: "failed"
        };
      }
    } catch (err) {
      const errMsg = err?.message || "Internal email provider error";
      this.logger.error(`[EMAIL] Exception during email delivery for ${ticketId}: ${errMsg}`);
      await this.logDelivery(request.id, ticketId, recipientEmail, eventType, "failed", void 0, errMsg);
      return {
        success: false,
        error: errMsg,
        status: "failed"
      };
    }
  }
  // ==========================================
  // CONVENIENCE SERVICE METHODS
  // ==========================================
  /**
   * Event 1: Application Submitted
   */
  async sendRequestSubmitted(request) {
    return this.dispatchNotification(request, "SUBMITTED", "Application received and queued for review.");
  }
  /**
   * Event 2: Request Assigned / Routed to Department
   */
  async sendRequestAssigned(request, remarks) {
    return this.dispatchNotification(request, "ASSIGNED", remarks);
  }
  /**
   * Event 3: Request Under Review / Processing
   */
  async sendRequestUnderReview(request, remarks) {
    return this.dispatchNotification(request, "PROCESSING", remarks);
  }
  /**
   * Event 4: Additional Requirements Required
   */
  async sendAdditionalRequirements(request, remarks, requirements) {
    return this.dispatchNotification(request, "RETURNED", remarks, requirements);
  }
  /**
   * Event 5: Request Approved
   */
  async sendRequestApproved(request, remarks) {
    return this.dispatchNotification(request, "APPROVED", remarks);
  }
  /**
   * Event 6: Document Preparing
   */
  async sendPreparingDocument(request, remarks) {
    return this.dispatchNotification(request, "PREPARING", remarks);
  }
  /**
   * Event 7: Ready for Collection / Pickup
   */
  async sendReadyForClaim(request, remarks) {
    return this.dispatchNotification(request, "READY", remarks);
  }
  /**
   * Event 8: Transaction Completed
   */
  async sendRequestCompleted(request, remarks) {
    return this.dispatchNotification(request, "COMPLETED", remarks);
  }
  /**
   * Event 9: Request Rejected
   */
  async sendRequestRejected(request, remarks) {
    return this.dispatchNotification(request, "REJECTED", remarks);
  }
  /**
   * Event 10: Request Cancelled
   */
  async sendRequestCancelled(request, remarks) {
    return this.dispatchNotification(request, "CANCELLED", remarks);
  }
  /**
   * Generic Status Update
   */
  async sendStatusUpdate(request, status, remarks) {
    return this.dispatchNotification(request, status, remarks);
  }
};
EmailNotificationService = __decorateClass([
  Injectable8(),
  __decorateParam(0, Inject7(SupabaseService))
], EmailNotificationService);

// src/server/api/forms/forms.service.ts
var FormsService = class {
  constructor(supabaseService, emailNotificationService) {
    this.supabaseService = supabaseService;
    this.emailNotificationService = emailNotificationService;
    this.requests = [];
    this.loadFromSupabase();
  }
  async loadFromSupabase() {
    try {
      const client = this.supabaseService.getClient();
      if (client) {
        const { data, error } = await client.from("certificate_requests").select("*");
        if (!error && data && data.length > 0) {
          this.requests = data.map((item) => ({
            id: item.id,
            ticketId: item.ticket_id || item.ticketId,
            documentType: item.document_type || item.documentType,
            barangay: item.barangay_id || item.barangay || "Poblacion",
            fullName: item.full_name || item.fullName,
            email: item.email,
            mobileNumber: item.mobile_number || item.mobileNumber,
            purpose: item.purpose,
            attachments: item.attachments || [],
            submittedAt: item.submitted_at || item.submittedAt,
            status: item.status || "Submitted"
          }));
          console.log(`[FormsService] Successfully loaded ${this.requests.length} requests from Supabase.`);
        }
      }
    } catch (err) {
      console.log("[FormsService] Supabase not connected or table 'certificate_requests' does not exist yet. Using local in-memory storage.");
    }
  }
  async getAllRequests() {
    try {
      const client = this.supabaseService.getClient();
      if (client) {
        const { data, error } = await client.from("certificate_requests").select("*").order("submitted_at", { ascending: false });
        if (!error && data) {
          return data.map((item) => ({
            id: item.id,
            ticketId: item.ticket_id || item.ticketId,
            documentType: item.document_type || item.documentType,
            barangay: item.barangay_id || item.barangay || "Poblacion",
            fullName: item.full_name || item.fullName,
            email: item.email,
            mobileNumber: item.mobile_number || item.mobileNumber,
            purpose: item.purpose,
            attachments: item.attachments || [],
            submittedAt: item.submitted_at || item.submittedAt,
            status: item.status || "Submitted"
          }));
        }
      }
    } catch (err) {
      console.error("[FormsService] Failed to fetch all requests from Supabase, returning memory cached:", err);
    }
    return this.requests;
  }
  async updateRequestStatus(requestId, status, remarks, notifyCitizen = true, saveTimeline = true, notifyEmail = true, requirements) {
    try {
      const client = this.supabaseService.getClient();
      if (client) {
        let dbStatus = "Submitted";
        const upper = status.toUpperCase();
        if (upper === "SUBMITTED") {
          dbStatus = "Submitted";
        } else if (upper === "ASSIGNED TO DEPARTMENT" || upper === "ASSIGNED") {
          dbStatus = "Assigned";
        } else if (upper === "UNDER REVIEW" || upper === "PROCESSING") {
          dbStatus = "Processing";
        } else if (upper === "ADDITIONAL REQUIREMENTS NEEDED" || upper === "RETURNED" || upper === "RETURN") {
          dbStatus = "Returned";
        } else if (upper === "APPROVED") {
          dbStatus = "Approved";
        } else if (upper === "PREPARING DOCUMENT" || upper === "PREPARING") {
          dbStatus = "Approved";
        } else if (upper === "READY FOR CLAIM" || upper === "READY") {
          dbStatus = "Completed";
        } else if (upper === "CLAIMED / COMPLETED" || upper === "CLAIMED" || upper === "COMPLETED") {
          dbStatus = "Completed";
        } else if (upper === "REJECTED") {
          dbStatus = "Rejected";
        }
        console.log(`[FORMS_API] FormsService.updateRequestStatus started for ID: ${requestId}, Target DB Status: "${dbStatus}"`);
        const { data: currentReq, error: fetchError } = await client.from("certificate_requests").select("id, ticket_id, document_type, full_name, email, mobile_number, barangay_id, status").eq("id", requestId).maybeSingle();
        if (fetchError) {
          console.warn(`[FORMS_API] Warning fetching request ${requestId}:`, fetchError.message);
        }
        const currentDbStatus = currentReq?.status || "";
        console.log(`[FORMS_API] Current DB Status for ${requestId}: "${currentDbStatus}" -> Transitioning to "${dbStatus}"`);
        if (currentDbStatus === dbStatus) {
          if (saveTimeline) {
            try {
              await client.from("service_request_history").insert({
                request_id: requestId,
                status: dbStatus,
                remarks: remarks || `Status updated in portal: ${status}`
              });
              console.log(`[FORMS_API] Manual service_request_history inserted (status unchanged at "${dbStatus}")`);
            } catch (histErr) {
              console.warn("[FORMS_API] Failed to insert service_request_history:", histErr.message || histErr);
            }
          }
        } else {
          let updateSuccess = false;
          const now = (/* @__PURE__ */ new Date()).toISOString();
          try {
            const { error: srError } = await client.from("service_requests").update({ status: dbStatus, updated_at: now }).eq("id", requestId);
            if (!srError) {
              updateSuccess = true;
              console.log(`[FORMS_API] Database update SUCCESS via public.service_requests for ID: ${requestId}`);
            } else {
              const { error: crError } = await client.from("certificate_requests").update({ status: dbStatus }).eq("id", requestId);
              if (!crError) {
                updateSuccess = true;
                console.log(`[FORMS_API] Database update SUCCESS via public.certificate_requests for ID: ${requestId}`);
              }
            }
          } catch (updateErr) {
            console.warn("[FORMS_API] Direct table update exception:", updateErr);
          }
          if (updateSuccess) {
            if (saveTimeline) {
              try {
                await client.from("service_request_history").insert({
                  request_id: requestId,
                  status: dbStatus,
                  remarks: remarks || `Status updated via Admin Dashboard: ${status}`
                });
                console.log(`[FORMS_API] service_request_history entry created for ID: ${requestId}`);
              } catch (histErr) {
                console.warn("[FORMS_API] service_request_history insert warning:", histErr?.message || histErr);
              }
            }
          } else {
            try {
              await client.rpc("update_request_status", {
                p_request_id: requestId,
                p_status: dbStatus,
                p_remarks: remarks || `Status updated via Admin Dashboard: ${status}`
              });
              console.log(`[FORMS_API] Database update SUCCESS via RPC update_request_status for ID: ${requestId}`);
            } catch (rpcErr) {
              console.warn("[FORMS_API] RPC update_request_status failed:", rpcErr);
            }
          }
        }
        const found2 = this.requests.find((r) => r.id === requestId);
        if (found2) {
          found2.status = status;
        }
        if (notifyEmail) {
          if (currentReq?.email) {
            console.log(`[FORMS_API] Triggering EmailNotificationService for Ticket: ${currentReq.ticket_id || requestId}`);
            const reqDataForEmail = {
              id: currentReq.id || requestId,
              ticketId: currentReq.ticket_id || found2?.ticketId || "TLB-REQUEST",
              documentType: currentReq.document_type || found2?.documentType || "Certificate Request",
              fullName: currentReq.full_name || found2?.fullName || "Citizen",
              email: currentReq.email,
              mobileNumber: currentReq.mobile_number,
              barangay: currentReq.barangay_id,
              status
            };
            const isReqs = ["RETURNED", "ADDITIONAL REQUIREMENTS NEEDED", "ADDITIONAL_REQUIREMENTS"].includes(upper);
            if (isReqs) {
              this.emailNotificationService.sendAdditionalRequirements(reqDataForEmail, remarks, requirements).catch((e) => console.warn("[FORMS_API] Email notification error (additional reqs):", e));
            } else {
              this.emailNotificationService.sendStatusUpdate(reqDataForEmail, status, remarks).catch((e) => console.warn("[FORMS_API] Email notification error (status update):", e));
            }
          } else {
            console.log(`[FORMS_API] Email notification skipped: Citizen email is ABSENT for request ${requestId}`);
          }
        } else {
          console.log(`[FORMS_API] Email notification skipped: notifyEmail flag is set to false`);
        }
        if (notifyCitizen && currentReq) {
          const citizenEmail = currentReq.email;
          const ticketId = currentReq.ticket_id;
          const docType = currentReq.document_type;
          if (citizenEmail) {
            const { data: citizenProfile } = await client.from("profiles").select("id").eq("email", citizenEmail).maybeSingle();
            if (citizenProfile) {
              let notifTitle = `Status Update: ${status}`;
              let notifMsg = `Your application for ${docType} (Ticket: ${ticketId}) is now ${status}.`;
              if (upper === "SUBMITTED") {
                notifTitle = "\u2705 Application Submitted";
                notifMsg = `Your ${docType} application has been received successfully. We will notify you whenever your application progresses. [Ticket: ${ticketId}]`;
              } else if (upper === "ASSIGNED TO DEPARTMENT" || upper === "ASSIGNED") {
                notifTitle = "\u{1F4C2} Assigned to Department";
                notifMsg = `Your application has been assigned to: Municipal Engineering Office. Our staff has begun reviewing your request. [Ticket: ${ticketId}]`;
              } else if (upper === "UNDER REVIEW" || upper === "PROCESSING") {
                notifTitle = "\u{1F50D} Under Review";
                notifMsg = `Your application is currently being reviewed. No action is required at this time. [Ticket: ${ticketId}]`;
              } else if (upper === "ADDITIONAL REQUIREMENTS NEEDED" || upper === "RETURNED" || upper === "RETURN") {
                notifTitle = "\u26A0 Additional Requirements Required";
                notifMsg = `Please submit a clearer copy of your Valid ID. Remarks from Staff: "${remarks || "No remarks provided"}". Please return to your request and upload the required document. [Ticket: ${ticketId}]`;
              } else if (upper === "APPROVED") {
                notifTitle = "\u2705 Approved";
                notifMsg = `Your application has been approved. The municipality is now preparing your official document. [Ticket: ${ticketId}]`;
              } else if (upper === "PREPARING DOCUMENT" || upper === "PREPARING") {
                notifTitle = "\u{1F5A8} Preparing Document";
                notifMsg = `Your document is currently being prepared and signed. You will receive another notification once it is ready for pickup. [Ticket: ${ticketId}]`;
              } else if (upper === "READY FOR CLAIM" || upper === "READY") {
                notifTitle = "\u{1F3DB} Ready for Claim";
                notifMsg = `Your request has been processed successfully. Please visit: Municipality of Talibon. Bring: \u2022 Tracking Number (${ticketId}) \u2022 Valid Government ID \u2022 Required payment (if applicable). Office Hours: Monday-Friday 8:00 AM - 5:00 PM. Location: Treasury Office. [Ticket: ${ticketId}]`;
              } else if (upper === "CLAIMED / COMPLETED" || upper === "CLAIMED" || upper === "COMPLETED") {
                notifTitle = "\u{1F389} Transaction Completed";
                notifMsg = `Your document has been successfully claimed. Thank you for using Talibon Digital Core. [Ticket: ${ticketId}]`;
              } else if (upper === "REJECTED") {
                notifTitle = "\u274C Request Rejected";
                notifMsg = `Verification declined. Remarks: "${remarks || "Incomplete details"}". Please submit a new claim with valid files. [Ticket: ${ticketId}]`;
              }
              try {
                await client.from("notifications").insert({
                  title: notifTitle,
                  message: notifMsg,
                  category: "Workflow Updates",
                  user_id: citizenProfile.id,
                  action_url: `/e-services?track=${ticketId}`
                });
              } catch (notifErr) {
                console.warn("[FormsService] Failed to insert notification (table may not exist):", notifErr.message || notifErr);
              }
            }
          }
        }
        return true;
      }
    } catch (err) {
      console.error("[FormsService] Failed to update request status in Supabase:", err);
    }
    const found = this.requests.find((r) => r.id === requestId);
    if (found) {
      found.status = status;
      if (notifyEmail && found.email) {
        this.emailNotificationService.sendStatusUpdate(
          {
            id: found.id || requestId,
            ticketId: found.ticketId || "TLB-REQUEST",
            documentType: found.documentType,
            fullName: found.fullName,
            email: found.email,
            mobileNumber: found.mobileNumber,
            barangay: found.barangay,
            status
          },
          status,
          remarks
        ).catch((e) => console.warn("[FormsService] Email notification error (in-memory):", e));
      }
      return true;
    }
    return false;
  }
  async submitRequest(payload) {
    if (!payload.documentType || !payload.barangay || !payload.fullName || !payload.email || !payload.mobileNumber || !payload.purpose) {
      throw new BadRequestException("All required fields must be provided.");
    }
    let ticketId = `TLB-2026-${String(this.requests.length + 1).padStart(4, "0")}`;
    let dbStatus = "Submitted";
    let submittedAt = (/* @__PURE__ */ new Date()).toISOString();
    let requestId = "mock-" + Math.random().toString(36).substring(2, 9);
    const barangayId = payload.barangay.toLowerCase().replace(/\s+/g, "_");
    let success = false;
    try {
      const client = this.supabaseService.getClient();
      if (client) {
        const generatedId = `TAL-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 8999) + 1e3)}`;
        console.log("[FormsService] Attempting direct insert into certificate_requests with column 'barangay'");
        const { data, error } = await client.from("certificate_requests").insert({
          ticket_id: generatedId,
          document_type: payload.documentType,
          barangay: payload.barangay,
          // Live DB has 'barangay' column
          full_name: payload.fullName,
          email: payload.email,
          mobile_number: payload.mobileNumber,
          purpose: payload.purpose,
          attachments: payload.attachments || [],
          status: "Submitted"
        }).select().maybeSingle();
        if (!error && data) {
          const requestData = data;
          ticketId = requestData.ticket_id || generatedId;
          dbStatus = requestData.status || dbStatus;
          submittedAt = requestData.submitted_at || requestData.created_at || submittedAt;
          requestId = requestData.id || requestId;
          success = true;
          console.log("[FormsService] Direct insert succeeded!");
        } else {
          if (error) {
            console.warn("[FormsService] Direct insert with 'barangay' column failed, trying 'barangay_id' column fallback", error.message);
          }
          const { data: fallbackData, error: fallbackError } = await client.from("certificate_requests").insert({
            ticket_id: generatedId,
            document_type: payload.documentType,
            barangay_id: barangayId,
            full_name: payload.fullName,
            email: payload.email,
            mobile_number: payload.mobileNumber,
            purpose: payload.purpose,
            attachments: payload.attachments || [],
            status: "Submitted"
          }).select().maybeSingle();
          if (!fallbackError && fallbackData) {
            const requestData = fallbackData;
            ticketId = requestData.ticket_id || generatedId;
            dbStatus = requestData.status || dbStatus;
            submittedAt = requestData.submitted_at || requestData.created_at || submittedAt;
            requestId = requestData.id || requestId;
            success = true;
            console.log("[FormsService] Fallback direct insert with 'barangay_id' succeeded!");
          } else if (fallbackError) {
            throw fallbackError;
          }
        }
      }
    } catch (err) {
      console.warn("[FormsService] Direct insert failed, attempting RPC fallback:", err.message || err);
      try {
        const client = this.supabaseService.getClient();
        if (client) {
          const { data, error } = await client.rpc("submit_certificate_request", {
            p_document_type: payload.documentType,
            p_barangay_id: barangayId,
            p_full_name: payload.fullName,
            p_email: payload.email,
            p_mobile_number: payload.mobileNumber,
            p_purpose: payload.purpose,
            p_attachments: payload.attachments || []
          });
          if (error) throw error;
          if (data) {
            const requestData = data;
            ticketId = requestData.ticket_id || ticketId;
            dbStatus = requestData.status || dbStatus;
            submittedAt = requestData.submitted_at || requestData.created_at || submittedAt;
            requestId = requestData.id || requestId;
            success = true;
            console.log("[FormsService] RPC submit succeeded!");
          }
        }
      } catch (rpcErr) {
        console.warn("[FormsService] RPC fallback failed as well:", rpcErr.message || rpcErr);
      }
    }
    const newRequest = {
      id: requestId,
      ticketId,
      documentType: payload.documentType,
      barangay: payload.barangay,
      fullName: payload.fullName,
      email: payload.email,
      mobileNumber: payload.mobileNumber,
      purpose: payload.purpose,
      attachments: payload.attachments || [],
      submittedAt,
      status: dbStatus
    };
    this.requests.unshift(newRequest);
    if (newRequest.email) {
      this.emailNotificationService.sendRequestSubmitted({
        id: newRequest.id,
        ticketId: newRequest.ticketId || "TLB-REQUEST",
        documentType: newRequest.documentType,
        fullName: newRequest.fullName,
        email: newRequest.email,
        mobileNumber: newRequest.mobileNumber,
        barangay: newRequest.barangay,
        status: newRequest.status,
        submittedAt: newRequest.submittedAt
      }).catch((e) => console.warn("[FormsService] Submission email dispatch error:", e));
    }
    return newRequest;
  }
  async getRequestStatus(ticketId) {
    const code = ticketId ? ticketId.trim() : "";
    if (!code) return null;
    try {
      const client = this.supabaseService.getClient();
      if (client) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code);
        let data = null;
        if (isUuid) {
          const { data: idRes } = await client.from("certificate_requests").select("*").eq("id", code).maybeSingle();
          if (idRes) data = idRes;
        }
        if (!data) {
          const { data: ticketRes, error: ticketErr } = await client.from("certificate_requests").select("*").or(`ticket_id.ilike.${code},ticket_id.eq.${code}`).maybeSingle();
          if (ticketRes) {
            data = ticketRes;
          } else if (ticketErr) {
            console.warn("[FormsService] Query error searching ticket_id on certificate_requests:", ticketErr.message);
          }
        }
        if (!data) {
          const { data: codeRes, error: codeErr } = await client.from("certificate_requests").select("*").or(`tracking_code.ilike.${code},tracking_code.eq.${code}`).maybeSingle();
          if (codeRes) {
            data = codeRes;
          } else if (codeErr) {
            console.warn("[FormsService] Query error searching tracking_code on certificate_requests:", codeErr.message);
          }
        }
        if (data) {
          let historyData = [];
          try {
            const { data: srh, error: histError } = await client.from("service_request_history").select("*").eq("request_id", data.id).order("created_at", { ascending: true });
            if (!histError && srh && srh.length > 0) {
              historyData = srh;
            }
          } catch (histErr) {
            console.warn("[FormsService] Could not fetch service_request_history from Supabase:", histErr?.message || histErr);
          }
          return {
            id: data.id,
            ticketId: data.ticket_id || data.tracking_code || data.ticketId || data.id,
            documentType: data.document_type || data.documentType || "Certificate Request",
            barangay: data.barangay_id || data.barangay || "Poblacion",
            fullName: data.full_name || data.fullName,
            email: data.email,
            mobileNumber: data.mobile_number || data.mobileNumber,
            purpose: data.purpose,
            attachments: data.attachments || [],
            submittedAt: data.submitted_at || data.created_at,
            status: data.status || "Submitted",
            history: (historyData || []).map((h) => ({
              id: h.id,
              status: h.status,
              remarks: h.remarks,
              createdAt: h.created_at
            }))
          };
        }
      }
    } catch (err) {
      console.error("[FormsService] Failed to lookup request status from Supabase:", err);
    }
    const found = this.requests.find(
      (r) => r.ticketId?.trim().toUpperCase() === ticketId.trim().toUpperCase() || r.id?.trim() === ticketId.trim()
    );
    return found || null;
  }
  getBusinessPermits() {
    return [
      { id: 1, title: "Business Permit Application Form", url: "#" },
      { id: 2, title: "Business Permit Renewal Form", url: "#" }
    ];
  }
  getBuildingPermits() {
    return [
      { id: 1, title: "Building Permit Application Form", url: "#" },
      { id: 2, title: "Electrical Permit Form", url: "#" },
      { id: 3, title: "Plumbing Permit Form", url: "#" }
    ];
  }
  getZoningClearance() {
    return [
      { id: 1, title: "Zoning Clearance Application Form", url: "#" }
    ];
  }
  getDownloadable() {
    return [
      ...this.getBusinessPermits(),
      ...this.getBuildingPermits(),
      ...this.getZoningClearance()
    ];
  }
};
FormsService = __decorateClass([
  Injectable9(),
  __decorateParam(0, Inject8(SupabaseService)),
  __decorateParam(1, Inject8(EmailNotificationService))
], FormsService);

// src/server/security/rate-limiter.guard.ts
import {
  Injectable as Injectable10,
  HttpException,
  HttpStatus,
  SetMetadata,
  Inject as Inject9
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
var CATEGORY_LIMITS = {
  ["PUBLIC_READ" /* PUBLIC_READ */]: { max: 120, windowMs: 60 * 1e3 },
  ["AUTHENTICATION" /* AUTHENTICATION */]: { max: 10, windowMs: 60 * 1e3 },
  ["CITIZEN_SUBMISSION" /* CITIZEN_SUBMISSION */]: { max: 15, windowMs: 60 * 1e3 },
  ["TRACKING" /* TRACKING */]: { max: 20, windowMs: 60 * 1e3 },
  ["ADMIN_MUTATION" /* ADMIN_MUTATION */]: { max: 30, windowMs: 60 * 1e3 },
  ["FILE_UPLOAD" /* FILE_UPLOAD */]: { max: 10, windowMs: 60 * 1e3 },
  ["PAYMENT" /* PAYMENT */]: { max: 10, windowMs: 60 * 1e3 }
};
var RATE_LIMIT_KEY = "rate_limit_category";
var RateLimit = (category) => SetMetadata(RATE_LIMIT_KEY, category);
var RateLimiterGuard = class {
  constructor(reflector) {
    this.reflector = reflector;
    this.tracker = /* @__PURE__ */ new Map();
    setInterval(() => this.cleanup(), 5 * 60 * 1e3);
  }
  canActivate(context) {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();
    if (!req.path || !req.path.startsWith("/api")) {
      return true;
    }
    const category = this.reflector.getAllAndOverride(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass()
    ]) || "PUBLIC_READ" /* PUBLIC_READ */;
    const config = CATEGORY_LIMITS[category] || CATEGORY_LIMITS["PUBLIC_READ" /* PUBLIC_READ */];
    const clientIp = (req.ip || req.headers["x-forwarded-for"]?.split(",")[0] || req.socket?.remoteAddress || "unknown").toString().trim();
    const trackerKey = `${category}:${clientIp}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;
    let record = this.tracker.get(trackerKey);
    if (!record) {
      record = { timestamps: [] };
      this.tracker.set(trackerKey, record);
    }
    record.timestamps = record.timestamps.filter((t) => t > windowStart);
    const currentCount = record.timestamps.length;
    res.setHeader("X-RateLimit-Limit", config.max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, config.max - currentCount - 1));
    if (currentCount >= config.max) {
      const oldestInWindow = record.timestamps[0] || now;
      const retryAfterSeconds = Math.ceil((oldestInWindow + config.windowMs - now) / 1e3) || 60;
      res.setHeader("Retry-After", retryAfterSeconds);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please wait before submitting additional requests.",
          retryAfter: retryAfterSeconds
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }
    record.timestamps.push(now);
    return true;
  }
  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.tracker.entries()) {
      record.timestamps = record.timestamps.filter((t) => t > now - 10 * 60 * 1e3);
      if (record.timestamps.length === 0) {
        this.tracker.delete(key);
      }
    }
  }
};
RateLimiterGuard = __decorateClass([
  Injectable10(),
  __decorateParam(0, Inject9(Reflector))
], RateLimiterGuard);

// src/server/security/auth.guard.ts
import {
  Injectable as Injectable11,
  UnauthorizedException,
  ForbiddenException,
  SetMetadata as SetMetadata2,
  Inject as Inject10
} from "@nestjs/common";
import { Reflector as Reflector2 } from "@nestjs/core";
var IS_PUBLIC_KEY = "isPublic";
var ROLES_KEY = "roles";
var Roles = (...roles) => SetMetadata2(ROLES_KEY, roles);
var REQUIRE_AUTH_KEY = "requireAuth";
var RequireAuth = () => SetMetadata2(REQUIRE_AUTH_KEY, true);
var AuthGuard = class {
  constructor(reflector, supabaseService) {
    this.reflector = reflector;
    this.supabaseService = supabaseService;
  }
  async canActivate(context) {
    const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    const requireAuth = this.reflector.getAllAndOverride(REQUIRE_AUTH_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (isPublic && !requiredRoles && !requireAuth) {
      return true;
    }
    if (!requireAuth && !requiredRoles) {
      return true;
    }
    const http = context.switchToHttp();
    const req = http.getRequest();
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Authorization header missing or invalid format.");
    }
    const token = authHeader.substring(7).trim();
    if (!token) {
      throw new UnauthorizedException("Bearer token missing.");
    }
    try {
      const client = this.supabaseService.getClient();
      const { data, error } = await client.auth.getUser(token);
      if (error || !data.user) {
        throw new UnauthorizedException("Invalid or expired authentication token.");
      }
      req.user = data.user;
      if (requiredRoles && requiredRoles.length > 0) {
        const userId = data.user.id;
        const { data: profile } = await client.from("profiles").select("role").eq("id", userId).maybeSingle();
        const userRole = profile?.role || data.user.app_metadata?.role || "citizen";
        const hasRole = requiredRoles.some((r) => r.toLowerCase() === userRole.toLowerCase());
        if (!hasRole) {
          throw new ForbiddenException("Access denied. Required administrative privileges are missing.");
        }
      }
      return true;
    } catch (err) {
      if (err instanceof ForbiddenException || err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException("Authentication token verification failed.");
    }
  }
};
AuthGuard = __decorateClass([
  Injectable11(),
  __decorateParam(0, Inject10(Reflector2)),
  __decorateParam(1, Inject10(SupabaseService))
], AuthGuard);

// src/server/api/forms/forms.controller.ts
var FormsController = class {
  constructor(formsService) {
    this.formsService = formsService;
  }
  async getAllRequests() {
    return this.formsService.getAllRequests();
  }
  async submitRequest(dto) {
    return this.formsService.submitRequest(dto);
  }
  async getRequestStatus(ticketId) {
    const sanitized = ticketId ? ticketId.trim() : "";
    if (!sanitized || sanitized.length > 100) {
      throw new BadRequestException2("Invalid ticket ID provided.");
    }
    const request = await this.formsService.getRequestStatus(sanitized);
    if (!request) {
      return { success: false, message: "Ticket ID or tracking code not found." };
    }
    return { success: true, request };
  }
  async updateRequestStatus(id, dto) {
    if (!id || id.length > 100) {
      throw new BadRequestException2("Invalid request ID.");
    }
    console.log(`[FORMS_API] Request received: PUT /api/forms/certificate/${id}/status -> Target Status: "${dto.status}", notifyEmail: ${dto.notifyEmail !== false}, notifyCitizen: ${dto.notifyCitizen !== false}`);
    const success = await this.formsService.updateRequestStatus(
      id,
      dto.status,
      dto.remarks || "",
      dto.notifyCitizen !== false,
      dto.saveTimeline !== false,
      dto.notifyEmail !== false,
      dto.requirements
    );
    console.log(`[FORMS_API] Status transition completed for request ID ${id}. Result: ${success ? "SUCCESS" : "FAILED"}`);
    return { success, notificationQueued: true };
  }
  getDownloadable() {
    return this.formsService.getDownloadable();
  }
  getBusinessPermits() {
    return this.formsService.getBusinessPermits();
  }
  getBuildingPermits() {
    return this.formsService.getBuildingPermits();
  }
  getZoningClearance() {
    return this.formsService.getZoningClearance();
  }
};
__decorateClass([
  Get7("certificate"),
  RateLimit("ADMIN_MUTATION" /* ADMIN_MUTATION */),
  RequireAuth(),
  Roles("admin", "super_admin", "staff")
], FormsController.prototype, "getAllRequests", 1);
__decorateClass([
  Post("certificate"),
  RateLimit("CITIZEN_SUBMISSION" /* CITIZEN_SUBMISSION */),
  __decorateParam(0, Body())
], FormsController.prototype, "submitRequest", 1);
__decorateClass([
  Get7("certificate/:ticketId"),
  RateLimit("TRACKING" /* TRACKING */),
  __decorateParam(0, Param("ticketId"))
], FormsController.prototype, "getRequestStatus", 1);
__decorateClass([
  Put("certificate/:id/status"),
  RateLimit("ADMIN_MUTATION" /* ADMIN_MUTATION */),
  RequireAuth(),
  Roles("admin", "super_admin", "staff"),
  __decorateParam(0, Param("id")),
  __decorateParam(1, Body())
], FormsController.prototype, "updateRequestStatus", 1);
__decorateClass([
  Get7("downloadable"),
  RateLimit("PUBLIC_READ" /* PUBLIC_READ */)
], FormsController.prototype, "getDownloadable", 1);
__decorateClass([
  Get7("business-permits"),
  RateLimit("PUBLIC_READ" /* PUBLIC_READ */)
], FormsController.prototype, "getBusinessPermits", 1);
__decorateClass([
  Get7("building-permits"),
  RateLimit("PUBLIC_READ" /* PUBLIC_READ */)
], FormsController.prototype, "getBuildingPermits", 1);
__decorateClass([
  Get7("zoning-clearance"),
  RateLimit("PUBLIC_READ" /* PUBLIC_READ */)
], FormsController.prototype, "getZoningClearance", 1);
FormsController = __decorateClass([
  Controller7("api/forms"),
  __decorateParam(0, Inject11(FormsService))
], FormsController);

// src/server/api/payments/payments.module.ts
import { Module } from "@nestjs/common";

// src/server/api/payments/payments.controller.ts
import { Controller as Controller8, Post as Post2, Body as Body2, Req, Inject as Inject12 } from "@nestjs/common";

// src/server/api/payments/payments.service.ts
import { Injectable as Injectable12, InternalServerErrorException as InternalServerErrorException2, BadRequestException as BadRequestException3 } from "@nestjs/common";
import { Xendit } from "xendit-node";
var MIN_AMOUNT = 1;
var MAX_AMOUNT = 1e6;
var PaymentsService = class {
  constructor() {
    this.xenditClient = null;
  }
  get client() {
    if (!this.xenditClient) {
      const secretKey = process.env.XENDIT_SECRET_KEY;
      if (!secretKey) {
        throw new InternalServerErrorException2(
          "Xendit payment gateway is not configured. Please set XENDIT_SECRET_KEY in environment variables."
        );
      }
      this.xenditClient = new Xendit({ secretKey });
    }
    return this.xenditClient;
  }
  async createCheckoutSession(itemName, amount, successUrl, cancelUrl) {
    if (!itemName || typeof itemName !== "string" || itemName.trim().length === 0) {
      throw new BadRequestException3("Item name is required.");
    }
    if (!Number.isFinite(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      throw new BadRequestException3(
        `Amount must be between \u20B1${MIN_AMOUNT} and \u20B1${MAX_AMOUNT.toLocaleString()}.`
      );
    }
    const roundedAmount = Math.round(amount * 100) / 100;
    const externalId = `talibon-pay-${Date.now()}`;
    try {
      const invoiceRequest = {
        externalId,
        amount: roundedAmount,
        currency: "PHP",
        description: itemName.trim().slice(0, 200),
        successRedirectUrl: successUrl,
        failureRedirectUrl: cancelUrl,
        items: [
          {
            name: itemName.trim().slice(0, 200),
            quantity: 1,
            price: roundedAmount
          }
        ],
        fees: []
      };
      const response = await this.client.Invoice.createInvoice({
        data: invoiceRequest
      });
      if (!response?.invoiceUrl) {
        throw new InternalServerErrorException2("Invalid response from Xendit payment gateway.");
      }
      return {
        sessionId: response.id,
        url: response.invoiceUrl
      };
    } catch (error) {
      console.error("[Xendit] Error:", error?.response?.data || error);
      if (error instanceof BadRequestException3 || error instanceof InternalServerErrorException2) {
        throw error;
      }
      if (error?.status === 401) {
        throw new InternalServerErrorException2(
          "Xendit authentication failed. Please verify your API key."
        );
      }
      throw new InternalServerErrorException2(
        "Xendit payment processing failed. Please try again later or contact support."
      );
    }
  }
};
PaymentsService = __decorateClass([
  Injectable12()
], PaymentsService);

// src/server/api/payments/payments.controller.ts
var PaymentsController = class {
  constructor(paymentsService) {
    this.paymentsService = paymentsService;
  }
  async createCheckoutSession(dto, req) {
    const protocol = req.protocol;
    const host = req.get("host");
    const baseUrl = `${protocol}://${host}`;
    const {
      itemName,
      amount,
      successUrl = `${baseUrl}/payment/success`,
      cancelUrl = `${baseUrl}/payment/cancel`
    } = dto;
    return this.paymentsService.createCheckoutSession(itemName, amount, successUrl, cancelUrl);
  }
};
__decorateClass([
  Post2("create-checkout-session"),
  RateLimit("PAYMENT" /* PAYMENT */),
  __decorateParam(0, Body2()),
  __decorateParam(1, Req())
], PaymentsController.prototype, "createCheckoutSession", 1);
PaymentsController = __decorateClass([
  Controller8("api/payments"),
  __decorateParam(0, Inject12(PaymentsService))
], PaymentsController);

// src/server/api/payments/payments.module.ts
var PaymentsModule = class {
};
PaymentsModule = __decorateClass([
  Module({
    controllers: [PaymentsController],
    providers: [PaymentsService],
    exports: [PaymentsService]
  })
], PaymentsModule);

// src/server/api/notifications/notification.module.ts
import { Module as Module2 } from "@nestjs/common";
var NotificationsModule = class {
};
NotificationsModule = __decorateClass([
  Module2({
    providers: [SupabaseService, EmailNotificationService],
    exports: [EmailNotificationService]
  })
], NotificationsModule);

// src/server/security/security-headers.middleware.ts
import { Injectable as Injectable13 } from "@nestjs/common";
var SecurityHeadersMiddleware = class {
  use(req, res, next) {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    if (req.secure || req.headers["x-forwarded-proto"] === "https") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net https://connect.facebook.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' https://*.supabase.co https://*.run.app https://api.stripe.com https://*.google.com https://*.facebook.com wss: ws:",
      "frame-src 'self' https://www.facebook.com https://web.facebook.com https://www.google.com https://maps.google.com https://js.stripe.com",
      "frame-ancestors 'self' https:",
      "base-uri 'self'",
      "form-action 'self'"
    ].join("; ");
    res.setHeader("Content-Security-Policy", csp);
    next();
  }
};
SecurityHeadersMiddleware = __decorateClass([
  Injectable13()
], SecurityHeadersMiddleware);

// src/server/security/cache-control.middleware.ts
import { Injectable as Injectable14 } from "@nestjs/common";
var CacheControlMiddleware = class {
  use(req, res, next) {
    const path2 = req.path.toLowerCase();
    if (path2.startsWith("/api/forms/certificate") || path2.startsWith("/api/payments") || req.method !== "GET") {
      res.setHeader("Cache-Control", "private, no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    } else if (path2.startsWith("/api/")) {
      res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=60");
    }
    next();
  }
};
CacheControlMiddleware = __decorateClass([
  Injectable14()
], CacheControlMiddleware);

// src/server/security/all-exceptions.filter.ts
import {
  HttpException as HttpException2,
  HttpStatus as HttpStatus2,
  Logger as Logger2
} from "@nestjs/common";
import { Injectable as Injectable15 } from "@nestjs/common";
var AllExceptionsFilter = class {
  constructor() {
    this.logger = new Logger2("SecurityExceptionsFilter");
  }
  catch(exception, host) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    let status = HttpStatus2.INTERNAL_SERVER_ERROR;
    let message = "An unexpected error occurred. Please try again later.";
    let errorType = "Internal Server Error";
    if (exception instanceof HttpException2) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === "string") {
        message = res;
      } else if (typeof res === "object" && res !== null) {
        const obj = res;
        message = obj.message || obj.error || message;
        errorType = obj.error || errorType;
      }
    }
    this.logger.error(
      `[API Error ${status}] ${request.method} ${request.url} - Client IP: ${request.ip}`,
      exception instanceof Error ? exception.stack : String(exception)
    );
    let clientMessage = message;
    if (status === HttpStatus2.INTERNAL_SERVER_ERROR) {
      clientMessage = "An internal server error occurred. Please contact the administrator if this persists.";
    }
    response.status(status).json({
      statusCode: status,
      error: errorType,
      message: clientMessage,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
};
AllExceptionsFilter = __decorateClass([
  Injectable15()
], AllExceptionsFilter);

// src/server/app.module.ts
var AppModule = class {
  async configure(consumer) {
    consumer.apply(SecurityHeadersMiddleware, CacheControlMiddleware).forRoutes({ path: "*", method: RequestMethod.ALL });
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa"
      });
      consumer.apply(vite.middlewares).exclude({ path: "api/(.*)", method: RequestMethod.ALL }).forRoutes({ path: "*", method: RequestMethod.ALL });
    } else {
      const distPath = path.join(process.cwd(), "dist");
      consumer.apply(express.static(distPath)).forRoutes({ path: "*", method: RequestMethod.ALL });
      consumer.apply((req, res, next) => {
        if (!req.path.startsWith("/api")) {
          res.sendFile(path.join(distPath, "index.html"));
        } else {
          next();
        }
      }).forRoutes({ path: "*", method: RequestMethod.ALL });
    }
  }
};
AppModule = __decorateClass([
  Module3({
    imports: [PaymentsModule, NotificationsModule],
    controllers: [
      AboutController,
      ExecutiveController,
      LegislativeController,
      NewsController,
      TransparencyController,
      TourismController,
      FormsController,
      PaymentsController
    ],
    providers: [
      SupabaseService,
      EmailNotificationService,
      AboutService,
      ExecutiveService,
      LegislativeService,
      NewsService,
      TransparencyService,
      TourismService,
      FormsService,
      PaymentsService,
      {
        provide: APP_GUARD,
        useClass: RateLimiterGuard
      },
      {
        provide: APP_GUARD,
        useClass: AuthGuard
      },
      {
        provide: APP_FILTER,
        useClass: AllExceptionsFilter
      }
    ]
  })
], AppModule);

// src/server/serverless.ts
import { ValidationPipe } from "@nestjs/common";
import express2 from "express";
import { ExpressAdapter } from "@nestjs/platform-express";
var cachedServer = null;
async function bootstrapServer() {
  if (cachedServer) {
    return cachedServer;
  }
  console.log("[VERCEL_API] Cold start: Initializing NestJS serverless application on Vercel...");
  const expressApp = express2();
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter, {
    bodyParser: false,
    logger: process.env.NODE_ENV === "production" ? ["error", "warn", "log"] : ["log", "debug", "error", "warn"]
  });
  app.use(express2.json({ limit: "10mb" }));
  app.use(express2.urlencoded({ limit: "10mb", extended: true }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: process.env.NODE_ENV === "production"
    })
  );
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const rawAllowed = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean) : [];
      if (rawAllowed.includes(origin) || origin.includes("localhost") || origin.includes("127.0.0.1") || origin.includes("run.app") || origin.includes("ai.studio") || origin.includes("vercel.app") || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
  });
  await app.init();
  cachedServer = expressApp;
  console.log("[VERCEL_API] NestJS serverless initialization completed successfully.");
  return cachedServer;
}
async function handler(req, res) {
  if (req.url && !req.url.startsWith("/api") && !req.url.startsWith("/api/")) {
    req.url = req.url.startsWith("/") ? `/api${req.url}` : `/api/${req.url}`;
  }
  console.log(`[VERCEL_API] Incoming request: ${req.method} ${req.url}`);
  const server = await bootstrapServer();
  return server(req, res);
}
export {
  handler as default
};
