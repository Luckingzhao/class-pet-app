import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import {
  createReward,
  deleteReward,
  drawReward,
  initDefaultRewards,
  toggleRewardActive,
} from "./actions";

type PageProps = {
  params: Promise<{ id: string }>;
};

type StudentItem = {
  id: string;
  name: string;
  student_no: string | null;
  group_name: string | null;
  avatar: string | null;
};

type PointLogItem = {
  student_id: string;
  points: number;
};

type RewardItem = {
  id: string;
  title: string;
  description: string | null;
  active: boolean;
  created_at: string;
};

type RewardLogItem = {
  id: string;
  student_id: string;
  reward_id: string;
  created_at: string;
};

function getDrawTimes(totalPoints: number) {
  if (totalPoints >= 100) return 3;
  if (totalPoints >= 80) return 2;
  if (totalPoints >= 50) return 1;
  return 0;
}

function formatTime(value: string) {
  return new Date(value).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function RewardsPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: classItem } = await supabase
    .from("classes")
    .select("id, name, semester, teacher_id")
    .eq("id", id)
    .eq("teacher_id", user.id)
    .single();

  if (!classItem) {
    redirect("/dashboard");
  }

  const { data: studentsData } = await supabase
    .from("students")
    .select("id, name, student_no, group_name, avatar")
    .eq("class_id", id)
    .order("created_at", { ascending: true });

  const students = (studentsData || []) as StudentItem[];

  const { data: pointLogsData } = await supabase
    .from("point_logs")
    .select("student_id, points")
    .eq("class_id", id);

  const pointLogs = (pointLogsData || []) as PointLogItem[];

  const { data: rewardsData } = await supabase
    .from("rewards")
    .select("id, title, description, active, created_at")
    .eq("class_id", id)
    .order("created_at", { ascending: true });

  const rewards = (rewardsData || []) as RewardItem[];

  const { data: rewardLogsData } = await supabase
    .from("reward_logs")
    .select("id, student_id, reward_id, created_at")
    .eq("class_id", id)
    .order("created_at", { ascending: false });

  const rewardLogs = (rewardLogsData || []) as RewardLogItem[];

  const studentPointMap = new Map<string, number>();
  pointLogs.forEach((log) => {
    const oldValue = studentPointMap.get(log.student_id) || 0;
    studentPointMap.set(log.student_id, oldValue + Number(log.points || 0));
  });

  const usedDrawMap = new Map<string, number>();
  rewardLogs.forEach((log) => {
    const oldValue = usedDrawMap.get(log.student_id) || 0;
    usedDrawMap.set(log.student_id, oldValue + 1);
  });

  const rewardMap = new Map<string, RewardItem>();
  rewards.forEach((reward) => {
    rewardMap.set(reward.id, reward);
  });

  const studentMap = new Map<string, StudentItem>();
  students.forEach((student) => {
    studentMap.set(student.id, student);
  });

  const activeRewards = rewards.filter((reward) => reward.active);

  const studentRows = students.map((student) => {
    const totalPoints = studentPointMap.get(student.id) || 0;
    const allowedDrawTimes = getDrawTimes(totalPoints);
    const usedDrawTimes = usedDrawMap.get(student.id) || 0;
    const remainingTimes = Math.max(0, allowedDrawTimes - usedDrawTimes);

    return {
      student,
      totalPoints,
      allowedDrawTimes,
      usedDrawTimes,
      remainingTimes,
    };
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href={`/classes/${id}`}
              className="mb-3 inline-block text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              ← 返回班级控制台
            </Link>

            <h1 className="text-3xl font-bold text-gray-900">
              🎁 班级百宝箱
            </h1>

            <p className="mt-2 text-gray-600">
              {classItem.name} · {classItem.semester || "未设置学期"}
            </p>
          </div>

          <form action={initDefaultRewards.bind(null, id)}>
            <button
              type="submit"
              className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
            >
              一键生成默认奖励
            </button>
          </form>
        </div>

        <section className="mb-8 rounded-3xl border border-orange-100 bg-white/90 p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">奖励规则</h2>
              <p className="mt-1 text-sm text-gray-500">
                累计积分达到 50 分抽 1 次，80 分抽 2 次，100 分抽 3 次。
              </p>
            </div>

            <div className="rounded-2xl bg-orange-50 px-4 py-3 text-sm text-orange-700">
              当前启用奖励：{activeRewards.length} 个
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
              <div className="text-2xl font-bold text-orange-600">50 分</div>
              <div className="mt-1 text-sm text-gray-600">获得 1 次抽奖机会</div>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
              <div className="text-2xl font-bold text-orange-600">80 分</div>
              <div className="mt-1 text-sm text-gray-600">获得 2 次抽奖机会</div>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
              <div className="text-2xl font-bold text-orange-600">100 分</div>
              <div className="mt-1 text-sm text-gray-600">获得 3 次抽奖机会</div>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <section className="rounded-3xl border border-orange-100 bg-white/90 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">奖励池</h2>
            <p className="mt-1 text-sm text-gray-500">
              老师可以添加、停用或删除奖励。
            </p>

            <form action={createReward} className="mt-5 space-y-3">
              <input type="hidden" name="classId" value={id} />

              <input
                name="title"
                required
                placeholder="奖励名称，例如：免作业一次"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />

              <textarea
                name="description"
                placeholder="奖励说明，可不填"
                rows={3}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />

              <button
                type="submit"
                className="w-full rounded-2xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800"
              >
                添加奖励
              </button>
            </form>

            <div className="mt-6 space-y-3">
              {rewards.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50 p-5 text-center text-sm text-orange-700">
                  还没有奖励。可以点击“一键生成默认奖励”。
                </div>
              ) : (
                rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className={`rounded-2xl border p-4 ${
                      reward.active
                        ? "border-orange-100 bg-white"
                        : "border-gray-100 bg-gray-50 opacity-70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {reward.title}
                        </h3>

                        {reward.description ? (
                          <p className="mt-1 text-sm text-gray-500">
                            {reward.description}
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-gray-400">
                            暂无说明
                          </p>
                        )}

                        <div className="mt-2 text-xs text-gray-400">
                          {reward.active ? "已启用" : "已停用"}
                        </div>
                      </div>

                      <span className="text-2xl">🎁</span>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <form action={toggleRewardActive}>
                        <input type="hidden" name="classId" value={id} />
                        <input type="hidden" name="rewardId" value={reward.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={String(reward.active)}
                        />

                        <button
                          type="submit"
                          className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          {reward.active ? "停用" : "启用"}
                        </button>
                      </form>

                      <form action={deleteReward}>
                        <input type="hidden" name="classId" value={id} />
                        <input type="hidden" name="rewardId" value={reward.id} />

                        <button
                          type="submit"
                          className="rounded-xl border border-red-100 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          删除
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="space-y-8">
            <div className="rounded-3xl border border-orange-100 bg-white/90 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">学生抽奖状态</h2>
              <p className="mt-1 text-sm text-gray-500">
                系统会根据学生累计积分自动计算可抽奖次数。
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {studentRows.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                    这个班级还没有学生。
                  </div>
                ) : (
                  studentRows.map((row) => (
                    <div
                      key={row.student.id}
                      className="rounded-3xl border border-orange-100 bg-gradient-to-br from-white to-orange-50 p-5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                            {row.student.avatar || "🐾"}
                          </div>

                          <div>
                            <h3 className="font-bold text-gray-900">
                              {row.student.name}
                            </h3>

                            <p className="mt-1 text-xs text-gray-500">
                              {row.student.group_name || "未分组"} ·{" "}
                              {row.student.student_no || "未编号"}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-white px-3 py-2 text-center shadow-sm">
                          <div className="text-lg font-bold text-orange-600">
                            {row.totalPoints}
                          </div>
                          <div className="text-xs text-gray-400">积分</div>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-2xl bg-white p-3">
                          <div className="font-bold text-gray-900">
                            {row.allowedDrawTimes}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            可抽
                          </div>
                        </div>

                        <div className="rounded-2xl bg-white p-3">
                          <div className="font-bold text-gray-900">
                            {row.usedDrawTimes}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            已抽
                          </div>
                        </div>

                        <div className="rounded-2xl bg-white p-3">
                          <div className="font-bold text-orange-600">
                            {row.remainingTimes}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            剩余
                          </div>
                        </div>
                      </div>

                      <form action={drawReward} className="mt-5">
                        <input type="hidden" name="classId" value={id} />
                        <input
                          type="hidden"
                          name="studentId"
                          value={row.student.id}
                        />

                        <button
                          type="submit"
                          disabled={row.remainingTimes <= 0 || activeRewards.length === 0}
                          className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          {row.remainingTimes > 0
                            ? "🎁 抽取奖励"
                            : "暂无抽奖次数"}
                        </button>
                      </form>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-orange-100 bg-white/90 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">最近抽奖记录</h2>

              <div className="mt-5 space-y-3">
                {rewardLogs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                    还没有抽奖记录。
                  </div>
                ) : (
                  rewardLogs.slice(0, 20).map((log) => {
                    const student = studentMap.get(log.student_id);
                    const reward = rewardMap.get(log.reward_id);

                    return (
                      <div
                        key={log.id}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-2xl">
                            {student?.avatar || "🐾"}
                          </div>

                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {student?.name || "未知学生"} 抽中了{" "}
                              <span className="text-orange-600">
                                {reward?.title || "未知奖励"}
                              </span>
                            </div>

                            <div className="mt-1 text-xs text-gray-500">
                              {formatTime(log.created_at)}
                            </div>
                          </div>
                        </div>

                        <div className="text-2xl">🎉</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}