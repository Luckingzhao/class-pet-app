"use server";

import { createClient } from "../../../lib/supabase/server";

export async function drawReward(formData: FormData) {
  const classId = formData.get("classId") as string;
  const studentId = formData.get("studentId") as string;

  const supabase = await createClient();

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", studentId)
    .single();

  if (!student) {
    return { success: false, error: "学生不存在" };
  }

  const { data: pointLogs } = await supabase
    .from("point_logs")
    .select("points")
    .eq("class_id", classId)
    .eq("student_id", studentId);

  const totalPoints =
    (pointLogs || []).reduce(
      (sum, i) => sum + Number(i.points || 0),
      0
    );

  let allowed = 0;
  if (totalPoints >= 100) allowed = 3;
  else if (totalPoints >= 80) allowed = 2;
  else if (totalPoints >= 50) allowed = 1;

  const { data: rewardLogs } = await supabase
    .from("reward_logs")
    .select("id")
    .eq("class_id", classId)
    .eq("student_id", studentId);

  const used = rewardLogs?.length || 0;

  const remaining = allowed - used;

  if (remaining <= 0) {
    return {
      success: false,
      error: "抽奖次数已用完",
      remaining: 0,
    };
  }

  const { data: rewards } = await supabase
    .from("rewards")
    .select("*")
    .eq("class_id", classId)
    .eq("active", true);

  if (!rewards?.length) {
    return { success: false, error: "没有奖励" };
  }

  const reward =
    rewards[Math.floor(Math.random() * rewards.length)];

  await supabase.from("reward_logs").insert({
    class_id: classId,
    student_id: studentId,
    reward_id: reward.id,
  });

  return {
    success: true,
    rewardTitle: reward.title,
    studentName: student.name,
    remaining: remaining - 1,
  };
}