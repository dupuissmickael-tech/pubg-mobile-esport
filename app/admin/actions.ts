"use server";

import { revalidatePath } from "next/cache";
import { setSignalementStatus } from "@/lib/db";

export async function publishAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  await setSignalementStatus(id, "published");
  revalidatePath("/admin");
  revalidatePath("/signalements");
}

export async function rejectAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  await setSignalementStatus(id, "rejected");
  revalidatePath("/admin");
}
