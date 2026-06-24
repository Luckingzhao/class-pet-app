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
  return "加油";
}

function getRankIcon(index: number) {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return "";
}

export default async function DisplayPage({ params }: PageProps) {
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
        level: pet ? pet.level : 1,
        exp: pet ? pet.exp : 0,
      };
    })
    .sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      return b.exp - a.exp;
    });

  const topThree = rankedStudents.slice(0, 3);

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-blue-50 px-8 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={`/classes/${id}`}
            className="rounded-full bg-white/80 px-5 py-2 text-sm font-semibold text-green-700 shadow-sm hover:bg-white"
          >
            ← 返回班级
          </Link>

          <Link
            href={`/classes/${id}/checkin`}
            className="rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
          >
            去打卡加分 →
          </Link>
        </div>

        <header className="mb-8 rounded-[2rem] bg-white/80 p-8 text-center shadow-sm ring-1 ring-white">
          <p className="text-lg font-semibold text-green-700">班级课件宠物积分大屏</p>

          <h1 className="mt-3 text-5xl font-black tracking-tight text-gray-900">
            🐾 {classItem.name} 宠物乐园
          </h1>

          <p className="mt-4 text-lg text-gray-600">
            一起成长，一起进步，每一次努力都会让宠物变得更强！
          </p>
        </header>

        <section className="mb-8 grid gap-5 md:grid-cols-3">
          {topThree.length > 0 ? (
            topThree.map((item, index) => (
              <div
                key={item.student.id}
                className="rounded-[2rem] bg-white p-7 text-center shadow-md ring-1 ring-gray-100"
              >
                <div className="text-5xl">{getRankIcon(index)}</div>

                <div className="mt-4 text-7xl">
                  {item.pet ? getPetEmoji(item.pet.pet_type) : "🐾"}
                </div>

                <h2 className="mt-5 text-3xl font-black text-gray-900">
                  {item.student.name}
                </h2>

                <p className="mt-2 text-base font-medium text-gray-500">
                  {item.student.group_name || "未分组"}
                </p>

                <div className="mt-5 rounded-2xl bg-green-50 px-5 py-4 text-xl font-bold text-green-700">
                  Lv.{item.level} · {item.exp} 经验
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-[2rem] bg-white p-10 text-center shadow-sm">
              <p className="text-xl text-gray-500">暂无学生数据</p>
            </div>
          )}
        </section>

        <section className="rounded-[2rem] bg-white/80 p-8 shadow-sm ring-1 ring-white">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-black text-gray-900">全班宠物墙</h2>
              <p className="mt-2 text-gray-500">
                当前共有 {rankedStudents.length} 位同学加入宠物乐园
              </p>
            </div>

            <div className="rounded-full bg-yellow-100 px-5 py-2 text-sm font-bold text-yellow-700">
              邀请码：{classItem.invite_code}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {rankedStudents.length > 0 ? (
              rankedStudents.map((item, index) => {
                const pet = item.pet;

                return (
                  <div
                    key={item.student.id}
                    className="rounded-3xl bg-white p-5 text-center shadow-sm ring-1 ring-gray-100"
                  >
                    <div className="text-xl font-black text-gray-400">
                      #{index + 1}
                    </div>

                    <div className="mt-3 text-6xl">
                      {pet ? getPetEmoji(pet.pet_type) : "🐾"}
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-gray-900">
                      {item.student.name}
                    </h3>

                    <p className="mt-1 text-sm font-medium text-gray-500">
                      {item.student.group_name || "未分组"}
                    </p>

                    {pet ? (
                      <div className="mt-4 space-y-2 text-sm">
                        <div className="rounded-xl bg-green-50 px-3 py-2 font-bold text-green-700">
                          Lv.{pet.level} · {pet.exp} 经验
                        </div>

                        <div className="rounded-xl bg-blue-50 px-3 py-2 font-bold text-blue-700">
                          心情：{getMoodLabel(pet.mood)}
                        </div>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-gray-400">暂无宠物</p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-full rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
                <p className="text-gray-500">还没有学生。</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}