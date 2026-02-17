// This route is protected by Cloudflare Access.
// When a user hits /auth/login, Cloudflare Access intercepts the request,
// redirects to Google login, and after authentication sets the CF_Authorization cookie.
// Once authenticated, this handler runs and redirects the user back to the app.

export const onRequestGet: PagesFunction = async ({ request }) => {
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get('redirect') || '/';
  return Response.redirect(new URL(redirectTo, url.origin).toString(), 302);
};
