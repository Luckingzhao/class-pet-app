import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-green-50 px-6 py-10">
      <section className="mx-auto flex min-h-[80vh] max-w-5xl flex-col items-center justify-center text-center">
        <div className="mb-6 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
          面向学生的班级激励工具
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          班级课件宠物积分系统
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
          让班级管理更有趣，让学生成长看得见。老师可以给学生加减积分，
          学生的电子宠物会根据积分成长、升级和改变状态。
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/login"
            className="rounded-xl bg-green-600 px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-green-700"
          >
            老师登录
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl border border-gray-300 bg-white px-8 py-4 text-base font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
          >
            进入后台
          </Link>
        </div>
      </section>
    </main>
  );
}
