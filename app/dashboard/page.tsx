import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import { createClass } from "./actions";
import DeleteClassButton from "./DeleteClassButton";

type ClassItem = {
  id: string;
  name: string;
  grade: string | null;
  semester: string | null;
  invite_code: string | null;
  created_at: string;
};
const CLASS_AVATARS = [
  "🐶",
  "🐱",
  "🐰",
  "🦊",
  "🐼",
  "🐸",
  "🐵",
  "🐯",
  "🦁",
  "🐻",
  "🐨",
  "🦄",
  "🐧",
  "🐤",
  "🦉",
  "🐙",
  "🦖",
  "🐬",
  "🦋",
  "🦒",
];

function getClassAvatar(classId: string) {
  let hash = 0;

  for (let i = 0; i < classId.length; i++) {
    hash = classId.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % CLASS_AVATARS.length;
  return CLASS_AVATARS[index];
}

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

  const classList = (classes || []) as ClassItem[];

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-pink-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* 顶部导航 */}
        <header className="mb-8 rounded-[2rem] bg-white/90 p-6 shadow-sm ring-1 ring-orange-100 backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-100 text-4xl shadow-inner">
                🐾
              </div>

              <div>
                <p className="mb-1 text-sm font-bold text-orange-500">
                  老师工作台
                </p>
                <h1 className="text-2xl font-black text-gray-950 sm:text-3xl">
                  班级课件积分宠物系统
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  管理班级、学生积分、宠物成长和家长查看入口
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/join"
                className="rounded-2xl bg-orange-50 px-5 py-3 text-sm font-bold text-orange-700 transition hover:bg-orange-100"
              >
                家长入口预览
              </Link>

              <form action="/login">
                <button
                  type="submit"
                  className="rounded-2xl bg-gray-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-gray-800"
                >
                  返回登录页
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* 数据概览 */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-orange-100">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-500">我的班级</p>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-sm">
                🏫
              </span>
            </div>
            <p className="mt-4 text-4xl font-black text-gray-950">
              {classList.length}
            </p>
            <p className="mt-2 text-sm text-gray-400">当前正在管理的班级</p>
          </div>

          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-pink-100">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-500">积分激励</p>
              <span className="rounded-full bg-pink-100 px-3 py-1 text-sm">
                ⭐
              </span>
            </div>
            <p className="mt-4 text-4xl font-black text-gray-950">成长</p>
            <p className="mt-2 text-sm text-gray-400">用积分记录学生表现</p>
          </div>

          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-green-100">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-500">宠物系统</p>
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm">
                🌱
              </span>
            </div>
            <p className="mt-4 text-4xl font-black text-gray-950">陪伴</p>
            <p className="mt-2 text-sm text-gray-400">让学生看到自己的进步</p>
          </div>

          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-blue-100">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-500">班级展示</p>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm">
                📺
              </span>
            </div>
            <p className="mt-4 text-4xl font-black text-gray-950">投屏</p>
            <p className="mt-2 text-sm text-gray-400">适合课堂大屏展示</p>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[380px_1fr]">
          {/* 创建班级 */}
          <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-orange-100">
            <div className="mb-6">
              <div className="mb-3 inline-flex rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
                创建新班级
              </div>
              <h2 className="text-2xl font-black text-gray-950">
                新建一个班级
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                创建后会自动生成班级邀请码，家长和学生可以通过邀请码进入学生端。
              </p>
            </div>

            <form action={createClass} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-bold text-gray-700"
                >
                  班级名称
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  placeholder="例如：四年级8班"
                  className="w-full rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label
                  htmlFor="semester"
                  className="mb-2 block text-sm font-bold text-gray-700"
                >
                  学期
                </label>
                <input
                  id="semester"
                  name="semester"
                  placeholder="例如：春季班/秋季班"
                  className="w-full rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-orange-500 px-5 py-4 text-base font-black text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600"
              >
                创建班级
              </button>
            </form>

            <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-700">
              <p className="font-bold">小提示</p>
              <p className="mt-1">
                班级名称请输入年级，以便区分。
              </p>
            </div>
          </div>

          {/* 班级列表 */}
          <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-orange-100">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-3 inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-600">
                  班级管理
                </div>
                <h2 className="text-2xl font-black text-gray-950">
                  我的班级
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  进入班级后，可以管理学生、积分规则、打卡加分、排行榜和投屏模式。
                </p>
              </div>
            </div>

            {classList.length === 0 ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-orange-100 bg-orange-50/40 p-8 text-center">
                <div className="mb-4 text-6xl">🏫</div>
                <h3 className="text-xl font-black text-gray-900">
                  还没有创建班级
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                  请先在左侧创建一个班级。创建成功后，这里会显示班级管理入口。
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {classList.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="group rounded-[1.5rem] border border-orange-100 bg-gradient-to-br from-white to-orange-50/40 p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
  {getClassAvatar(classItem.id)}
</div>

                        <div>
                          <h3 className="text-xl font-black text-gray-950">
                            {classItem.name}
                          </h3>

                          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                            <span className="rounded-full bg-white px-3 py-1 font-bold text-gray-600 shadow-sm">
                              {classItem.semester || "未设置学期"}
                            </span>

                            <span className="rounded-full bg-orange-100 px-3 py-1 font-bold text-orange-700">
                              邀请码：{classItem.invite_code || "未生成"}
                            </span>
                          </div>

                          <p className="mt-3 text-sm text-gray-500">
                            创建时间：
                            {new Date(classItem.created_at).toLocaleDateString(
                              "zh-CN"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/classes/${classItem.id}`}
                          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-gray-800"
                        >
                          进入班级管理
                        </Link>

                        <DeleteClassButton
                          classId={classItem.id}
                          className={classItem.name}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}