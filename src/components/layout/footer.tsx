import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="footer-dark mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/appsflyer-logo.png"
              alt="AppsFlyer"
              width={140}
              height={32}
              className="brightness-0 invert h-7 w-auto mb-4 opacity-90"
            />
            <p className="text-sm text-slate-400 leading-relaxed">
              Internal AI Marketplace for discovering and managing AI solutions.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-400 uppercase text-xs tracking-widest">Product</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <Link href="/browse" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Browse Solutions
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-400 uppercase text-xs tracking-widest">Solutions</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <Link href="/browse?type=AGENT" className="text-slate-400 hover:text-blue-400 transition-colors">
                  AI Agents
                </Link>
              </li>
              <li>
                <Link href="/browse?type=COPILOT" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Copilots
                </Link>
              </li>
              <li>
                <Link href="/browse?type=AUTOMATION" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Automations
                </Link>
              </li>
              <li>
                <Link href="/browse?type=ANALYTICS" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-400 uppercase text-xs tracking-widest">Resources</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><span className="text-slate-400">Documentation</span></li>
              <li><span className="text-slate-400">Guidelines</span></li>
              <li><span className="text-slate-400">Support</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} AppsFlyer. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">
            Internal tool &middot; For AppsFlyer employees only
          </p>
        </div>
      </div>
    </footer>
  );
}
