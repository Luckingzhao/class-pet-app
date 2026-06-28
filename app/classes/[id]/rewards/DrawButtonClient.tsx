"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { drawReward } from "./actions";

type Props = {
  classId: string;
  studentId: string;
  studentName: string;
  disabled?: boolean;
};

export default function DrawButtonClient({
  classId,
  studentId,
  studentName,
  disabled = false,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();

  async function handleClick() {
    if (disabled) return;

    const ok = window.confirm(`确认【${studentName}】抽奖吗？`);
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

    setToast(`🎉 ${result.studentName}：${result.rewardTitle}`);

    setTimeout(() => {
      setToast(null);
      router.refresh();
    }, 1000);
  }

  return (
    <>
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-3 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}

      <button
        onClick={handleClick}
        disabled={disabled || loading}
        className={`px-4 py-2 rounded-xl font-semibold transition ${
          disabled
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:scale-105 active:scale-95"
        }`}
      >
        {disabled
          ? "❌ 不可抽奖"
          : loading
          ? "抽奖中..."
          : "🎁 抽奖"}
      </button>
    </>
  );
}