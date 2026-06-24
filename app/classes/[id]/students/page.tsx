import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { addStudent, deleteStudent } from "./actions";

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
  created_at: string;
  pets: PetItem | PetItem[] | null;
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

export default async function StudentsPage({ params }: PageProps) {
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
      created_at,
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

  const addStudentWithClass = addStudent.bind(null, id);

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
            href="/dashboard"
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            返回后台
          </Link>
        </div>

        <header className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm text-gray-500">学生管理</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {classItem.name}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            邀请码：
            <span className="font-mono font-bold text-green-700">
              {classItem.invite_code}
            </span>
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-xl font-bold text-gray-900">添加学生</h2>
            <p className="mt-2 text-sm text-gray-500">
              添加学生后，系统会自动生成一只默认电子宠物。
            </p>

            <form action={addStudentWithClass} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  学生姓名
                </label>
                <input
                  name="name"
                  required
                  placeholder="例如：小明"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  学号 / 编号
                </label>
                <input
                  name="student_no"
                  placeholder="例如：001"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  小组
                </label>
                <input
                  name="group_name"
                  placeholder="例如：第一组"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <button className="w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700">
                添加学生并生成宠物
              </button>
            </form>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900">学生列表</h2>
            <p className="mt-2 text-sm text-gray-500">
              当前共有 {students?.length || 0} 名学生。
            </p>

            <div className="mt-6 grid gap-4">
              {students && students.length > 0 ? (
                students.map((student) => {
                  const typedStudent = student as StudentItem;
                  const pet = getPetFromStudent(typedStudent);

                  return (
                    <div
                      key={typedStudent.id}
                      className="rounded-2xl border border-gray-200 bg-white p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-4xl">
                            {pet ? getPetEmoji(pet.pet_type) : "🐾"}
                          </div>

                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {typedStudent.name}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              编号：{typedStudent.student_no || "未填写"} · 小组：
                              {typedStudent.group_name || "未填写"}
                            </p>
                            {pet && (
                              <p className="mt-1 text-sm text-green-700">
                                {pet.name} · Lv.{pet.level} · 经验 {pet.exp} · 心情 {pet.mood}
                              </p>
                            )}
                          </div>
                        </div>

                        <form action={deleteStudent.bind(null, id, typedStudent.id)}>
                          <button className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100">
                            删除
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center">
                  <p className="text-gray-500">还没有学生。</p>
                  <p className="mt-2 text-sm text-gray-400">
                    请先添加第一个学生。
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}