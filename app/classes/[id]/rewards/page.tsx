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

  // 班级信息
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

  // 抽奖记录（关键）
  const { data: rewardLogs } = await supabase
    .from("reward_logs")
    .select("id, student_id, reward_id, created_at")
    .eq("class_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  // 奖励
  const { data: rewards } = await supabase
    .from("rewards")
    .select("id, title, active")
    .eq("class_id", id);

  // reward 映射
  const rewardMap = new Map();
  (rewards || []).forEach((r) => {
    rewardMap.set(r.id, r);
  });

  // student 映射
  const studentMap = new Map();
  (students || []).forEach((s) => {
    studentMap.set(s.id, s);
  });

  // 积分统计
  const pointMap = new Map<string, number>();
  (pointLogs || []).forEach((l) => {
    pointMap.set(
      l.student_id,
      (pointMap.get(l.student_id) || 0) + Number(l.points || 0)
    );
  });

  function getTimes(score: number) {
    if (score >= 100) return 3;
    if (score >= 80) return 2;
    if (score >= 50) return 1;
    return 0;
  }

  const activeRewards = (rewards || []).filter((r) => r.active);

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 px-6 py-8">
      <div className="max-w-6xl mx-auto">

        {/* 返回 */}
        <Link href={`/classes/${id}`} className="text-orange-600 text-sm">
          ← 返回班级
        </Link>

        <h1 className="text-3xl font-bold mt-2 text-gray-900 drop-shadow-sm">
  🎁 班级百宝箱
</h1>

        <p className="text-gray-600 mt-1 mb-6">
          {classItem.name} · {classItem.semester}
        </p>

        {/* 提示 */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border">
          <p className="text-sm text-gray-600">
            🎯 抽奖前确认 + 顶部提示 + 中奖历史记录墙
          </p>
        </div>

        {/* 学生列表 */}
        <div className="space-y-4">

          {(students || []).map((s) => {
            const score = pointMap.get(s.id) || 0;
            const allowed = getTimes(score);

            return (
              <div
                key={s.id}
                className="bg-white rounded-3xl shadow-sm border p-5 flex items-center justify-between"
              >

                <div className="flex items-center gap-4">
                  <div className="text-4xl">
                    {s.avatar || "🐾"}
                  </div>

                  <div>
                    <div className="font-bold text-gray-900 text-lg">
  {s.name}
</div>
                    <div className="text-sm text-gray-500">
                      积分 {score} ｜ 可抽 {allowed}
                    </div>
                  </div>
                </div>

                <DrawButtonClient
                  classId={id}
                  studentId={s.id}
                  studentName={s.name}
                  disabled={allowed <= 0 || activeRewards.length === 0}
                />
              </div>
            );
          })}

        </div>

        {/* 🏆 中奖历史墙（新增重点） */}
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4 text-gray-900 drop-shadow-sm">
  🏆 中奖历史
</h2>

          <div className="space-y-3">
            {(rewardLogs || []).map((log) => {
              const student = studentMap.get(log.student_id);
              const reward = rewardMap.get(log.reward_id);

              return (
                <div
                  key={log.id}
                  className="bg-white p-4 rounded-xl shadow-sm border flex justify-between"
                >
                  <div>
                    <div className="font-semibold text-gray-900">
                      {student?.name || "未知学生"}
                    </div>

                    <div className="text-sm text-gray-900">
                      获得：{reward?.title || "未知奖励"}
                    </div>
                  </div>

                  <div className="text-xs text-gray-600">
                    {new Date(log.created_at).toLocaleString("zh-CN", {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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