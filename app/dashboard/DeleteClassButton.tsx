"use client";

import { useState } from "react";
import { deleteClass } from "./actions";

type DeleteClassButtonProps = {
  classId: string;
  className: string;
};

export default function DeleteClassButton(props: DeleteClassButtonProps) {
  const { classId, className } = props;
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `确定要删除「${className}」吗？\n\n删除后无法恢复，请谨慎操作。`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteClass(classId);
    } catch (error) {
      alert("删除失败，请稍后再试。");
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isDeleting ? "删除中..." : "删除班级"}
    </button>
  );
}