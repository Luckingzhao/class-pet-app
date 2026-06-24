"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinPage() {
  const router = useRouter();

  const [classCode, setClassCode] = useState("");
  const [name, setName] = useState("");
  const [viewCode, setViewCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleJoin() {
    setErrorMessage("");

    if (!classCode.trim() || !name.trim() || !viewCode.trim()) {
      setErrorMessage("请填写班级邀请码、学生姓名和个人查看码。");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/student/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classCode: classCode.trim().toUpperCase(),
          name: name.trim(),
          viewCode: viewCode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "验证失败，请检查信息是否正确。");
        return;
      }

      router.push(`/student/${data.student.id}?code=${viewCode.trim()}`);
    } catch {
      setErrorMessage("网络异常，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-blue-50 px-6 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-4xl items-center justify-center">
        <div className="w-full max-w-xl rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <div className="text-center">
            <div className="text-6xl">🐾</div>

            <h1 className="mt-5 text-3xl font-black text-gray-900">
              加入班级宠物乐园
            </h1>

            <p className="mt-3 text-gray-500">
              输入老师提供的班级邀请码、你的姓名和个人查看码。
            </p>
          </div>

          {errorMessage ? (
            <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                班级邀请码
              </label>
              <input
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                placeholder="例如：ABC123"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                学生姓名
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入老师添加的姓名"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                个人查看码
              </label>
              <input
                value={viewCode}
                onChange={(e) => setViewCode(e.target.value)}
                placeholder="请输入老师给你的6位查看码"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <button
              type="button"
              onClick={handleJoin}
              disabled={loading}
              className="w-full rounded-2xl bg-green-600 px-5 py-3 text-base font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? "验证中..." : "进入我的宠物页面"}
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}