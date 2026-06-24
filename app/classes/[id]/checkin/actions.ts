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

function calculateLevel(exp: number) {
  return Math.floor(exp / 100) + 1;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export async function applyPointRule(
  classId: string,
  studentId: string,
  ruleId: string
) {
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

  const { data: rule, error: ruleError } = await supabase
    .from("point_rules")
    .select("id, title, points, active")
    .eq("id", ruleId)
    .eq("class_id", classId)
    .single();

  if (ruleError || !rule) {
    throw new Error("积分规则不存在");
  }

  if (!rule.active) {
    throw new Error("这个积分规则已停用");
  }

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id, name")
    .eq("id", studentId)
    .eq("class_id", classId)
    .single();

  if (studentError || !student) {
    throw new Error("学生不存在");
  }

  const { error: logError } = await supabase.from("point_logs").insert({
    class_id: classId,
    student_id: studentId,
    teacher_id: user.id,
    rule_id: rule.id,
    points: rule.points,
    reason: rule.title,
  });

  if (logError) {
    throw new Error(logError.message);
  }

  const { data: pet, error: petError } = await supabase
    .from("pets")
    .select("id, exp, mood, hunger")
    .eq("student_id", studentId)
    .single();

  if (petError || !pet) {
    throw new Error("宠物不存在");
  }

  const newExp = Math.max(0, pet.exp + rule.points);
  const newLevel = calculateLevel(newExp);
  const moodChange = rule.points > 0 ? 2 : -3;
  const newMood = clamp(pet.mood + moodChange, 0, 100);

  const { error: updatePetError } = await supabase
    .from("pets")
    .update({
      exp: newExp,
      level: newLevel,
      mood: newMood,
    })
    .eq("id", pet.id);

  if (updatePetError) {
    throw new Error(updatePetError.message);
  }

  revalidatePath(`/classes/${classId}/checkin`);
  revalidatePath(`/classes/${classId}/students`);
  revalidatePath(`/classes/${classId}`);
}