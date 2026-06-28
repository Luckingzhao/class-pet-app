"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

const DEFAULT_REWARDS = [
  {
    title: "免作业一次",
    description: "学生可在老师允许的情况下免做一次普通作业。",
  },
  {
    title: "优美明信片一张",
    description: "获得老师准备的一张精美明信片。",
  },
  {
    title: "和老师合影一次",
    description: "可以和老师拍一张纪念合影。",
  },
  {
    title: "老师表扬卡一张",
    description: "获得一张来自老师的公开表扬卡。",
  },
  {
    title: "优先选择座位一次",
    description: "在老师安排下优先选择一次座位。",
  },
  {
    title: "课堂小游戏优先参与",
    description: "下一次课堂小游戏可以优先参与。",
  },
  {
    title: "当一天小组长",
    description: "获得一天小组长体验机会。",
  },
  {
    title: "宠物稀有装扮一次",
    description: "可以为自己的宠物获得一次特殊装扮机会。",
  },
  {
    title: "神秘鼓励卡一张",
    description: "获得一张充满惊喜的神秘鼓励卡。",
  },
  {
    title: "午休小助手一次",
    description: "可以担任一次午休小助手。",
  },
];

function getDrawTimes(totalPoints: number) {
  if (totalPoints >= 100) return 3;
  if (totalPoints >= 80) return 2;
  if (totalPoints >= 50) return 1;
  return 0;
}

async function requireTeacherClass(classId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: classItem, error } = await supabase
    .from("classes")
    .select("id, teacher_id")
    .eq("id", classId)
    .eq("teacher_id", user.id)
    .single();

  if (error || !classItem) {
    throw new Error("没有权限操作这个班级");
  }

  return { supabase, user };
}

export async function initDefaultRewards(classId: string) {
  const { supabase } = await requireTeacherClass(classId);

  const { data: existingRewards, error: existingError } = await supabase
    .from("rewards")
    .select("id")
    .eq("class_id", classId)
    .limit(1);

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existingRewards && existingRewards.length > 0) {
    return;
  }

  const { error } = await supabase.from("rewards").insert(
    DEFAULT_REWARDS.map((reward) => ({
      class_id: classId,
      title: reward.title,
      description: reward.description,
      active: true,
    }))
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/classes/${classId}/rewards`);
}

export async function createReward(formData: FormData) {
  const classId = String(formData.get("classId") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!classId) {
    throw new Error("缺少班级 ID");
  }

  if (!title) {
    throw new Error("请输入奖励名称");
  }

  const { supabase } = await requireTeacherClass(classId);

  const { error } = await supabase.from("rewards").insert({
    class_id: classId,
    title,
    description: description || null,
    active: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/classes/${classId}/rewards`);
}

export async function toggleRewardActive(formData: FormData) {
  const classId = String(formData.get("classId") || "");
  const rewardId = String(formData.get("rewardId") || "");
  const active = String(formData.get("active") || "") === "true";

  if (!classId || !rewardId) {
    throw new Error("缺少奖励信息");
  }

  const { supabase } = await requireTeacherClass(classId);

  const { error } = await supabase
    .from("rewards")
    .update({
      active: !active,
    })
    .eq("id", rewardId)
    .eq("class_id", classId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/classes/${classId}/rewards`);
}

export async function deleteReward(formData: FormData) {
  const classId = String(formData.get("classId") || "");
  const rewardId = String(formData.get("rewardId") || "");

  if (!classId || !rewardId) {
    throw new Error("缺少奖励信息");
  }

  const { supabase } = await requireTeacherClass(classId);

  const { error } = await supabase
    .from("rewards")
    .delete()
    .eq("id", rewardId)
    .eq("class_id", classId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/classes/${classId}/rewards`);
}

export async function drawReward(formData: FormData) {
  const classId = String(formData.get("classId") || "");
  const studentId = String(formData.get("studentId") || "");

  if (!classId || !studentId) {
    throw new Error("缺少抽奖信息");
  }

  const { supabase } = await requireTeacherClass(classId);

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id, name")
    .eq("id", studentId)
    .eq("class_id", classId)
    .single();

  if (studentError || !student) {
    throw new Error("没有找到这个学生");
  }

  const { data: pointLogs, error: pointLogsError } = await supabase
    .from("point_logs")
    .select("points")
    .eq("class_id", classId)
    .eq("student_id", studentId);

  if (pointLogsError) {
    throw new Error(pointLogsError.message);
  }

  const totalPoints =
    pointLogs?.reduce((sum, log) => sum + Number(log.points || 0), 0) || 0;

  const allowedDrawTimes = getDrawTimes(totalPoints);

  const { count: usedDrawTimes, error: countError } = await supabase
    .from("reward_logs")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("class_id", classId)
    .eq("student_id", studentId);

  if (countError) {
    throw new Error(countError.message);
  }

  const usedTimes = usedDrawTimes || 0;
  const remainingTimes = allowedDrawTimes - usedTimes;

  if (remainingTimes <= 0) {
    throw new Error("这个学生当前没有剩余抽奖次数");
  }

  const { data: rewards, error: rewardsError } = await supabase
    .from("rewards")
    .select("id, title")
    .eq("class_id", classId)
    .eq("active", true);

  if (rewardsError) {
    throw new Error(rewardsError.message);
  }

  if (!rewards || rewards.length === 0) {
    throw new Error("当前没有可抽取的奖励，请先添加奖励");
  }

  const randomIndex = Math.floor(Math.random() * rewards.length);
  const selectedReward = rewards[randomIndex];

  const { error: insertError } = await supabase.from("reward_logs").insert({
    class_id: classId,
    student_id: studentId,
    reward_id: selectedReward.id,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  revalidatePath(`/classes/${classId}/rewards`);
}