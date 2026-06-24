import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

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

type StudentItem = {
  id: string;
  name: string;
  student_no: string | null;
  group_name: string | null;
  pets: PetItem | PetItem[] | null;
};

function getPetFromStudent(student: StudentItem) {
  if (!student.pets) return null;
  if (Array.isArray(student.pets)) return student.pets[0] || null;
  return student.pets;
}

function getPetEmoji(type: string) {
  if (type === "dog") return "🐶";
  if (type === "rabbit") return "🐰";
  if (type === "dragon") return "🐉";
  return "🐱";
}

function getMoodLabel(mood: number) {
  if (mood >= 80) return "开心";
  if (mood >= 50) return "平静";
  return "需要鼓励";
}

function getRankIcon(index: number) {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return `#${index + 1}`;
}

export default async function LeaderboardPage({ params }: PageProps) {
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
    .select("id, name, grade, semester, invite_code")
    .eq("id", id)
    .eq("teacher_id", user.id)
    .single();

  if (classError || !classItem) {
    redirect("/dashboard");
  }

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select(`
      id,
      name,
      student_no,
      group_name,
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
    .eq("class_id", id);

  if (studentsError) {
    throw new Error(studentsError.message);
  }

  const rankedStudents = (students || [])
    .map((student) => {
      const typedStudent = student as StudentItem;
      const pet = getPetFromStudent(typedStudent);

      return {
        student: typedStudent,
        pet,
        score: pet ? pet.exp : 0,
        level: pet ? pet.level : 1,
      };
    })
    .sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      return b.score - a.score;
    });

  const topThree = rankedStudents.slice(0, 3);

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
            href={`/classes/${id}/checkin`}
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            去打卡加分 →
          </Link>
        </div>

        <header className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm text-gray-500">排行榜</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {classItem.name}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            根据宠物等级和经验值排序。排行榜用于鼓励成长，不显示负面评价。
          </p>
        </header>

        <section className="mb-8 grid gap-5 md:grid-cols-3">
          {topThree.length > 0 ? (
            topThree.map((item, index) => (
              <div
                key={item.student.id}
                className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-100"
              >
                <div className="text-4xl">{getRankIcon(index)}</div>
                <div className="mt-4 text-5xl">
                  {item.pet ? getPetEmoji(item.pet.pet_type) : "🐾"}
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-900">
                  {item.student.name}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {item.student.group_name || "未分组"}
                </p>
                <div className="mt-4 rounded-2xl bg-green-50 p-4 text-sm text-green-700">
                  Lv.{item.level} · 经验 {item.score}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <p className="text-gray-500">暂无学生数据。</p>
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-xl font-bold text-gray-900">全班成长榜</h2>
          <p className="mt-2 text-sm text-gray-500">
            按等级优先、经验值其次进行排序。
          </p>

          <div className="mt-6 space-y-4">
            {rankedStudents.length > 0 ? (
              rankedStudents.map((item, index) => {
                const pet = item.pet;

                return (
                  <div
                    key={item.student.id}
                    className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-lg font-bold text-gray-700">
                        {getRankIcon(index)}
                      </div>

                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-4xl">
                        {pet ? getPetEmoji(pet.pet_type) : "🐾"}
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {item.student.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.student.group_name || "未分组"} ·{" "}
                          {item.student.student_no || "无编号"}
                        </p>
                      </div>
                    </div>

                    {pet ? (
                      <div className="grid grid-cols-3 gap-3 text-center text-sm sm:min-w-[300px]">
                        <div className="rounded-xl bg-green-50 px-3 py-2 text-green-700">
                          <p className="font-bold">Lv.{pet.level}</p>
                          <p className="text-xs">等级</p>
                        </div>

                        <div className="rounded-xl bg-amber-50 px-3 py-2 text-amber-700">
                          <p className="font-bold">{pet.exp}</p>
                          <p className="text-xs">经验</p>
                        </div>

                        <div className="rounded-xl bg-blue-50 px-3 py-2 text-blue-700">
                          <p className="font-bold">{getMoodLabel(pet.mood)}</p>
                          <p className="text-xs">心情</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">暂无宠物</p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center">
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
        </section>
      </div>
    </main>
  );
}