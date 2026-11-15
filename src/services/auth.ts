import { nanoid } from "nanoid";
import { createSalt, hashPassword, verifyPassword } from "@/lib/crypto";
import { db } from "@/lib/db";
import { nowISO } from "@/lib/dates";
import { clearSession, getSession, setSession } from "@/lib/session";
import type { RegisterInput, ResetPasswordInput } from "@/schemas/auth";
import type { Session, User, UserPreferences } from "@/types";

const defaultPreferences: UserPreferences = {
  theme: "system",
  defaultReminderDays: 1,
  notificationsEnabled: true,
  browserPushEnabled: false,
};

export async function registerUser(input: RegisterInput): Promise<Session> {
  const email = input.email.trim().toLowerCase();
  const existing = await db.users.where("email").equals(email).first();
  if (existing) {
    throw new Error("Já existe uma conta com este e-mail.");
  }

  const salt = createSalt();
  const passwordHash = await hashPassword(input.password, salt);
  const user: User = {
    id: nanoid(),
    name: input.name.trim(),
    email,
    passwordHash,
    salt,
    createdAt: nowISO(),
    preferences: defaultPreferences,
  };

  await db.users.add(user);
  const session: Session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    loggedAt: nowISO(),
  };
  setSession(session);
  return session;
}

export async function loginUser(email: string, password: string): Promise<Session> {
  const normalized = email.trim().toLowerCase();
  const user = await db.users.where("email").equals(normalized).first();
  if (!user) {
    throw new Error("E-mail ou senha inválidos.");
  }

  const valid = await verifyPassword(password, user.salt, user.passwordHash);
  if (!valid) {
    throw new Error("E-mail ou senha inválidos.");
  }

  const session: Session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    loggedAt: nowISO(),
  };
  setSession(session);
  return session;
}

export async function resetPassword(input: ResetPasswordInput) {
  const email = input.email.trim().toLowerCase();
  const user = await db.users.where("email").equals(email).first();
  if (!user) {
    throw new Error("Não encontramos uma conta com este e-mail.");
  }

  const salt = createSalt();
  const passwordHash = await hashPassword(input.password, salt);
  await db.users.update(user.id, { salt, passwordHash });
}

export function logoutUser() {
  clearSession();
}

export function currentSession() {
  return getSession();
}

export async function getCurrentUser(): Promise<User | null> {
  const session = getSession();
  if (!session) return null;
  return (await db.users.get(session.userId)) ?? null;
}

export async function updateUserProfile(
  userId: string,
  data: Partial<Pick<User, "name" | "preferences">>
) {
  await db.users.update(userId, data);
  const session = getSession();
  if (session && data.name) {
    setSession({ ...session, name: data.name });
  }
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await db.users.get(userId);
  if (!user) throw new Error("Usuário não encontrado.");

  const valid = await verifyPassword(
    currentPassword,
    user.salt,
    user.passwordHash
  );
  if (!valid) throw new Error("Senha atual incorreta.");

  const salt = createSalt();
  const passwordHash = await hashPassword(newPassword, salt);
  await db.users.update(userId, { salt, passwordHash });
}
