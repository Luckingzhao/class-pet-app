import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function POST(req: Request) {
  const { classCode, name, viewCode } = await req.json();

  const supabase = await createClient();

  // 1. 找班级
  const { data: classData } = await supabase
    .from("classes")
    .select("id")
    .eq("invite_code", classCode)
    .single();

  if (!classData) {
    return NextResponse.json(
      { error: "班级不存在" },
      { status: 400 }
    );
  }

  // 2. 找学生 + 验证查看码
  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("class_id", classData.id)
    .eq("name", name)
    .eq("view_code", viewCode)
    .single();

  if (!student) {
    return NextResponse.json(
      { error: "姓名或查看码错误" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    student,
  });
}