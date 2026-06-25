"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "../lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResetPassword() {
    setMessage("");
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("请输入注册邮箱。");
      return;
    }

    setLoading(true);

    const siteUrl = window.location.origin;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${siteUrl}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("重置密码邮件已发送，请到邮箱中查看。");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-blue-50 px-6 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
        <div className="w-full rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <div className="text-center">
            <div className="text-5xl">🔐</div>

            <h1 className="mt-5 text-3xl font-black text-gray-900">
              忘记密码
            </h1>

            <p className="mt-3 text-gray-500">
              输入老师注册时使用的邮箱，我们会发送一封重置密码邮件。
            </p>
          </div>

          {message ? (
            <div className="mt-6 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
              {message}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-bold text-gray-700">
                注册邮箱
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <button
              type="button"
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full rounded-2xl bg-green-600 px-5 py-3 font-black text-white hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? "发送中..." : "发送重置密码邮件"}
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm font-bold text-green-700 hover:text-green-800"
            >
              返回老师登录
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}