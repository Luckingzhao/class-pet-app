import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

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
  "🦓",
  "🐘",
  "🦝",
  "🦥",
  "🐿️",
  "🦔",
  "🐳",
  "🐢",
  "🦕",
  "🐮",
];

function getClassAvatar(classId: string) {
  let hash = 0;

  for (let i = 0; i < classId.length; i++) {
    hash = classId.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % CLASS_AVATARS.length;
  return CLASS_AVATARS[index];
}

export default async function ClassDashboardPage({ params }: PageProps) {
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
    .select("id, name, grade, semester, invite_code, created_at")
    .eq("id", id)
    .eq("teacher_id", user.id)
    .single();

  if (classError || !classItem) {
    redirect("/dashboard");
  }

  const typedClass = classItem as ClassItem;

  const [{ count: studentsCount }, { count: rulesCount }, { count: logsCount }] =
    await Promise.all([
      supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("class_id", id),

      supabase
        .from("point_rules")
        .select("*", { count: "exact", head: true })
        .eq("class_id", id),

      supabase
        .from("point_logs")
        .select("*", { count: "exact", head: true })
        .eq("class_id", id),
    ]);

  const featureCards = [
    {
      title: "学生管理",
      desc: "添加学生、删除学生、查看学生登录信息和修改头像",
      href: `/classes/${id}/students`,
      icon: "🦄",
      badge: "基础数据",
      bg: "from-orange-50 to-amber-50",
    },
    {
      title: "积分规则",
      desc: "设置加分、扣分规则，例如作业、课堂、纪律、阅读等",
      href: `/classes/${id}/rules`,
      icon: "⭐",
      badge: "规则设置",
      bg: "from-yellow-50 to-orange-50",
    },
    {
      title: "打卡加分",
      desc: "选择规则后，为学生快速加分或扣分，宠物同步成长",
      href: `/classes/${id}/checkin`,
      icon: "✅",
      badge: "日常使用",
      bg: "from-green-50 to-emerald-50",
    },
    {
      title: "宠物园",
      desc: "查看全班宠物等级、经验、心情和成长状态",
      href: `/classes/${id}/pets`,
      icon: "🐾",
      badge: "成长展示",
      bg: "from-pink-50 to-rose-50",
    },
    {
      title: "排行榜",
      desc: "按等级和经验展示班级成长榜，激励学生持续进步",
      href: `/classes/${id}/leaderboard`,
      icon: "🏆",
      badge: "荣誉激励",
      bg: "from-blue-50 to-sky-50",
    },
    {
      title: "投屏模式",
      desc: "适合教室大屏展示前三名和全班宠物墙",
      href: `/classes/${id}/display`,
      icon: "📺",
      badge: "课堂展示",
      bg: "from-purple-50 to-indigo-50",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-pink-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* 顶部 */}
        <header className="mb-8 rounded-[2rem] bg-white/90 p-6 shadow-sm ring-1 ring-orange-100 backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-orange-100 to-pink-100 text-5xl shadow-inner">
                {getClassAvatar(typedClass.id)}
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
                    班级工作台
                  </span>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-600">
                    {typedClass.semester || "未设置学期"}
                  </span>
                </div>

                <h1 className="text-3xl font-black text-gray-950 sm:text-4xl">
                  {typedClass.name}
                </h1>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  在这里统一管理学生、积分规则、打卡加分、宠物成长、排行榜和投屏展示。
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-gray-100 transition hover:bg-gray-50"
              >
                返回老师后台
              </Link>

              <Link
                href="/join"
                className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600"
              >
                家长入口预览
              </Link>
            </div>
          </div>
        </header>

        {/* 邀请码区域 */}
        <section className="mb-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-orange-100">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-orange-500">
                  班级邀请码
                </p>

                <div className="mt-3 inline-flex rounded-[1.5rem] bg-gray-950 px-6 py-4 text-4xl font-black tracking-[0.3em] text-white shadow-lg">
                  {typedClass.invite_code || "未生成"}
                </div>

                <p className="mt-4 text-sm leading-6 text-gray-500">
                  家长登录需要输入班级邀请码、学生姓名和个人查看码。
                </p>
              </div>

              <div className="rounded-[1.5rem] bg-orange-50 p-5 text-sm leading-6 text-orange-700">
                <p className="font-black">使用说明</p>
                <p className="mt-2">
                  你可以把这个邀请码发给家长。每个学生有自己的个人查看码，用来保护学生隐私。
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-[1.5rem] bg-white p-5 text-center shadow-sm ring-1 ring-orange-100">
              <div className="text-3xl">🦈</div>
              <p className="mt-3 text-3xl font-black text-gray-950">
                {studentsCount || 0}
              </p>
              <p className="mt-1 text-sm font-bold text-gray-500">学生</p>
            </div>

            <div className="rounded-[1.5rem] bg-white p-5 text-center shadow-sm ring-1 ring-yellow-100">
              <div className="text-3xl">⭐</div>
              <p className="mt-3 text-3xl font-black text-gray-950">
                {rulesCount || 0}
              </p>
              <p className="mt-1 text-sm font-bold text-gray-500">规则</p>
            </div>

            <div className="rounded-[1.5rem] bg-white p-5 text-center shadow-sm ring-1 ring-green-100">
              <div className="text-3xl">🌱</div>
              <p className="mt-3 text-3xl font-black text-gray-950">
                {logsCount || 0}
              </p>
              <p className="mt-1 text-sm font-bold text-gray-500">记录</p>
            </div>
          </div>
        </section>

        {/* 快捷操作 */}
        <section className="mb-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-orange-100">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-600">
                快捷操作
              </div>

              <h2 className="text-2xl font-black text-gray-950">
                今天要做什么？
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                老师日常最常用的是“打卡加分”，前期配置主要用“学生管理”和“积分规则”。
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href={`/classes/${id}/checkin`}
              className="group rounded-[1.5rem] bg-gray-950 p-6 text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-gray-800"
            >
              <div className="text-5xl">✅</div>
              <h3 className="mt-5 text-xl font-black">开始打卡加分</h3>
              <p className="mt-2 text-sm leading-6 text-gray-300">
                速加分或扣分，宠物经验、等级和心情会自动更新。
              </p>
            </Link>

            <Link
              href={`/classes/${id}/students`}
              className="group rounded-[1.5rem] bg-orange-500 p-6 text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600"
            >
              <div className="text-5xl">🐳</div>
              <h3 className="mt-5 text-xl font-black">管理学生</h3>
              <p className="mt-2 text-sm leading-6 text-orange-50">
                添加学生、查看学生查看码、修改学生头像。
              </p>
            </Link>

            <Link
              href={`/classes/${id}/display`}
              className="group rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-purple-100 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="text-5xl">📺</div>
              <h3 className="mt-5 text-xl font-black text-gray-950">
                打开投屏模式
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                适合课堂大屏展示排行榜和全班宠物墙。
              </p>
            </Link>
          </div>
        </section>

        {/* 功能入口 */}
        <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-orange-100">
          <div className="mb-6">
            <div className="mb-3 inline-flex rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
              功能入口
            </div>

            <h2 className="text-2xl font-black text-gray-950">
              班级管理功能
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              下面是这个班级的全部功能模块。
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className={`group rounded-[1.5rem] bg-gradient-to-br ${card.bg} p-5 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lg`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm transition group-hover:scale-105">
                    {card.icon}
                  </div>

                  <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black text-gray-600 shadow-sm">
                    {card.badge}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-black text-gray-950">
                  {card.title}
                </h3>

                <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-600">
                  {card.desc}
                </p>

                <div className="mt-5 inline-flex items-center text-sm font-black text-gray-900">
                  进入功能
                  <span className="ml-1 transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}