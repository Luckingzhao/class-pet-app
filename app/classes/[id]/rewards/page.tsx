import Link from "next/link";
import { redirect } from "next/navigation";
import DrawButtonClient from "./DrawButtonClient";
import { createClient } from "../../../lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function RewardsPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 班级
  const { data: classItem } = await supabase
    .from("classes")
    .select("id, name, semester")
    .eq("id", id)
    .single();

  if (!classItem) redirect("/dashboard");

  // 学生
  const { data: students } = await supabase
    .from("students")
    .select("id, name, avatar")
    .eq("class_id", id);

  // 积分
  const { data: pointLogs } = await supabase
    .from("point_logs")
    .select("student_id, points")
    .eq("class_id", id);

  // 奖励
  const { data: rewards } = await supabase
    .from("rewards")
    .select("id, title, active")
    .eq("class_id", id);

  // 抽奖记录（历史）
  const { data: rewardLogs } = await supabase
    .from("reward_logs")
    .select("id, student_id, reward_id, created_at")
    .eq("class_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  // 映射
  const rewardMap = new Map();
  (rewards || []).forEach((r) => rewardMap.set(r.id, r));

  const studentMap = new Map();
  (students || []).forEach((s) => studentMap.set(s.id, s));

  const pointMap = new Map<string, number>();
  (pointLogs || []).forEach((l) => {
    pointMap.set(
      l.student_id,
      (pointMap.get(l.student_id) || 0) + Number(l.points || 0)
    );
  });

  const activeRewards = (rewards || []).filter((r) => r.active);

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 px-6 py-8">
      <div className="max-w-6xl mx-auto">

        <Link href={`/classes/${id}`} className="text-orange-600 text-sm">
          ← 返回班级
        </Link>

        <h1 className="text-3xl font-bold mt-2 text-gray-900">
          🎁 班级百宝箱
        </h1>

        <p className="text-gray-600 mt-1 mb-6">
          {classItem.name} · {classItem.semester}
        </p>

        {/* 学生列表 */}
        <div className="space-y-4">

          {(students || []).map((s) => {
            const score = pointMap.get(s.id) || 0;

            return (
              <div
                key={s.id}
                className="bg-white rounded-3xl shadow-sm border p-5 flex items-center justify-between"
              >

                <div className="flex items-center gap-4">
                  <div className="text-4xl">{s.avatar || "🐾"}</div>

                  <div>
                    <div className="font-bold text-gray-900 text-lg">
                      {s.name}
                    </div>

                    <div className="text-sm text-gray-600">
                      积分 {score}
                    </div>
                  </div>
                </div>

                {/* ⭐ 只控制后端 */}
                <DrawButtonClient
                  classId={id}
                  studentId={s.id}
                  studentName={s.name}
                  disabled={activeRewards.length === 0}
                />

              </div>
            );
          })}

        </div>

        {/* 历史墙 */}
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            🏆 中奖历史
          </h2>

          <div className="space-y-3">
            {(rewardLogs || []).map((log) => {
              const student = studentMap.get(log.student_id);
              const reward = rewardMap.get(log.reward_id);

              return (
                <div
                  key={log.id}
                  className="bg-white p-4 rounded-xl border flex justify-between"
                >
                  <div>
                    <div className="font-semibold text-gray-900">
                      {student?.name || "未知"}
                    </div>

                    <div className="text-sm text-gray-700">
                      {reward?.title || "未知奖励"}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </main>
  );
}