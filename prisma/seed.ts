import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create tags
  const tagNames = [
    "nlp", "computer-vision", "llm", "rag", "classification",
    "clustering", "recommendation", "anomaly-detection", "churn-prediction",
    "automation", "reporting", "data-pipeline", "embedding", "generative-ai",
    "forecasting",
  ];

  const tags: Record<string, { id: string; name: string }> = {};
  for (const name of tagNames) {
    tags[name] = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Create users
  const users = [
    { email: "admin@appsflyer.com", name: "Mark Samuelson", department: "AI", role: "ADMIN" as const },
    { email: "sarah.cohen@appsflyer.com", name: "Sarah Cohen", department: "Product", role: "SOLUTION_OWNER" as const },
    { email: "alex.katz@appsflyer.com", name: "Alex Katz", department: "Engineering", role: "SOLUTION_OWNER" as const },
    { email: "dana.levi@appsflyer.com", name: "Dana Levi", department: "Marketing", role: "VIEWER" as const },
    { email: "omer.tal@appsflyer.com", name: "Omer Tal", department: "Customer Success", role: "VIEWER" as const },
  ];

  const createdUsers: Record<string, { id: string }> = {};
  for (const user of users) {
    createdUsers[user.email] = await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, department: user.department, role: user.role },
      create: user,
    });
  }

  // Create solutions
  const solutions = [
    {
      name: "ChurnGuard AI",
      description: "An intelligent agent that monitors customer engagement signals and predicts churn risk in real-time. Uses ML classification models trained on AppsFlyer's customer data to identify at-risk accounts and automatically triggers retention workflows. Has reduced churn by 18% since deployment.",
      department: "Product",
      status: "APPROVED" as const,
      solutionType: "AGENT" as const,
      mau: 342,
      jiraTicketId: "AI-101",
      ownerEmail: "sarah.cohen@appsflyer.com",
      ownerName: "Sarah Cohen",
      tags: ["churn-prediction", "classification", "llm"],
      featured: true,
    },
    {
      name: "Ad Creative Copilot",
      description: "A generative AI copilot that helps marketing teams draft, iterate, and optimize ad creatives. Integrates with our campaign management tools to suggest copy variations, A/B test headlines, and generate visual layouts aligned with brand guidelines.",
      department: "Marketing",
      status: "APPROVED" as const,
      solutionType: "COPILOT" as const,
      mau: 891,
      jiraTicketId: "AI-102",
      ownerEmail: "dana.levi@appsflyer.com",
      ownerName: "Dana Levi",
      tags: ["generative-ai", "llm"],
      featured: true,
    },
    {
      name: "Fraud Detection Engine v3",
      description: "Real-time analytics engine that detects fraudulent install and in-app event patterns across mobile attribution data. Uses ensemble ML models combining anomaly detection and classification to flag suspicious traffic with 99.2% precision. Processes over 10M events daily.",
      department: "Security",
      status: "APPROVED" as const,
      solutionType: "ANALYTICS" as const,
      mau: 1204,
      jiraTicketId: "AI-103",
      ownerEmail: "alex.katz@appsflyer.com",
      ownerName: "Alex Katz",
      tags: ["anomaly-detection", "classification"],
      featured: true,
    },
    {
      name: "Data Pipeline Orchestrator",
      description: "Automated workflow engine that manages ETL pipelines across data sources. Handles scheduling, dependency resolution, error recovery, and monitoring. Reduced manual data engineering toil by 60% and improved pipeline reliability to 99.9% uptime.",
      department: "Data Engineering",
      status: "APPROVED" as const,
      solutionType: "AUTOMATION" as const,
      mau: 567,
      jiraTicketId: "AI-104",
      ownerEmail: "alex.katz@appsflyer.com",
      ownerName: "Alex Katz",
      tags: ["automation", "data-pipeline"],
    },
    {
      name: "Customer Insight Bot",
      description: "An AI agent for the Customer Success team that answers questions about customer accounts using RAG over internal documentation, Salesforce data, and usage analytics. Supports natural language queries like 'What features is Acme Corp using?' and provides context-aware summaries.",
      department: "Customer Success",
      status: "EXPERIMENTAL" as const,
      solutionType: "AGENT" as const,
      mau: 89,
      jiraTicketId: "AI-105",
      ownerEmail: "omer.tal@appsflyer.com",
      ownerName: "Omer Tal",
      tags: ["nlp", "rag", "llm"],
    },
    {
      name: "Attribution Anomaly Detector",
      description: "Monitors attribution data streams in real-time and flags statistical anomalies in install volumes, conversion rates, and revenue metrics. Uses time-series forecasting models to distinguish genuine trends from data quality issues or fraud attempts.",
      department: "Product",
      status: "APPROVED" as const,
      solutionType: "ANALYTICS" as const,
      mau: 723,
      jiraTicketId: "AI-106",
      ownerEmail: "sarah.cohen@appsflyer.com",
      ownerName: "Sarah Cohen",
      tags: ["anomaly-detection", "forecasting"],
    },
    {
      name: "Code Review Assistant",
      description: "An LLM-powered copilot that reviews pull requests, identifies potential bugs, suggests improvements, and enforces coding standards. Integrates with GitHub and runs automatically on every PR. Currently in beta with the platform engineering team.",
      department: "Engineering",
      status: "EXPERIMENTAL" as const,
      solutionType: "COPILOT" as const,
      mau: 156,
      jiraTicketId: "AI-107",
      ownerEmail: "alex.katz@appsflyer.com",
      ownerName: "Alex Katz",
      tags: ["llm", "generative-ai"],
    },
    {
      name: "SKAdNetwork Analyzer",
      description: "Advanced analytics tool for parsing and interpreting Apple's SKAdNetwork postbacks. Provides conversion value decoding, campaign performance insights, and cohort analysis to help advertisers understand iOS attribution in the post-ATT era.",
      department: "Product",
      status: "APPROVED" as const,
      solutionType: "ANALYTICS" as const,
      mau: 445,
      jiraTicketId: "AI-108",
      ownerEmail: "sarah.cohen@appsflyer.com",
      ownerName: "Sarah Cohen",
      tags: ["classification", "reporting"],
    },
    {
      name: "Support Ticket Router",
      description: "Automated triage system that classifies incoming support tickets by category, urgency, and required expertise, then routes them to the appropriate team. Uses NLP to understand ticket content and historical resolution patterns to improve routing accuracy over time.",
      department: "Customer Success",
      status: "APPROVED" as const,
      solutionType: "AUTOMATION" as const,
      mau: 312,
      jiraTicketId: "AI-109",
      ownerEmail: "omer.tal@appsflyer.com",
      ownerName: "Omer Tal",
      tags: ["nlp", "classification", "automation"],
    },
    {
      name: "Revenue Forecast Model",
      description: "ML-based forecasting system that predicts quarterly revenue based on pipeline data, historical trends, seasonality, and macroeconomic indicators. Provides confidence intervals and scenario analysis for leadership planning.",
      department: "Finance",
      status: "EXPERIMENTAL" as const,
      solutionType: "ANALYTICS" as const,
      mau: 67,
      jiraTicketId: "AI-110",
      ownerEmail: "admin@appsflyer.com",
      ownerName: "Mark Samuelson",
      tags: ["forecasting", "reporting"],
    },
    {
      name: "Campaign Optimizer",
      description: "An agent that analyzed campaign performance data and recommended budget allocation changes. Was superseded by the new Ad Creative Copilot which provides a more comprehensive marketing AI solution.",
      department: "Marketing",
      status: "DEPRECATED" as const,
      solutionType: "AGENT" as const,
      mau: 23,
      jiraTicketId: "AI-111",
      ownerEmail: "dana.levi@appsflyer.com",
      ownerName: "Dana Levi",
      tags: ["recommendation", "llm"],
    },
    {
      name: "Doc Search Engine",
      description: "Semantic search engine over AppsFlyer's internal documentation, wiki pages, and knowledge base. Uses vector embeddings and RAG to provide accurate answers with source citations. Supports natural language questions and integrates with Slack and Confluence.",
      department: "Engineering",
      status: "APPROVED" as const,
      solutionType: "COPILOT" as const,
      mau: 678,
      jiraTicketId: "AI-112",
      ownerEmail: "alex.katz@appsflyer.com",
      ownerName: "Alex Katz",
      tags: ["rag", "embedding", "nlp"],
      featured: true,
    },
    {
      name: "Onboarding Workflow AI",
      description: "Automated employee onboarding workflow that personalizes the onboarding journey based on role, department, and seniority. Sends scheduled reminders, tracks completion of required training, and provides an AI chatbot for common new-hire questions.",
      department: "HR",
      status: "EXPERIMENTAL" as const,
      solutionType: "AUTOMATION" as const,
      mau: 34,
      jiraTicketId: "AI-113",
      ownerEmail: "admin@appsflyer.com",
      ownerName: "Mark Samuelson",
      tags: ["automation", "nlp"],
    },
    {
      name: "Privacy Compliance Scanner",
      description: "Automated compliance tool that scans codebases and data pipelines for potential privacy regulation violations (GDPR, CCPA, etc.). Uses NLP to classify data fields and detect PII exposure risks. Generates compliance reports and remediation suggestions.",
      department: "Legal",
      status: "APPROVED" as const,
      solutionType: "ANALYTICS" as const,
      mau: 189,
      jiraTicketId: "AI-114",
      ownerEmail: "admin@appsflyer.com",
      ownerName: "Mark Samuelson",
      tags: ["classification", "nlp"],
    },
    {
      name: "Slack Summarizer Bot",
      description: "An AI bot that summarizes long Slack threads and channels on demand. Uses LLMs to extract key discussion points, decisions, and action items. Supports daily digest mode for busy channels and can generate meeting notes from discussions.",
      department: "AI",
      status: "EXPERIMENTAL" as const,
      solutionType: "AGENT" as const,
      mau: 245,
      jiraTicketId: "AI-115",
      ownerEmail: "admin@appsflyer.com",
      ownerName: "Mark Samuelson",
      tags: ["llm", "nlp", "generative-ai"],
    },
  ];

  for (const sol of solutions) {
    const { tags: tagNames, ownerEmail, featured, ...data } = sol;
    const user = createdUsers[ownerEmail];

    await prisma.solution.upsert({
      where: { jiraTicketId: data.jiraTicketId },
      update: {
        ...data,
        featured: featured || false,
        ownerId: user?.id || null,
        jiraTicketUrl: `https://appsflyer.atlassian.net/browse/${data.jiraTicketId}`,
        jiraLastSynced: new Date(),
        tags: {
          set: [],
          connectOrCreate: tagNames.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      create: {
        ...data,
        featured: featured || false,
        ownerId: user?.id || null,
        jiraTicketUrl: `https://appsflyer.atlassian.net/browse/${data.jiraTicketId}`,
        jiraLastSynced: new Date(),
        tags: {
          connectOrCreate: tagNames.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
    });
  }

  // Create sync logs
  const now = new Date();
  await prisma.syncLog.createMany({
    data: [
      {
        source: "jira",
        status: "success",
        issuesSynced: 15,
        issuesErrored: 0,
        triggeredBy: "admin@appsflyer.com",
        startedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 5000),
      },
      {
        source: "jira",
        status: "partial",
        message: "AI-999: Issue not found\nAI-998: Missing required fields",
        issuesSynced: 12,
        issuesErrored: 2,
        triggeredBy: "admin@appsflyer.com",
        startedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        completedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 8000),
      },
      {
        source: "jira",
        status: "success",
        issuesSynced: 15,
        issuesErrored: 0,
        triggeredBy: "system",
        startedAt: new Date(now.getTime() - 60000),
        completedAt: new Date(now.getTime() - 55000),
      },
    ],
  });

  console.log("Seeding complete!");
  console.log(`  - ${tagNames.length} tags`);
  console.log(`  - ${users.length} users`);
  console.log(`  - ${solutions.length} solutions`);
  console.log(`  - 3 sync logs`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
