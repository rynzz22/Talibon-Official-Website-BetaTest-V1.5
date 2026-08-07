export interface BarangayInfo {
  id: string;
  name: string;
  slug: string;
  captain: string;
  population: string;
}

export const BARANGAYS: BarangayInfo[] = [
  { id: "poblacion", slug: "poblacion", name: "Poblacion", captain: "Hon. Juan dela Cruz", population: "4,500" },
  { id: "san_francisco", slug: "san_francisco", name: "San Francisco", captain: "Hon. Maria Clara", population: "3,200" },
  { id: "san_jose", slug: "san_jose", name: "San Jose", captain: "Hon. Jose Rizal", population: "2,800" },
  { id: "san_agustin", slug: "san_agustin", name: "San Agustin", captain: "Hon. Andres Bonifacio", population: "1,900" },
  { id: "san_roque", slug: "san_roque", name: "San Roque", captain: "Hon. Emilio Aguinaldo", population: "2,100" },
  { id: "san_isidro", slug: "san_isidro", name: "San Isidro", captain: "Hon. Apolinario Mabini", population: "1,500" },
  { id: "santo_nino", slug: "santo_nino", name: "Santo Niño", captain: "Hon. Melchora Aquino", population: "1,100" },
  { id: "san_pedro", slug: "san_pedro", name: "San Pedro", captain: "Hon. Marcelo H. del Pilar", population: "3,800" },
  { id: "tanghaligue", slug: "tanghaligue", name: "Tanghaligue", captain: "Hon. Gregorio del Pilar", population: "2,400" },
  { id: "bagacay", slug: "bagacay", name: "Bagacay", captain: "Hon. Gabriela Silang", population: "1,700" },
  { id: "balintawak", slug: "balintawak", name: "Balintawak", captain: "Hon. Francisco Balagtas", population: "1,200" },
  { id: "burgos", slug: "burgos", name: "Burgos", captain: "Hon. Diego Silang", population: "850" },
  { id: "cantomimbo", slug: "cantomimbo", name: "Cantomimbo", captain: "Hon. Juan Luna", population: "1,300" },
  { id: "guindacpan", slug: "guindacpan", name: "Guindacpan", captain: "Hon. Macario Sakay", population: "2,200" },
  { id: "magsaysay", slug: "magsaysay", name: "Magsaysay", captain: "Hon. Ramon Magsaysay", population: "1,450" },
  { id: "mahanay", slug: "mahanay", name: "Mahanay", captain: "Hon. Carlos P. Garcia", population: "3,100" },
  { id: "masacon", slug: "masacon", name: "Masacon", captain: "Hon. Jose Abad Santos", population: "980" },
  { id: "nonoc", slug: "nonoc", name: "Nonoc", captain: "Hon. Manuel L. Quezon", population: "1,600" },
  { id: "san_carlos", slug: "san_carlos", name: "San Carlos", captain: "Hon. Sergio Osmeña", population: "1,150" },
  { id: "san_gregorio", slug: "san_gregorio", name: "San Gregorio", captain: "Hon. Elpidio Quirino", population: "750" },
  { id: "san_juan", slug: "san_juan", name: "San Juan", captain: "Hon. Diosdado Macapagal", population: "2,050" },
  { id: "santa_cruz", slug: "santa_cruz", name: "Santa Cruz", captain: "Hon. Ferdinand Marcos", population: "1,800" },
  { id: "santo_rosario", slug: "santo_rosario", name: "Santo Rosario", captain: "Hon. Corazon Aquino", population: "950" },
  { id: "sikatuna", slug: "sikatuna", name: "Sikatuna", captain: "Hon. Datu Sikatuna", population: "1,350" },
  { id: "suba", slug: "suba", name: "Suba", captain: "Hon. Rajah Humabon", population: "2,900" }
];
