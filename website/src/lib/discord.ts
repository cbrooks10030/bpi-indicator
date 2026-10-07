// Minimal Discord REST helpers using the bot token. We avoid discord.js so
// this runs fine in serverless functions (no gateway connection needed).

const API = "https://discord.com/api/v10";

function botHeaders() {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) throw new Error("DISCORD_BOT_TOKEN is not set");
  return {
    Authorization: `Bot ${token}`,
    "Content-Type": "application/json",
  };
}

export function discordConfigured(): boolean {
  return Boolean(
    process.env.DISCORD_BOT_TOKEN &&
      process.env.DISCORD_GUILD_ID &&
      process.env.DISCORD_MEMBER_ROLE_ID
  );
}

/** Exchange an OAuth2 code for the access token + the Discord user object. */
export async function exchangeCode(code: string, redirectUri: string) {
  const clientId = process.env.DISCORD_CLIENT_ID!;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET!;
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });
  const tokenRes = await fetch(`${API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!tokenRes.ok) {
    throw new Error(`Discord token exchange failed: ${await tokenRes.text()}`);
  }
  const token = (await tokenRes.json()) as { access_token: string };

  const userRes = await fetch(`${API}/users/@me`, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!userRes.ok) {
    throw new Error(`Discord user fetch failed: ${await userRes.text()}`);
  }
  const user = (await userRes.json()) as { id: string; username: string };
  return { accessToken: token.access_token, user };
}

/** Add the user to the guild (if not already in it) with the members role. */
export async function addMemberWithRole(userId: string, accessToken: string) {
  const guildId = process.env.DISCORD_GUILD_ID!;
  const roleId = process.env.DISCORD_MEMBER_ROLE_ID!;

  // guilds.join requires the OAuth access token; assigns role on join.
  const joinRes = await fetch(`${API}/guilds/${guildId}/members/${userId}`, {
    method: "PUT",
    headers: botHeaders(),
    body: JSON.stringify({ access_token: accessToken, roles: [roleId] }),
  });

  // 201 = added, 204 = already a member. If already a member, add the role.
  if (joinRes.status === 204) {
    await addRole(userId);
  } else if (!joinRes.ok) {
    throw new Error(`Discord guild join failed: ${await joinRes.text()}`);
  }
}

export async function addRole(userId: string) {
  const guildId = process.env.DISCORD_GUILD_ID!;
  const roleId = process.env.DISCORD_MEMBER_ROLE_ID!;
  const res = await fetch(
    `${API}/guilds/${guildId}/members/${userId}/roles/${roleId}`,
    { method: "PUT", headers: botHeaders() }
  );
  if (!res.ok && res.status !== 204) {
    throw new Error(`Discord add role failed: ${await res.text()}`);
  }
}

export async function removeRole(userId: string) {
  const guildId = process.env.DISCORD_GUILD_ID!;
  const roleId = process.env.DISCORD_MEMBER_ROLE_ID!;
  const res = await fetch(
    `${API}/guilds/${guildId}/members/${userId}/roles/${roleId}`,
    { method: "DELETE", headers: botHeaders() }
  );
  if (!res.ok && res.status !== 204) {
    throw new Error(`Discord remove role failed: ${await res.text()}`);
  }
}
