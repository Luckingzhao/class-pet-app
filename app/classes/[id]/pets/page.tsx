import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
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

function getPetEmoji(type: string) {
  if (type === "dog") return "🐶";
  if (type === "rabbit") return "🐰";
  if (type === "dragon") return "🐉";
  return "🐱";
}

function getMoodLabel(mood: number) {
  if (mood >= 80) return "😄 很开心";
  if (mood >= 50) return "🙂 正常";
  return "😢 需要关心";
}

function getHungerLabel(hunger: number) {
  if (hunger >= 80) return "🍖 很饱";
  if (hunger >= 50) return "🍔 一般";
  return "🍽️ 饿了";
}

function getPetFromStudent(student: StudentItem) {
  if (!student.pets) return null;
  if (Array.isArray(student.pets)) return student.pets[0] || null;
  return student.pets;
}

export default async function PetsPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: classItem, error: classError } = await supabase
    .from("classes")
    .select("id, name")
    .eq("id", id)
    .eq("teacher_id", user.id)
    .single();

  if (classError || !classItem) {
    redirect("/dashboard");
  }

  const { data: students, error } = await supabase
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

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">

        {/* 返回导航 */}
        <div className="mb-6 flex justify-between">
          <Link
            href={`/classes/${id}`}
            className="text-sm text-green-700 hover:text-green-800"
          >
            ← 返回班级
          </Link>

          <Link
            href={`/classes/${id}/checkin`}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            去打卡加分 →
          </Link>
        </div>

        {/* 标题 */}
        <header className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h1 className="text-3xl font-bold text-gray-900">
            🐾 宠物园
          </h1>
          <p className="mt-2 text-gray-500">
            {classItem.name} · 全班宠物状态
          </p>
        </header>

        {/* 宠物列表 */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {students && students.length > 0 ? (
            students.map((student) => {
              const s = student as StudentItem;
              const pet = getPetFromStudent(s);

              return (
                <div
                  key={s.id}
                  className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:-translate-y-1"
                >
                  {/* 宠物图标 */}
                  <div className="text-5xl animate-bounce hover:scale-125 transition-transform duration-200">
                    {s.avatar || "🐾"}
                  </div>

                  {/* 学生 */}
                  <h2 className="mt-4 text-xl font-bold text-gray-900">
                    {s.name}
                  </h2>

                  <p className="text-sm font-medium text-gray-600">
  {s.group_name || "未分组"}
</p>

                  {/* 宠物信息 */}
                  {pet ? (
                    <div className="mt-4 space-y-2 text-sm text-gray-700">
  <p className="font-medium">🐣 等级：Lv.{pet.level}</p>
  <div>
  <p className="font-medium">⭐ 经验：{pet.exp}/100</p>

  <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
    <div
      className="h-2 rounded-full bg-green-500"
      style={{ width: `${Math.min(pet.exp, 100)}%` }}
    />
  </div>
</div>
  <p>
  😊 心情：
  <span className="ml-2 rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
    {getMoodLabel(pet.mood)}
  </span>
</p>
  <p className="font-medium">🍽️ 饥饿：{getHungerLabel(pet.hunger)}</p>
</div>
                  ) : (
                    <p className="mt-4 text-sm text-gray-400">
                      暂无宠物
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">暂无学生数据</p>
          )}
        </section>
      </div>
    </main>
  );
}