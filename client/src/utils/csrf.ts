export function getCSRFToken(): string | null {
  const match = document.cookie.match(/(^| )csrf_token=([^;]+)/);
  return match ? match[2] : null;
}
