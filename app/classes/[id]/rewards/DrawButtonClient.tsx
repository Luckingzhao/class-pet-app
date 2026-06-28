"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { drawReward } from "./actions";

export default function DrawButtonClient({
  classId,
  studentId,
  studentName,
  disabled,
}: {
  classId: string;
  studentId: string;
  studentName: string;
  disabled: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const router = useRouter();

  async function handleClick() {
    const ok = window.confirm(`确认让【${studentName}】抽奖吗？`);
    if (!ok) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("classId", classId);
    formData.append("studentId", studentId);

    const result: any = await drawReward(formData);

    setLoading(false);

    if (!result?.success) {
      alert(result?.error || "抽奖失败");
      return;
    }

    setToast(`🎉 ${result.studentName} 抽中了：${result.rewardTitle}`);

    setTimeout(() => {
      setToast(null);
      router.refresh(); // ✅ 核心：刷新中奖历史墙
    }, 1200);
  }

  return (
    <>
      {/* 🎉 顶部提示 */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-3 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}

      {/* 🎁 按钮 */}
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-xl font-semibold shadow hover:scale-105 active:scale-95 transition disabled:bg-gray-300"
      >
        {loading ? "抽奖中..." : "🎁 抽取奖励"}
      </button>
    </>
  );
}