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
  "🐶","🐱","🐰","🦊","🐼","🐸","🐵","🐯","🦁","🐻",
  "🐨","🦄","🐧","🐤","🦉","🐙","🦖","🐬","🦋","🦒",
  "🦓","🐘","🦝","🦥","🐿️","🦔","🐳","🐢","🦕","🐮",
];

function getClassAvatar(classId: string) {
  let hash = 0;
  for (let i = 0; i < classId.length; i++) {
    hash = classId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CLASS_AVATARS[Math.abs(hash) % CLASS_AVATARS.length];
}

export default async function ClassDashboardPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: classItem } = await supabase
    .from("classes")
    .select("id, name, grade, semester, invite_code, created_at")
    .eq("id", id)
    .eq("teacher_id", user.id)
    .single();

  if (!classItem) redirect("/dashboard");

  const typedClass = classItem as ClassItem;

  const [{ count: studentsCount }, { count: rulesCount }, { count: logsCount }] =
    await Promise.all([
      supabase.from("students").select("*", { count: "exact", head: true }).eq("class_id", id),
      supabase.from("point_rules").select("*", { count: "exact", head: true }).eq("class_id", id),
      supabase.from("point_logs").select("*", { count: "exact", head: true }).eq("class_id", id),
    ]);

  const featureCards = [
    {
      title: "学生小档案",
      desc: "管理学生、头像、成长记录",
      href: `/classes/${id}/students`,
      icon: "🧸",
      badge: "基础",
      bg: "from-pink-200 to-orange-100",
    },
    {
      title: "积分小规则",
      desc: "设置奖励与扣分规则",
      href: `/classes/${id}/rules`,
      icon: "⭐",
      badge: "规则",
      bg: "from-yellow-200 to-orange-100",
    },
    {
      title: "课堂加分",
      desc: "一键给学生加分或扣分",
      href: `/classes/${id}/checkin`,
      icon: "🍭",
      badge: "常用",
      bg: "from-emerald-200 to-green-100",
    },
    {
      title: "宠物乐园",
      desc: "查看每个学生的成长宠物",
      href: `/classes/${id}/pets`,
      icon: "🐣",
      badge: "成长",
      bg: "from-purple-200 to-pink-100",
    },
    {
      title: "小小排行榜",
      desc: "看看谁是今天的明星",
      href: `/classes/${id}/leaderboard`,
      icon: "🏆",
      badge: "激励",
      bg: "from-sky-200 to-blue-100",
    },
    {
      title: "教室大屏",
      desc: "投屏展示课堂数据",
      href: `/classes/${id}/display`,
      icon: "📺",
      badge: "展示",
      bg: "from-indigo-200 to-purple-100",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 px-4 py-6">

      <div className="mx-auto max-w-7xl">

        {/* 顶部 */}
        <header className="mb-8 rounded-[2.5rem] bg-white/90 p-6 shadow-lg ring-1 ring-orange-100 backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-orange-200 to-pink-200 text-5xl shadow-inner">
                {getClassAvatar(typedClass.id)}
              </div>

              <div>
                <div className="flex gap-2">
                  <span className="rounded-full bg-orange-200 px-3 py-1 text-sm font-bold text-orange-800">
                    🌈 班级乐园
                  </span>
                  <span className="rounded-full bg-yellow-200 px-3 py-1 text-sm font-bold text-yellow-800">
                    {typedClass.semester || "快乐学期"}
                  </span>
                </div>

                <h1 className="mt-2 text-3xl font-black text-gray-900">
                  {typedClass.name}
                </h1>

                <p className="text-sm font-medium text-gray-700">
                  今天也要让孩子们开心成长 ✨
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/dashboard"
                className="rounded-2xl bg-white px-5 py-3 font-bold text-gray-800 shadow-sm ring-1 ring-orange-200 hover:bg-orange-50"
              >
                👩‍🏫 老师后台
              </Link>

              <Link
                href="/join"
                className="rounded-2xl bg-orange-500 px-5 py-3 font-bold text-white shadow hover:bg-orange-600"
              >
                👨‍👩‍👧 家长入口
              </Link>
            </div>
          </div>
        </header>

        {/* 统计 */}
        <section className="mb-8 grid gap-4 lg:grid-cols-3">

          {[
  { icon: "🎓", label: "学生", value: studentsCount || 0, color: "bg-pink-100" },
  { icon: "⭐", label: "规则", value: rulesCount || 0, color: "bg-yellow-100" },
  { icon: "🎯", label: "记录", value: logsCount || 0, color: "bg-green-100" },
].map((item) => (
  <div
    key={item.label}
    className={`rounded-3xl p-6 shadow-sm ring-1 ring-orange-100 ${item.color} text-center`}
  >

    {/* 第一行：图标 */}
    <div className="text-4xl mb-2">
      {item.icon}
    </div>

    {/* 第二行：标题 */}
    <div className="text-base font-bold text-gray-800 mb-1">
      {item.label}
    </div>

    {/* 第三行：数值 */}
    <div className="text-3xl font-black text-gray-900">
      {item.value}
    </div>

  </div>
))}

        </section>

        {/* 功能卡片 */}
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

          {featureCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className={`rounded-[2rem] bg-gradient-to-br ${card.bg} p-6 shadow-sm ring-1 ring-white/60 transition hover:-translate-y-1 hover:shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div className="text-4xl">{card.icon}</div>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-800 shadow-sm">
                  {card.badge}
                </span>
              </div>

              <h3 className="mt-4 text-xl font-black text-gray-900">
                {card.title}
              </h3>

              <p className="mt-2 text-sm font-medium text-gray-700">
                {card.desc}
              </p>

              <div className="mt-4 text-sm font-black text-gray-900">
                👉 进入
              </div>
            </Link>
          ))}

        </section>

      </div>
    </main>
  );
}