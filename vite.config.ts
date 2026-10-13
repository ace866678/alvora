import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { agentmarkup } from "@agentmarkup/vite";

const site = "https://alvora-nine.vercel.app/";

export default defineConfig({
  plugins: [
    react(),
    agentmarkup({
      site,
      name: "Alvora",
      description:
        "A Philippines-first opportunity discovery prototype for scholarships, internships, hackathons, grants, competitions, and technology events. Current listings are illustrative demo content, not verified live opportunities.",
      llmsTxt: {
        sections: [
          {
            title: "Public pages",
            entries: [
              {
                title: "Alvora — Discover opportunities",
                url: "/",
                description:
                  "Explore the Alvora interface for discovering education, career, funding, competition, and technology-event opportunities in the Philippines. Current catalogue entries are illustrative samples.",
              },
            ],
          },
        ],
      },
      markdownPages: {
        enabled: true,
      },
      globalSchemas: [
        {
          preset: "webSite",
          name: "Alvora",
          url: site,
        },
      ],
      validation: {
        warnOnMissingSchema: true,
      },
    }),
  ],
});
