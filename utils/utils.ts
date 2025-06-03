import { redirect } from "next/navigation";

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */





export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string
) {
  const url = new URL(path, "http://localhost"); // base is arbitrary for URL parsing
  url.searchParams.set("status", type);
  url.searchParams.set("message", message);
  return redirect(`${url.pathname}?${url.searchParams.toString()}`);
}
