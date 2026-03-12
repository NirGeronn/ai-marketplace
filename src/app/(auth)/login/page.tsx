"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [email, setEmail] = useState("admin@appsflyer.com");
  const [name, setName] = useState("Mark Samuelson");

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md">
        {/* Clean white card */}
        <div className="card-static p-8 rounded-2xl shadow-lg">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/appsflyer-logo.png"
              alt="AppsFlyer"
              width={160}
              height={38}
              className="brightness-0 h-8 w-auto opacity-90"
              priority
            />
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500">
              Sign in with your AppsFlyer account to continue
            </p>
          </div>

          {/* SSO Button */}
          <Button
            className="w-full bg-slate-900 text-white hover:bg-slate-800 font-semibold h-12 text-base"
            size="lg"
            onClick={() => signIn("okta", { callbackUrl })}
          >
            <span className="material-symbols-outlined text-[20px] mr-2">shield</span>
            Sign in with Okta SSO
          </Button>

          {/* Dev login */}
          {process.env.NODE_ENV === "development" && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-slate-400">or use developer access</span>
                </div>
              </div>
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 h-11 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 h-11 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <Button
                  variant="outline"
                  className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 h-11"
                  onClick={() =>
                    signIn("credentials", { email, name, callbackUrl })
                  }
                >
                  <span className="material-symbols-outlined text-[18px] mr-2">code</span>
                  Dev Sign In
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-slate-400 mt-6">
          By signing in, you agree to AppsFlyer&apos;s internal usage policies.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
