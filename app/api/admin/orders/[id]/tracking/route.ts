import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "owner") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { tracking_number } = (await request.json()) as { tracking_number: string };

  if (!tracking_number?.trim()) {
    return NextResponse.json({ error: "Tracking number required" }, { status: 400 });
  }

  const service = createServiceClient();
  const { error } = await service
    .from("orders")
    .update({ tracking_number: tracking_number.trim(), status: "shipped" })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}