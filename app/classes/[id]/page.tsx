import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ClassDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: classItem, error } = await supabase
    .from("classes")
    .select("id, name, grade, semester, invite_code, teacher_id")
    .eq("id", id)
    .eq("teacher_id", user.id)
    .single();

  if (error || !classItem) {
    redirect("/dashboard");
  }

  const menuItems = [
    {
      title: "学生管理",
      desc: "添加、编辑和管理学生名单",
      href: `/classes/${id}/students`,
      icon: "👧",
    },
    {
      title: "积分规则",
      desc: "设置课堂、作业、纪律等奖励规则",
      href: `/classes/${id}/rules`,
      icon: "⭐",
    },
    {
      title: "打卡加分",
      desc: "给学生快速加分或扣分",
      href: `/classes/${id}/checkin`,
      icon: "✅",
    },
    {
      title: "宠物园",
      desc: "查看全班电子宠物成长状态",
      href: `/classes/${id}/pets`,
      icon: "🐾",
    },
    {
      title: "排行榜",
      desc: "查看积分和成长排名",
      href: `/classes/${id}/leaderboard`,
      icon: "🏆",
    },
    {
      title: "投屏模式",
      desc: "适合教室大屏展示",
      href: `/classes/${id}/display`,
      icon: "🖥️",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-green-700 hover:text-green-800"
          >
            ← 返回后台
          </Link>
        </div>

        <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm text-gray-500">班级详情</p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {classItem.name}
          </h1>

          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-gray-100 px-4 py-2 text-gray-700">
              年级：{classItem.grade || "未填写"}
            </span>

            <span className="rounded-full bg-gray-100 px-4 py-2 text-gray-700">
              学期：{classItem.semester || "未填写"}
            </span>

            <span className="rounded-full bg-green-100 px-4 py-2 font-mono font-bold text-green-700">
              邀请码：{classItem.invite_code}
            </span>
          </div>
        </header>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="text-4xl">{item.icon}</div>

              <h2 className="mt-5 text-xl font-bold text-gray-900">
                {item.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {item.desc}
              </p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}