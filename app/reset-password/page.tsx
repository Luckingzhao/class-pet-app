"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "../lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdatePassword() {
    setMessage("");
    setErrorMessage("");

    if (!password || !confirmPassword) {
      setErrorMessage("请输入新密码并再次确认。");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("密码长度至少需要 6 位。");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("两次输入的密码不一致。");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("密码已修改成功，请返回登录页面重新登录。");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-blue-50 px-6 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
        <div className="w-full rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <div className="text-center">
            <div className="text-5xl">✅</div>

            <h1 className="mt-5 text-3xl font-black text-gray-900">
              设置新密码
            </h1>

            <p className="mt-3 text-gray-500">
              请输入新的老师登录密码。
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
                新密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入新密码"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700">
                确认新密码
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入新密码"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <button
              type="button"
              onClick={handleUpdatePassword}
              disabled={loading}
              className="w-full rounded-2xl bg-green-600 px-5 py-3 font-black text-white hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? "修改中..." : "修改密码"}
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