import { cookies } from "next/headers"
import { verifyToken } from "./jwt"

export async function getAuthToken() {
  const cookieStore = await cookies()
  return cookieStore.get("auth_token")?.value
}

export async function getUserFromToken() {
  const token = await getAuthToken()
  if (!token) return null

  const decoded = verifyToken(token) as any
  return decoded
}
