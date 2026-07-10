import React from "react";
import MessagesCenter from "@/components/messages/MessagesCenter";
import type { UserRole } from "@/lib/roles";

interface MessagesPageProps {
  role: UserRole;
}

export default function MessagesPage({ role }: MessagesPageProps) {
  return <MessagesCenter role={role} />;
}
