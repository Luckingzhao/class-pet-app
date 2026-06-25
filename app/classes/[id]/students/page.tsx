import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { addStudent, deleteStudent, updateStudentAvatar } from "./actions";
const AVATARS = [
  "🐱", "🐶", "🐰", "🐼", "🦊", "🐯", "🦁", "🐸", "🐵", "🐨",
  "🐻", "🐷", "🐹", "🐭", "🐧", "🐤", "🦄", "🐲", "🐙", "🦖",
  "🦕", "🐢", "🐳", "🐬", "🦈", "🐝", "🦋", "🐞", "🦉", "🦅",
  "🐺", "🦝", "🦥", "🦦", "🦔", "🐿️", "🦘", "🦒", "🦓", "🐘",
  "🦛", "🦏", "🐪", "🐫", "🦙", "🐐", "🐑", "🐴", "🐮", "🐥",
];
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

function getMoodLabel(mood: number) {
  if (mood >= 80) return "很开心";
  if (mood >= 50) return "状态不错";
  return "需要鼓励";
}

function getMoodColor(mood: number) {
  if (mood >= 80) return "bg-yellow-50 text-yellow-700";
  if (mood >= 50) return "bg-blue-50 text-blue-700";
  return "bg-red-50 text-red-700";
}

function getLevelProgress(exp: number) {
  return exp % 100;
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-blue-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/classes/${id}`}
            className="text-sm font-bold text-green-700 hover:text-green-800"
          >
            ← 返回班级控制台
          </Link>

          <Link
            href="/join"
            className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-700 shadow-sm ring-1 ring-gray-100 hover:bg-green-50"
          >
            学生入口预览 →
          </Link>
        </div>

        <header className="mb-8 rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold text-green-700">
                学生管理
              </p>

              <h1 className="mt-3 text-4xl font-black text-gray-900">
                {classItem.name}
              </h1>

              <p className="mt-3 text-sm text-gray-500">
                {classItem.semester || "未设置学期"} · 当前学生{" "}
                <span className="font-bold text-gray-900">
                  {students?.length || 0}
                </span>{" "}
                人
              </p>
            </div>

            <div className="rounded-3xl bg-yellow-50 px-6 py-4">
              <p className="text-sm font-bold text-yellow-700">
                班级邀请码
              </p>
              <p className="mt-1 text-3xl font-black tracking-widest text-yellow-800">
                {classItem.invite_code}
              </p>
              <p className="mt-2 text-xs text-yellow-700">
                学生/家长登录时还需要填写姓名和个人查看码。
              </p>
            </div>
          </div>
        </header>

        <section className="mb-8 rounded-[2rem] bg-white/80 p-6 shadow-sm ring-1 ring-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black text-gray-900">
                给学生/家长发送这些信息
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                为保护隐私，学生或家长需要同时输入：班级邀请码、学生姓名、个人查看码，才能查看自己的宠物和成长记录。
              </p>
            </div>

            <div className="rounded-3xl bg-green-50 px-5 py-4 text-sm font-bold text-green-700">
              示例：{classItem.invite_code} + 学生姓名 + 查看码
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-xl font-black text-gray-900">
              添加学生
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              添加学生后，系统会自动生成电子宠物和个人查看码。
            </p>

            <form action={addStudent.bind(null, id)} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700">
                  学生姓名
                </label>
                <input
                  name="name"
                  placeholder="例如：小明"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700">
                  学号 / 编号
                </label>
                <input
                  name="student_no"
                  placeholder="例如：01"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700">
                  小组
                </label>
                <input
                  name="group_name"
                  placeholder="例如：第一组"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>
<div>
  <label className="text-sm font-bold text-gray-700">
    选择头像
  </label>

  <div className="mt-3 grid max-h-56 grid-cols-5 gap-2 overflow-y-auto rounded-2xl border border-gray-100 bg-gray-50 p-3">
    {AVATARS.map((avatar, index) => (
      <label
        key={`${avatar}-${index}`}
        className="flex cursor-pointer items-center justify-center rounded-2xl bg-white p-3 text-2xl shadow-sm ring-1 ring-gray-100 hover:bg-green-50"
      >
        <input
          type="radio"
          name="avatar"
          value={avatar}
          defaultChecked={index === 0}
          className="sr-only"
        />
        {avatar}
      </label>
    ))}
  </div>

  <p className="mt-2 text-xs text-gray-500">
    不选择也可以，系统会自动分配一个卡通头像。
  </p>
</div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-green-600 px-5 py-3 font-black text-white hover:bg-green-700"
              >
                添加学生并生成宠物
              </button>
            </form>

            <div className="mt-6 rounded-3xl bg-gray-50 p-5">
              <p className="text-sm font-black text-gray-900">
                温馨提示
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                建议老师把每位学生的“姓名 + 查看码”单独发给对应学生或家长，不要在全班公开所有查看码。
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  学生列表
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  查看学生宠物状态和个人查看码。
                </p>
              </div>

              <span className="rounded-full bg-green-50 px-4 py-2 text-sm font-black text-green-700">
                共 {students?.length || 0} 人
              </span>
            </div>

            <div className="mt-6 grid gap-4">
              {students && students.length > 0 ? (
                students.map((student: any) => {
                  const pet = getPetFromStudent(student);
                  const progress = pet ? getLevelProgress(pet.exp) : 0;

                  return (
                    <div
                      key={student.id}
                      className="rounded-3xl border border-gray-100 bg-gray-50 p-5 transition hover:bg-white hover:shadow-md"
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-green-50 text-5xl">
  {student.avatar || "🐾"}
</div>

                          <div>
                            <h3 className="text-xl font-black text-gray-900">
                              {student.name}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              {student.group_name || "未分组"} ·{" "}
                              {student.student_no || "无编号"}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-black text-yellow-700">
                                查看码：{student.view_code || "未生成"}
                              </span>

                              {pet ? (
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-black ${getMoodColor(
                                    pet.mood
                                  )}`}
                                >
                                  心情：{getMoodLabel(pet.mood)}
                                </span>
                              ) : null}
                            </div>

                            {pet ? (
                              <div className="mt-4 max-w-md">
                                <p className="text-sm font-bold text-gray-700">
                                  {pet.name} · Lv.{pet.level} · 经验 {pet.exp}
                                </p>

                                <div className="mt-2 h-2 w-full rounded-full bg-white">
                                  <div
                                    className="h-2 rounded-full bg-green-500"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>

                                <p className="mt-1 text-xs text-gray-500">
                                  距离下一等级：{progress}/100
                                </p>
                              </div>
                            ) : (
                              <p className="mt-4 text-sm text-gray-400">
                                暂无宠物
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 xl:items-end">
                          <div className="rounded-2xl bg-white px-4 py-3 text-sm text-gray-600 ring-1 ring-gray-100">
                            <p className="font-black text-gray-900">
                              登录信息
                            </p>
                            <p className="mt-1">
                              邀请码：{classItem.invite_code}
                            </p>
                            <p>姓名：{student.name}</p>
                            <p>查看码：{student.view_code || "未生成"}</p>
                          </div>
<form
  action={updateStudentAvatar.bind(null, id, student.id)}
  className="rounded-2xl bg-white px-4 py-3 ring-1 ring-gray-100"
>
  <p className="mb-2 text-sm font-black text-gray-900">
    修改头像
  </p>

  <select
    name="avatar"
    defaultValue={student.avatar || "🐱"}
    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-lg text-gray-900 outline-none focus:border-green-500"
  >
    {AVATARS.map((avatar, index) => (
      <option key={`${avatar}-${index}`} value={avatar}>
        {avatar}
      </option>
    ))}
  </select>

  <button
    type="submit"
    className="mt-3 w-full rounded-xl bg-green-50 px-4 py-2 text-sm font-black text-green-700 hover:bg-green-100"
  >
    保存头像
  </button>
</form>
                          <form action={deleteStudent.bind(null, id, student.id)}>
                            <button
                              type="submit"
                              className="rounded-xl bg-red-50 px-4 py-2 text-sm font-black text-red-600 hover:bg-red-100"
                            >
                              删除学生
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-gray-300 p-12 text-center">
                  <div className="text-5xl">👩‍🎓</div>
                  <h3 className="mt-4 text-xl font-black text-gray-900">
                    还没有学生
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    请先在左侧添加学生，系统会自动生成宠物和查看码。
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}