"use server";

import { createClient } from "../../../lib/supabase/server";

export async function drawReward(formData: FormData) {
  const classId = formData.get("classId") as string;
  const studentId = formData.get("studentId") as string;

  const supabase = await createClient();

  // 1. 学生信息
  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", studentId)
    .single();

  if (!student) {
    return { success: false, error: "学生不存在" };
  }

  // 2. 奖励池
  const { data: rewards } = await supabase
    .from("rewards")
    .select("*")
    .eq("class_id", classId)
    .eq("active", true);

  if (!rewards || rewards.length === 0) {
    return { success: false, error: "没有可用奖励" };
  }

  // 3. 随机抽奖
  const reward = rewards[Math.floor(Math.random() * rewards.length)];

  // 4. 写入记录
  const { error } = await supabase.from("reward_logs").insert({
    class_id: classId,
    student_id: studentId,
    reward_id: reward.id,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    rewardTitle: reward.title,
    studentName: student.name,
  };
}