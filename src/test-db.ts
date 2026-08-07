import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const sanitizeUrl = (url: string): string => {
  let trimmed = url.trim();
  while (trimmed.endsWith('/')) {
    trimmed = trimmed.slice(0, -1);
  }
  if (trimmed.endsWith('/rest/v1')) {
    trimmed = trimmed.slice(0, -8);
  }
  while (trimmed.endsWith('/')) {
    trimmed = trimmed.slice(0, -1);
  }
  return trimmed;
};

async function run() {
  const rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!rawUrl || !key) {
    console.error("Missing credentials");
    return;
  }

  const url = sanitizeUrl(rawUrl);

  try {
    const response = await axios({
      method: "GET",
      url: `${url}/rest/v1/`,
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`,
        "Accept": "application/openapi+json"
      }
    });

    const rpcs = Object.keys(response.data.paths || {}).filter(p => p.startsWith("/rpc/"));
    console.log("Available RPCs in Supabase database:", rpcs);
  } catch (err: any) {
    console.error("OpenAPI request failed:", err.message);
  }
}

run();
