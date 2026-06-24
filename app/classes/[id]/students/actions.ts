"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

const AVATARS = [
  "🐱", "🐶", "🐰", "🐼", "🦊", "🐯", "🦁", "🐸", "🐵", "🐨",
  "🐻", "🐷", "🐹", "🐭", "🐧", "🐤", "🦄", "🐲", "🐙", "🦖",
  "🦕", "🐢", "🐳", "🐬", "🦈", "🐝", "🦋", "🐞", "🦉", "🦅",
  "🐺", "🦝", "🦥", "🦦", "🦔", "🐿️", "🦘", "🦒", "🦓", "🐘",
  "🦛", "🦏", "🐪", "🐫", "🦙", "🐐", "🐑", "🐴", "🐮", "🐥",
];

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

function generateViewCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getRandomAvatar() {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}

export async function addStudent(classId: string, formData: FormData) {
  const { supabase, user } = await getCurrentUser();

  const name = String(formData.get("name") || "").trim();
  const studentNo = String(formData.get("student_no") || "").trim();
  const groupName = String(formData.get("group_name") || "").trim();
  const avatar = String(formData.get("avatar") || "").trim() || getRandomAvatar();

  if (!name) {
    throw new Error("学生姓名不能为空");
  }

  const { data: classItem } = await supabase
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", user.id)
    .single();

  if (!classItem) {
    throw new Error("没有权限操作这个班级");
  }

  const viewCode = generateViewCode();

  const { data: student, error: studentError } = await supabase
    .from("students")
    .insert({
      class_id: classId,
      name,
      student_no: studentNo || null,
      group_name: groupName || null,
      view_code: viewCode,
      avatar,
    })
    .select("id, name")
    .single();

  if (studentError || !student) {
    throw new Error(studentError?.message || "添加学生失败");
  }

  const { error: petError } = await supabase.from("pets").insert({
    student_id: student.id,
    name: `${student.name}的小宠物`,
    pet_type: "cat",
    level: 1,
    exp: 0,
    mood: 80,
    hunger: 80,
  });

  if (petError) {
    throw new Error(petError.message);
  }

  revalidatePath(`/classes/${classId}/students`);
  revalidatePath(`/classes/${classId}`);
}

export async function updateStudentAvatar(
  classId: string,
  studentId: string,
  formData: FormData
) {
  const { supabase, user } = await getCurrentUser();

  const avatar = String(formData.get("avatar") || "").trim();

  if (!avatar) {
    throw new Error("请选择头像");
  }

  const { data: classItem } = await supabase
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", user.id)
    .single();

  if (!classItem) {
    throw new Error("没有权限操作这个班级");
  }

  const { error } = await supabase
    .from("students")
    .update({ avatar })
    .eq("id", studentId)
    .eq("class_id", classId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/classes/${classId}/students`);
  revalidatePath(`/classes/${classId}`);
}

export async function deleteStudent(classId: string, studentId: string) {
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

  const { error } = await supabase
    .from("students")
    .delete()
    .eq("id", studentId)
    .eq("class_id", classId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/classes/${classId}/students`);
  revalidatePath(`/classes/${classId}`);
}