import { authOptions } from "@/modules/auth/lib/authOptions";
import NextAuth from "next-auth";

export const fetchCache = "force-no-store";

const { handlers } = NextAuth(authOptions);

export const { GET, POST } = handlers;