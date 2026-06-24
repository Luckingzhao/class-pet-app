import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { addStudent, deleteStudent } from "./actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getPetEmoji(type: string) {
  if (type === "dog") return "🐶";
  if (type === "rabbit") return "🐰";
  if (type === "dragon") return "🐉";
  return "🐱";
}

function getPetFromStudent(student: any) {
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
      view_code,
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

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <Link
            href={`/classes/${id}`}
            className="text-sm font-medium text-green-700 hover:text-green-800"
          >
            ← 返回班级
          </Link>
        </div>

        <header className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm text-gray-500">学生管理</p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {classItem.name}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {classItem.grade || "未设置年级"} ·{" "}
            {classItem.semester || "未设置学期"} · 邀请码：
            <span className="font-bold text-green-700">
              {classItem.invite_code}
            </span>
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-xl font-bold text-gray-900">添加学生</h2>

            <form
              action={addStudent.bind(null, id)}
              className="mt-6 space-y-4"
            >
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  学生姓名
                </label>
                <input
                  name="name"
                  placeholder="例如：小明"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  学号 / 编号
                </label>
                <input
                  name="student_no"
                  placeholder="例如：01"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  小组
                </label>
                <input
                  name="group_name"
                  placeholder="例如：第一组"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700"
              >
                添加学生并生成宠物
              </button>
            </form>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">学生列表</h2>
                <p className="mt-1 text-sm text-gray-500">
                  每位学生都会自动生成一只电子宠物和一个个人查看码。
                </p>
              </div>

              <span className="rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
                共 {students?.length || 0} 人
              </span>
            </div>

            <div className="mt-6 grid gap-4">
              {students && students.length > 0 ? (
                students.map((student: any) => {
                  const pet = getPetFromStudent(student);

                  return (
                    <div
                      key={student.id}
                      className="rounded-2xl border border-gray-200 bg-white p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-4xl">
                            {pet ? getPetEmoji(pet.pet_type) : "🐾"}
                          </div>

                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {student.name}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              {student.group_name || "未分组"} ·{" "}
                              {student.student_no || "无编号"}
                            </p>

                            <p className="mt-2 inline-block rounded-full bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-700">
                              查看码：{student.view_code || "未生成"}
                            </p>

                            {pet ? (
                              <p className="mt-3 text-sm text-gray-600">
                                {pet.name} · Lv.{pet.level} · 经验 {pet.exp} ·
                                心情 {pet.mood}
                              </p>
                            ) : (
                              <p className="mt-3 text-sm text-gray-400">
                                暂无宠物
                              </p>
                            )}
                          </div>
                        </div>

                        <form action={deleteStudent.bind(null, id, student.id)}>
                          <button
                            type="submit"
                            className="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100"
                          >
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
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}