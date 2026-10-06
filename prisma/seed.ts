// Sample data so the UI isn't empty on first run.
// Safe to re-run: it does nothing if the table already has rows (never touches your data).
// Deadlines are relative to "now" so every highlight colour is visible.
import { PrismaClient, type Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const fromNow = (ms: number) => new Date(Date.now() + ms);
const dateOnly = (ms: number) => new Date(new Date(Date.now() + ms).toISOString().slice(0, 10) + "T00:00:00Z");

const samples: Prisma.HackathonCreateInput[] = [
  {
    name: "AI Agents Buildathon",
    organizer: "Sample AI Community",
    category: "AI",
    status: "IN_PROGRESS",
    startDate: dateOnly(-5 * DAY),
    deadline: fromNow(18 * HOUR), // < 24h → Overdue
    prize: "$10,000 pool",
    link: "https://example.com/ai-agents-buildathon",
    notes: "Building a research-assistant agent. TODO: record demo video, write README.",
  },
  {
    name: "Open Finance Hack",
    organizer: "Example Bank Labs",
    category: "Fintech",
    status: "NOT_STARTED",
    startDate: dateOnly(1 * DAY),
    deadline: fromNow(2 * DAY + 6 * HOUR), // < 3 days → red
    prize: "$5k + mentorship",
    link: "https://example.com/open-finance-hack",
    notes: "Idea: budgeting app using open-banking APIs.",
  },
  {
    name: "Web3 Builders Weekend",
    organizer: "Demo DAO",
    category: "Web3",
    status: "CONSIDERING",
    startDate: dateOnly(3 * DAY),
    deadline: fromNow(5 * DAY), // < 7 days → yellow
    prize: "Grants up to $3k",
    link: "https://example.com/web3-weekend",
  },
  {
    name: "Climate Data Jam",
    organizer: "Green Code Collective",
    category: "General",
    status: "COMPLETED",
    startDate: dateOnly(-30 * DAY),
    deadline: fromNow(-20 * DAY),
    prize: "$2,000",
    link: "https://example.com/climate-data-jam",
    result: "PLACED",
    resultDetail: "2nd place",
    notes: "Built a flood-risk map. Great feedback on the UI.",
  },
];

async function main() {
  const count = await prisma.hackathon.count();
  if (count > 0) {
    console.log(`Skipping seed: table already has ${count} hackathon(s).`);
    return;
  }
  for (const data of samples) await prisma.hackathon.create({ data });
  console.log(`Seeded ${samples.length} sample hackathons.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
