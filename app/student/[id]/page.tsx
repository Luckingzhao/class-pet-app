import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
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

type ClassItem = {
  id: string;
  name: string;
  grade: string | null;
  semester: string | null;
};

type StudentItem = {
  id: string;
  name: string;
  student_no: string | null;
  group_name: string | null;
  classes: ClassItem | ClassItem[] | null;
  pets: PetItem | PetItem[] | null;
};

type LogItem = {
  id: string;
  points: number;
  reason: string | null;
  created_at: string;
};

function getPetFromStudent(student: StudentItem) {
  if (!student.pets) return null;
  if (Array.isArray(student.pets)) return student.pets[0] || null;
  return student.pets;
}

function getClassFromStudent(student: StudentItem) {
  if (!student.classes) return null;
  if (Array.isArray(student.classes)) return student.classes[0] || null;
  return student.classes;
}

function getPetEmoji(type: string) {
  if (type === "dog") return "🐶";
  if (type === "rabbit") return "🐰";
  if (type === "dragon") return "🐉";
  return "🐱";
}

function getMoodLabel(mood: number) {
  if (mood >= 80) return "😄 很开心";
  if (mood >= 50) return "🙂 状态不错";
  return "😢 需要鼓励";
}

function getHungerLabel(hunger: number) {
  if (hunger >= 80) return "🍖 很饱";
  if (hunger >= 50) return "🍔 还可以";
  return "🍽️ 有点饿";
}

function getLevelProgress(exp: number) {
  return exp % 100;
}

function getPointText(points: number) {
  return points > 0 ? `+${points}` : `${points}`;
}

function getPointStyle(points: number) {
  if (points > 0) {
    return "bg-green-50 text-green-700";
  }

  return "bg-red-50 text-red-700";
}

function formatDate(dateText: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateText));
}

export default async function StudentPetPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: studentData, error } = await supabase
    .from("students")
    .select(`
      id,
      name,
      student_no,
      group_name,
      classes (
        id,
        name,
        grade,
        semester
      ),
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
    .eq("id", id)
    .single();

  if (error || !studentData) {
    notFound();
  }

  const { data: logs, error: logsError } = await supabase
    .from("point_logs")
    .select("id, points, reason, created_at")
    .eq("student_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  if (logsError) {
    throw new Error(logsError.message);
  }

  const student = studentData as StudentItem;
  const pet = getPetFromStudent(student);
  const classItem = getClassFromStudent(student);
  const progress = pet ? getLevelProgress(pet.exp) : 0;
  const typedLogs = (logs || []) as LogItem[];

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-blue-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex justify-between">
          <Link
            href="/join"
            className="rounded-full bg-white/80 px-5 py-2 text-sm font-semibold text-green-700 shadow-sm hover:bg-white"
          >
            ← 返回加入页面
          </Link>
        </div>

        <section className="rounded-[2rem] bg-white p-8 text-center shadow-sm ring-1 ring-gray-100">
          <p className="text-sm font-semibold text-green-700">
            我的班级宠物
          </p>

          <h1 className="mt-3 text-4xl font-black text-gray-900">
            {student.name}
          </h1>

          <p className="mt-2 text-gray-500">
            {classItem?.name || "未知班级"} · {student.group_name || "未分组"}
          </p>

          {pet ? (
            <div className="mt-10">
              <div className="text-8xl">
                {getPetEmoji(pet.pet_type)}
              </div>

              <h2 className="mt-6 text-3xl font-black text-gray-900">
                {pet.name}
              </h2>

              <div className="mx-auto mt-6 max-w-md rounded-3xl bg-green-50 p-6">
                <p className="text-2xl font-black text-green-700">
                  Lv.{pet.level}
                </p>

                <p className="mt-2 text-sm font-medium text-green-700">
                  当前经验：{pet.exp}
                </p>

                <div className="mt-4 h-3 w-full rounded-full bg-white">
                  <div
                    className="h-3 rounded-full bg-green-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="mt-2 text-xs text-green-700">
                  距离下一等级：{progress}/100
                </p>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-yellow-50 p-5 text-yellow-700">
                  <p className="text-sm font-semibold">心情状态</p>
                  <p className="mt-2 text-xl font-black">
                    {getMoodLabel(pet.mood)}
                  </p>
                </div>

                <div className="rounded-3xl bg-blue-50 p-5 text-blue-700">
                  <p className="text-sm font-semibold">饥饿状态</p>
                  <p className="mt-2 text-xl font-black">
                    {getHungerLabel(pet.hunger)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-10 rounded-3xl border border-dashed border-gray-300 p-10">
              <p className="text-gray-500">
                老师还没有为你生成宠物。
              </p>
            </div>
          )}
        </section>

        <section className="mt-8 rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                最近成长记录
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                这里会显示老师最近给你的加分和扣分记录。
              </p>
            </div>

            <div className="text-4xl">📒</div>
          </div>

          <div className="mt-6 space-y-4">
            {typedLogs.length > 0 ? (
              typedLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div>
                    <p className="font-bold text-gray-900">
                      {log.reason || "成长记录"}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatDate(log.created_at)}
                    </p>
                  </div>

                  <div
                    className={`rounded-full px-4 py-2 text-lg font-black ${getPointStyle(
                      log.points
                    )}`}
                  >
                    {getPointText(log.points)}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center">
                <p className="text-gray-500">
                  还没有成长记录。继续努力，等待老师给你记录表现吧！
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}