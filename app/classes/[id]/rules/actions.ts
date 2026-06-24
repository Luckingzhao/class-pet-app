"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

async function checkClassPermission(classId: string) {
  const { supabase, user } = await getCurrentUser();

  const { data: classItem } = await supabase
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", user.id)
    .single();

  if (!classItem) {
    throw new Error("没有权限操作这个班级");
  }

  return { supabase, user };
}

export async function createPointRule(classId: string, formData: FormData) {
  const { supabase } = await checkClassPermission(classId);

  const title = String(formData.get("title") || "").trim();
  const category = String(formData.get("category") || "其他").trim();
  const pointsValue = String(formData.get("points") || "").trim();

  if (!title) {
    throw new Error("规则名称不能为空");
  }

  const points = Number(pointsValue);

  if (!Number.isFinite(points) || points === 0) {
    throw new Error("分值必须是非 0 数字");
  }

  const { error } = await supabase.from("point_rules").insert({
    class_id: classId,
    title,
    category,
    points,
    active: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/classes/${classId}/rules`);
}

export async function deletePointRule(classId: string, ruleId: string) {
  const { supabase } = await checkClassPermission(classId);

  const { error } = await supabase
    .from("point_rules")
    .delete()
    .eq("id", ruleId)
    .eq("class_id", classId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/classes/${classId}/rules`);
}

export async function togglePointRule(
  classId: string,
  ruleId: string,
  active: boolean
) {
  const { supabase } = await checkClassPermission(classId);

  const { error } = await supabase
    .from("point_rules")
    .update({ active: !active })
    .eq("id", ruleId)
    .eq("class_id", classId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/classes/${classId}/rules`);
}