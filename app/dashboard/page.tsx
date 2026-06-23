import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import { signOut } from "../auth/actions";
import { createClass } from "./actions";

type ClassItem = {
  id: string;
  name: string;
  grade: string | null;
  semester: string | null;
  invite_code: string;
  created_at: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: classes, error } = await supabase
    .from("classes")
    .select("id, name, grade, semester, invite_code, created_at")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const fullName = user.user_metadata?.full_name || "老师";

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-500">欢迎回来</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              {fullName}
            </h1>
            <p className="mt-2 text-sm text-gray-500">{user.email}</p>
          </div>

          <form action={signOut}>
            <button className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              退出登录
            </button>
          </form>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-xl font-bold text-gray-900">创建班级</h2>
            <p className="mt-2 text-sm text-gray-500">
              创建后会自动生成一个班级邀请码，后续学生端可以使用。
            </p>

            <form action={createClass} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  班级名称
                </label>
                <input
                  name="name"
                  required
                  placeholder="例如：三年级一班"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  年级
                </label>
                <input
                  name="grade"
                  placeholder="例如：三年级"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  学期
                </label>
                <input
                  name="semester"
                  placeholder="例如：2026 春季"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <button className="w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700">
                创建班级
              </button>
            </form>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 lg:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">我的班级</h2>
                <p className="mt-2 text-sm text-gray-500">
                  点击班级进入详情页，后续可以添加学生和设置积分规则。
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {classes && classes.length > 0 ? (
                classes.map((classItem: ClassItem) => (
                  <Link
                    key={classItem.id}
                    href={`/classes/${classItem.id}`}
                    className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-green-300 hover:bg-green-50"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {classItem.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {classItem.grade || "未填写年级"} ·{" "}
                          {classItem.semester || "未填写学期"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-100 px-4 py-3 text-sm">
                        邀请码：
                        <span className="font-mono font-bold text-green-700">
                          {classItem.invite_code}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center">
                  <p className="text-gray-500">你还没有创建班级。</p>
                  <p className="mt-2 text-sm text-gray-400">
                    请先在左侧创建第一个班级。
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
