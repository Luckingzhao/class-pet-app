import Link from "next/link";
import { joinClass } from "./actions";

type PageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error?: string) {
  if (error === "missing") return "请填写班级邀请码和学生姓名。";
  if (error === "class_not_found") return "没有找到这个班级邀请码，请检查是否输入正确。";
  if (error === "student_not_found") return "没有找到这个学生，请确认姓名是否和老师添加的一致。";
  return "";
}

export default async function JoinPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const errorMessage = getErrorMessage(error);

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-blue-50 px-6 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-4xl items-center justify-center">
        <div className="w-full max-w-xl rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <div className="text-center">
            <div className="text-6xl">🐾</div>

            <h1 className="mt-5 text-3xl font-black text-gray-900">
              加入班级宠物乐园
            </h1>

            <p className="mt-3 text-gray-500">
              输入老师提供的班级邀请码和你的姓名，查看自己的电子宠物。
            </p>
          </div>

          {errorMessage ? (
            <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <form action={joinClass} className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                班级邀请码
              </label>
              <input
                name="invite_code"
                placeholder="例如：ABC123"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                学生姓名
              </label>
              <input
                name="student_name"
                placeholder="请输入老师添加的姓名"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-green-600 px-5 py-3 text-base font-bold text-white hover:bg-green-700"
            >
              进入我的宠物页面
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}