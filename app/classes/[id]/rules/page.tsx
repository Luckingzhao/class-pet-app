import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import {
  createPointRule,
  deletePointRule,
  togglePointRule,
} from "./actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type RuleItem = {
  id: string;
  title: string;
  points: number;
  category: string;
  active: boolean;
  created_at: string;
};

function getPointStyle(points: number) {
  if (points > 0) {
    return "bg-green-50 text-green-700 border-green-200";
  }

  return "bg-red-50 text-red-700 border-red-200";
}

export default async function RulesPage({ params }: PageProps) {
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

  const { data: rules, error: rulesError } = await supabase
    .from("point_rules")
    .select("id, title, points, category, active, created_at")
    .eq("class_id", id)
    .order("created_at", { ascending: false });

  if (rulesError) {
    throw new Error(rulesError.message);
  }

  const createPointRuleWithClass = createPointRule.bind(null, id);

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
          <p className="text-sm text-gray-500">积分规则</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {classItem.name}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            设置课堂、作业、纪律、阅读、卫生等加减分规则。
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-xl font-bold text-gray-900">创建规则</h2>
            <p className="mt-2 text-sm text-gray-500">
              正数代表加分，负数代表扣分。
            </p>

            <form action={createPointRuleWithClass} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  规则名称
                </label>
                <input
                  name="title"
                  required
                  placeholder="例如：按时完成作业"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  分类
                </label>
                <select
                  name="category"
                  defaultValue="作业"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                >
                  <option value="作业">作业</option>
                  <option value="课堂">课堂</option>
                  <option value="纪律">纪律</option>
                  <option value="阅读">阅读</option>
                  <option value="卫生">卫生</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  分值
                </label>
                <input
                  name="points"
                  type="number"
                  required
                  placeholder="例如：5 或 -2"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <button className="w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700">
                创建积分规则
              </button>
            </form>

            <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
              示例：主动回答问题 +3、未完成作业 -5、帮助同学 +3。
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900">规则列表</h2>
            <p className="mt-2 text-sm text-gray-500">
              当前共有 {rules?.length || 0} 条规则。
            </p>

            <div className="mt-6 grid gap-4">
              {rules && rules.length > 0 ? (
                rules.map((rule: RuleItem) => (
                  <div
                    key={rule.id}
                    className="rounded-2xl border border-gray-200 bg-white p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                            {rule.category}
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1 text-sm font-bold ${getPointStyle(
                              rule.points
                            )}`}
                          >
                            {rule.points > 0 ? `+${rule.points}` : rule.points}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-sm ${
                              rule.active
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {rule.active ? "启用中" : "已停用"}
                          </span>
                        </div>

                        <h3 className="mt-3 text-lg font-bold text-gray-900">
                          {rule.title}
                        </h3>
                      </div>

                      <div className="flex gap-2">
                        <form
                          action={togglePointRule.bind(
                            null,
                            id,
                            rule.id,
                            rule.active
                          )}
                        >
                          <button className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                            {rule.active ? "停用" : "启用"}
                          </button>
                        </form>

                        <form action={deletePointRule.bind(null, id, rule.id)}>
                          <button className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100">
                            删除
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center">
                  <p className="text-gray-500">还没有积分规则。</p>
                  <p className="mt-2 text-sm text-gray-400">
                    请先创建第一条规则。
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