import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { DepartmentSection } from "@/components/dashboard/department-section";
import { RecentSolutions } from "@/components/dashboard/recent-solutions";
import { findSolutionsWithRelations } from "@/lib/queries";
import { HeroChat } from "@/components/chat/hero-chat";
import type { SolutionWithTags } from "@/types";

export default async function HomePage() {
  const session = await auth();
  const userDepartment = session?.user?.department || null;

  // Sequential queries to avoid PrismaPg adapter concurrency bug
  const totalSolutions = await prisma.solution.count();
  const totalMauResult = await prisma.solution.aggregate({ _sum: { mau: true } });
  const newThisMonth = await prisma.solution.count({
    where: {
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
  });
  const departmentsResult = await prisma.solution.findMany({
    select: { department: true },
    distinct: ["department"],
  });
  const departmentSolutions = userDepartment
    ? await findSolutionsWithRelations({
        where: { department: userDepartment },
        orderBy: { mau: "desc" },
        take: 6,
      })
    : await findSolutionsWithRelations({
        where: { featured: true },
        orderBy: { mau: "desc" },
        take: 6,
      });
  const recentSolutions = await findSolutionsWithRelations({
    orderBy: { createdAt: "desc" },
    take: 6,
  });
  const allSolutionRefs = await prisma.solution.findMany({
    select: { id: true, name: true },
    orderBy: { mau: "desc" },
  });

  const stats = {
    totalSolutions,
    totalMau: totalMauResult._sum.mau || 0,
    newThisMonth,
    departments: departmentsResult.length,
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient">
        <div className="max-w-[1440px] mx-auto px-6 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-8">
              <span className="material-symbols-outlined text-blue-600 text-[16px]">auto_awesome</span>
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">AI Marketplace</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
              {session?.user?.name
                ? <>Welcome back, <span className="gradient-text">{session.user.name.split(" ")[0]}</span></>
                : <>Discover <span className="gradient-text">AI Solutions</span></>}
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-xl mx-auto mb-10">
              Browse agents, copilots, automations, and analytics tools built by teams across AppsFlyer.
            </p>

            {/* AI Chat Search Bar */}
            <div className="mb-8">
              <HeroChat solutions={allSolutionRefs} />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              <Link href="/browse">
                <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800 font-semibold px-8 h-12 text-base rounded-lg">
                  Browse Solutions
                </Button>
              </Link>
              <Link href="/admin">
                <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 font-medium h-12 text-base rounded-lg">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="max-w-[1440px] mx-auto px-6 -mt-0 py-10">
        <StatsCards stats={stats} />
      </div>

      {/* Features Grid */}
      <div className="max-w-[1440px] mx-auto px-6 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            Everything you need to <span className="gradient-text">manage AI</span>
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto">
            A unified platform for discovering, tracking, and governing AI solutions across the organization.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "explore",
              bg: "bg-blue-50",
              color: "text-blue-600",
              title: "Discover Solutions",
              desc: "Browse and search through all AI solutions built across departments with powerful filtering.",
            },
            {
              icon: "monitoring",
              bg: "bg-purple-50",
              color: "text-purple-600",
              title: "Track Adoption",
              desc: "Monitor usage metrics, MAU trends, and adoption rates for every AI solution.",
            },
            {
              icon: "verified_user",
              bg: "bg-emerald-50",
              color: "text-emerald-600",
              title: "Govern & Approve",
              desc: "Manage solution lifecycle from experimental to approved, ensuring quality and compliance.",
            },
          ].map((feature) => (
            <div key={feature.title} className="card-static p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <span className={`material-symbols-outlined ${feature.color} text-2xl`}>{feature.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-[1440px] mx-auto px-6 pb-12 space-y-16">
        <DepartmentSection
          department={userDepartment}
          solutions={departmentSolutions as SolutionWithTags[]}
        />
        <RecentSolutions solutions={recentSolutions as SolutionWithTags[]} />
      </div>

      {/* CTA Section */}
      <div className="max-w-[1440px] mx-auto px-6 pb-16">
        <div className="card-static p-10 text-center rounded-3xl bg-gradient-to-r from-blue-50 to-slate-50">
          <span className="material-symbols-outlined text-5xl text-blue-600 mb-4 block">rocket_launch</span>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Ready to explore?</h2>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Discover the AI solutions transforming how AppsFlyer teams work every day.
          </p>
          <Link href="/browse">
            <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800 font-semibold px-8 rounded-lg">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
