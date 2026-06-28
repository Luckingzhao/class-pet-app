import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        {/* 顶部 */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
              🐾
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                班级课件积分宠物系统
              </h1>
              <p className="text-sm text-gray-500">
                让班级管理更有趣，让成长看得见
              </p>
            </div>
          </div>

          <div className="hidden rounded-full bg-white px-4 py-2 text-sm text-gray-500 shadow-sm sm:block">
            老师 · 学生 · 家长共同参与的家校系统
          </div>
        </header>

        {/* 主体 */}
        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-2">
          {/* 左侧文案 */}
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-orange-600 shadow-sm">
              ✨ 班级积分 + 宠物成长
            </div>

            <h2 className="text-4xl font-black leading-tight text-gray-950 sm:text-5xl">
              用一只可爱的宠物，
              <br />
              记录孩子每天成长。
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
              老师可以为学生创建积分规则；学生和家长可以查看自己的宠物等级、经验、心情和成长记录。
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/login"
                className="flex items-center justify-center rounded-2xl bg-gray-900 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-gray-800"
              >
                老师登录
              </Link>

              <Link
                href="/join"
                className="flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-base font-bold text-gray-900 shadow-lg ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:bg-orange-50"
              >
                家长登录
              </Link>
            </div>

            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
                <div className="text-2xl">🏆</div>
                <div className="mt-2 text-sm font-bold text-gray-800">
                  排行榜
                </div>
              </div>

              <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
                <div className="text-2xl">🌱</div>
                <div className="mt-2 text-sm font-bold text-gray-800">
                  宠物成长
                </div>
              </div>

              <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
                <div className="text-2xl">📺</div>
                <div className="mt-2 text-sm font-bold text-gray-800">
                  投屏展示
                </div>
              </div>
            </div>
          </div>

          {/* 右侧宠物卡片 */}
          <div className="relative">
            <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-yellow-200 blur-2xl" />
            <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-pink-200 blur-3xl" />

            <div className="relative rounded-[2rem] bg-white p-6 shadow-2xl">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-orange-100 to-pink-100 p-8 text-center">
                <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-white text-8xl shadow-inner">
                  🐶
                </div>

                <h3 className="mt-6 text-2xl font-black text-gray-900">
                  小小成长宠物
                </h3>

                <p className="mt-2 text-gray-600">
                  完成任务、积极表现，宠物就会获得经验并升级。
                </p>

                <div className="mt-6 rounded-2xl bg-white p-4 text-left shadow-sm">
                  <div className="flex items-center justify-between text-sm font-bold text-gray-700">
                    <span>成长经验</span>
                    <span>Lv. 6</span>
                  </div>

                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full w-2/3 rounded-full bg-orange-400" />
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
                    <div className="rounded-xl bg-orange-50 p-3">
                      <div className="font-black text-orange-600">320</div>
                      <div className="text-gray-500">经验</div>
                    </div>

                    <div className="rounded-xl bg-pink-50 p-3">
                      <div className="font-black text-pink-600">88</div>
                      <div className="text-gray-500">心情</div>
                    </div>

                    <div className="rounded-xl bg-green-50 p-3">
                      <div className="font-black text-green-600">良好</div>
                      <div className="text-gray-500">状态</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 底部 */}
        <footer className="pb-4 text-center text-sm text-gray-400">
          适合课堂积分、行为激励、家校共育和班级展示
        </footer>
      </div>
    </main>
  );
}