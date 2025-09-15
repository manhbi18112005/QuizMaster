import "next-auth"
import { DefaultSession } from "next-auth" // Added DefaultSession
import { GitHubUser } from "./github-user"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: GitHubUser & DefaultSession["user"] // Updated user type
  }
}
