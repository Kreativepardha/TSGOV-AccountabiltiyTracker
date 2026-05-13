export function verifyAdminKey(request: Request): boolean {
  const key = request.headers.get("x-admin-key")
  return Boolean(process.env.ADMIN_API_KEY && key === process.env.ADMIN_API_KEY)
}

export function unauthorizedResponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 })
}
