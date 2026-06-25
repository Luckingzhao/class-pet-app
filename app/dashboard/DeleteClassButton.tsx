"use client";

export default function DeleteClassButton() {
  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    const confirmed = window.confirm(
      "确定要删除这个班级吗？删除后，该班级下的学生、宠物、积分规则和成长记录都可能受到影响。"
    );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <button
      type="submit"
      onClick={handleClick}
      className="rounded-xl bg-red-50 px-4 py-2 text-sm font-black text-red-600 hover:bg-red-100"
    >
      删除班级
    </button>
  );
}