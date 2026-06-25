import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import { signOut } from "../auth/actions";
import { createClass, deleteClass } from "./actions";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data: classes, error } = await supabase
    .from("classes")
    .select("id, name, grade, semester, invite_code, created_at")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-blue-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold text-green-700">
                老师管理后台
              </p>

              <h1 className="mt-2 text-3xl font-black text-gray-900">
                班级课件积分宠物系统
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                欢迎回来，{profile?.full_name || user.email}。你可以在这里管理班级、学生、积分规则和宠物成长。
              </p>
            </div>

            <form action={signOut}>
              <button
                type="submit"
                className="rounded-2xl bg-gray-100 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-200"
              >
                退出登录
              </button>
            </form>
          </div>
        </header>

        <section className="mb-8 grid gap-5 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <p className="text-3xl">🏫</p>
            <p className="mt-4 text-sm font-bold text-gray-500">班级数量</p>
            <p className="mt-2 text-3xl font-black text-gray-900">
              {classes?.length || 0}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <p className="text-3xl">🐾</p>
            <p className="mt-4 text-sm font-bold text-gray-500">宠物系统</p>
            <p className="mt-2 text-lg font-black text-green-700">已启用</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <p className="text-3xl">⭐</p>
            <p className="mt-4 text-sm font-bold text-gray-500">积分规则</p>
            <p className="mt-2 text-lg font-black text-yellow-700">
              可自定义
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <p className="text-3xl">🔐</p>
            <p className="mt-4 text-sm font-bold text-gray-500">学生访问</p>
            <p className="mt-2 text-lg font-black text-blue-700">
              查看码保护
            </p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-xl font-black text-gray-900">创建新班级</h2>

            <p className="mt-2 text-sm text-gray-500">
              创建班级后，系统会自动生成邀请码，学生和家长可通过邀请码进入。
            </p>

            <form action={createClass} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700">
                  班级名称
                </label>
                <input
                  name="name"
                  placeholder="例如：三年级一班"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700">年级</label>
                <input
                  name="grade"
                  placeholder="例如：三年级"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700">学期</label>
                <input
                  name="semester"
                  placeholder="例如：2026春季"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-green-600 px-5 py-3 font-black text-white hover:bg-green-700"
              >
                创建班级
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900">我的班级</h2>
                <p className="mt-2 text-sm text-gray-500">
                  进入班级后，可以管理学生、积分规则、打卡加分、排行榜和投屏模式。
                </p>
              </div>

              <Link
                href="/join"
                className="rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-700 hover:bg-green-100"
              >
                家长入口预览 →
              </Link>
            </div>

            <div className="mt-6 grid gap-4">
              {classes && classes.length > 0 ? (
                classes.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="rounded-3xl border border-gray-100 bg-gray-50 p-5 transition hover:bg-white hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-2xl">
                            🏫
                          </div>

                          <div>
                            <h3 className="text-xl font-black text-gray-900">
                              {classItem.name}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {classItem.grade || "未设置年级"} ·{" "}
                              {classItem.semester || "未设置学期"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:items-end">
                        <div className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-black text-yellow-700">
                          邀请码：{classItem.invite_code}
                        </div>

                        <div className="flex gap-2">
                          <Link
                            href={`/classes/${classItem.id}`}
                            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-black text-white hover:bg-green-700"
                          >
                            进入管理
                          </Link>

                          <form action={deleteClass.bind(null, classItem.id)}>
                            <button
                              type="submit"
                              className="rounded-xl bg-red-50 px-4 py-2 text-sm font-black text-red-600 hover:bg-red-100"
                            >
                              删除班级
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 text-xs text-gray-400">
                      删除班级会同时影响该班级下的学生、宠物、积分规则和成长记录，请谨慎操作。
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-gray-300 p-10 text-center">
                  <div className="text-5xl">🐾</div>
                  <h3 className="mt-4 text-xl font-black text-gray-900">
                    还没有班级
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    请先在左侧创建一个班级，开始使用积分宠物系统。
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