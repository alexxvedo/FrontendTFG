"use server";
import { signOut } from "@/app/utils/auth";
import { redirect } from "next/navigation";

export async function handleSignOut() {
  console.log("handleSignOut");
  await signOut();
  redirect("/login");
}
