"use server";

import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";

export async function joinClass(formData: FormData) {
  const inviteCode = String(formData.get("invite_code") || "")
    .trim()
    .toUpperCase();

  const studentName = String(formData.get("student_name") || "").trim();

  if (!inviteCode || !studentName) {
    redirect("/join?error=missing");
  }

  const supabase = await createClient();

  const { data: classItem, error: classError } = await supabase
    .from("classes")
    .select("id, name, invite_code")
    .eq("invite_code", inviteCode)
    .single();

  if (classError || !classItem) {
    redirect("/join?error=class_not_found");
  }

  const { data: students, error: studentError } = await supabase
    .from("students")
    .select("id, name, class_id")
    .eq("class_id", classItem.id)
    .eq("name", studentName)
    .limit(1);

  if (studentError || !students || students.length === 0) {
    redirect("/join?error=student_not_found");
  }

  redirect(`/student/${students[0].id}`);
}