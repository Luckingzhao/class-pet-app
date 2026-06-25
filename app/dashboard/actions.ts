"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";

function generateInviteCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += letters[Math.floor(Math.random() * letters.length)];
  }
  return code;
}

export async function createClass(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = String(formData.get("name") || "").trim();
  const grade = String(formData.get("grade") || "").trim();
  const semester = String(formData.get("semester") || "").trim();

  if (!name) {
    throw new Error("班级名称不能为空");
  }

  const inviteCode = generateInviteCode();

  const { error } = await supabase.from("classes").insert({
    teacher_id: user.id,
    name,
    grade,
    semester,
    invite_code: inviteCode,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}
export async function deleteClass(classId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: classItem } = await supabase
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", user.id)
    .single();

  if (!classItem) {
    throw new Error("没有权限删除这个班级");
  }

  const { error } = await supabase
    .from("classes")
    .delete()
    .eq("id", classId)
    .eq("teacher_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}