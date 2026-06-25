import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { applyPointRule } from "./actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    rule?: string;
  }>;
};

type RuleItem = {
  id: string;
  title: string;
  points: number;
  category: string;
  active: boolean;
};

type PetItem = {
  id: string;
  name: string;
  pet_type: string;
  level: number;
  exp: number;
  mood: number;
  hunger: number;
};

type StudentItem = {
  id: string;
  name: string;
  student_no: string | null;
  group_name: string | null;
  avatar: string | null;
  pets: PetItem | PetItem[] | null;
};

type LogStudent = {
  name: string;
};

type LogItem = {
  id: string;
  points: number;
  reason: string | null;
  created_at: string;
  students: LogStudent | LogStudent[] | null;
};

function getPetEmoji(petType: string) {
  if (petType === "dog") return "🐶";
  if (petType === "rabbit") return "🐰";
  if (petType === "dragon") return "🐉";
  return "🐱";
}

function getPetFromStudent(student: StudentItem) {
  if (!student.pets) return null;
  if (Array.isArray(student.pets)) return student.pets[0] || null;
  return student.pets;
}

function getMoodLabel(mood: number) {
  if (mood >= 80) return "开心";
  if (mood >= 50) return "平静";
  return "需要鼓励";
}

function getPointText(points: number) {
  return points > 0 ? `+${points}` : `${points}`;
}

function getStudentNameFromLog(log: LogItem) {
  if (!log.students) return "未知学生";
  if (Array.isArray(log.students)) {
    return log.students[0]?.name || "未知学生";
  }
  return log.students.name;
}

export default async function CheckinPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { rule: selectedRuleId } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: classItem, error: classError } = await supabase
    .from("classes")
    .select("id, name, grade, semester, invite_code")
    .eq("id", id)
    .eq("teacher_id", user.id)
    .single();

  if (classError || !classItem) {
    redirect("/dashboard");
  }

  const { data: rules, error: rulesError } = await supabase
    .from("point_rules")
    .select("id, title, points, category, active")
    .eq("class_id", id)
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (rulesError) {
    throw new Error(rulesError.message);
  }

  const selectedRule =
    rules?.find((rule) => rule.id === selectedRuleId) || rules?.[0] || null;

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select(`
      id,
      name,
      student_no,
      group_name,
      avatar,
      pets (
        id,
        name,
        pet_type,
        level,
        exp,
        mood,
        hunger
      )
    `)
    .eq("class_id", id)
    .order("created_at", { ascending: false });

  if (studentsError) {
    throw new Error(studentsError.message);
  }

  const { data: logs, error: logsError } = await supabase
    .from("point_logs")
    .select(`
      id,
      points,
      reason,
      created_at,
      students (
        name
      )
    `)
    .eq("class_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  if (logsError) {
    throw new Error(logsError.message);
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/classes/${id}`}
            className="text-sm font-medium text-green-700 hover:text-green-800"
          >
            ← 返回班级详情
          </Link>

          <Link
            href={`/classes/${id}/rules`}
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            管理积分规则
          </Link>
        </div>

        <header className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm text-gray-500">打卡加分</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {classItem.name}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            选择一条规则，然后点击学生卡片进行加分或扣分。
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="text-xl font-bold text-gray-900">选择规则</h2>

              {rules && rules.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {rules.map((rule: RuleItem) => {
                    const isSelected = selectedRule?.id === rule.id;

                    return (
                      <Link
                        key={rule.id}
                        href={`/classes/${id}/checkin?rule=${rule.id}`}
                        className={`block rounded-2xl border p-4 transition ${
                          isSelected
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm text-gray-500">
                              {rule.category}
                            </p>
                            <h3 className="mt-1 font-bold text-gray-900">
                              {rule.title}
                            </h3>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-sm font-bold ${
                              rule.points > 0
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {getPointText(rule.points)}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-6 text-center">
                  <p className="text-sm text-gray-500">还没有启用的积分规则。</p>
                  <Link
                    href={`/classes/${id}/rules`}
                    className="mt-3 inline-block text-sm font-semibold text-green-700"
                  >
                    去创建规则
                  </Link>
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="text-xl font-bold text-gray-900">最近记录</h2>

              <div className="mt-6 space-y-3">
                {logs && logs.length > 0 ? (
                  logs.map((log: LogItem) => (
                    <div
                      key={log.id}
                      className="rounded-2xl bg-gray-50 p-4 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">
                          {getStudentNameFromLog(log)}
                        </span>
                        <span
                          className={
                            log.points > 0 ? "text-green-700" : "text-red-600"
                          }
                        >
                          {getPointText(log.points)}
                        </span>
                      </div>
                      <p className="mt-1 text-gray-500">
                        {log.reason || "无备注"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">暂无打卡记录。</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 lg:col-span-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">学生打卡</h2>
                <p className="mt-2 text-sm text-gray-500">
                  当前选择：
                  {selectedRule ? (
                    <span className="font-semibold text-green-700">
                      {selectedRule.title} {getPointText(selectedRule.points)}
                    </span>
                  ) : (
                    <span className="text-red-600">请先创建并选择规则</span>
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {students && students.length > 0 ? (
                students.map((student) => {
                  const typedStudent = student as StudentItem;
                  const pet = getPetFromStudent(typedStudent);

                  return (
                    <form
                      key={typedStudent.id}
                      action={
                        selectedRule
                          ? applyPointRule.bind(
                              null,
                              id,
                              typedStudent.id,
                              selectedRule.id
                            )
                          : undefined
                      }
                    >
                      <button
                        disabled={!selectedRule}
                        className="w-full rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-4xl">
                            {typedStudent.avatar || "🐾"}
                          </div>

                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {typedStudent.name}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {typedStudent.group_name || "未分组"} ·{" "}
                              {typedStudent.student_no || "无编号"}
                            </p>
                            {pet && (
                              <p className="mt-1 text-sm text-green-700">
                                Lv.{pet.level} · 经验 {pet.exp} ·{" "}
                                {getMoodLabel(pet.mood)}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    </form>
                  );
                })
              ) : (
                <div className="col-span-full rounded-2xl border border-dashed border-gray-300 p-10 text-center">
                  <p className="text-gray-500">还没有学生。</p>
                  <Link
                    href={`/classes/${id}/students`}
                    className="mt-3 inline-block text-sm font-semibold text-green-700"
                  >
                    去添加学生
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}