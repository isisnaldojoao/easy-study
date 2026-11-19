"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "@/schemas/auth";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CadastroPage() {
  const router = useRouter();
  const { register: registerAccount } = useAuth();
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const status = await registerAccount(data);
      if (status === "confirm_email") {
        setPendingEmail(data.email.trim().toLowerCase());
        toast.success("Conta criada", {
          description: "Falta abrir o link que enviamos para o seu e-mail.",
        });
        return;
      }
      toast.success("Conta criada com sucesso!");
      router.replace("/dashboard");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível criar a conta."
      );
    }
  });

  if (pendingEmail) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Mail className="size-5" />
          </span>
          <div>
            <p className="text-xs font-medium tracking-wide text-primary uppercase">
              Conta criada
            </p>
            <h2 className="mt-1 text-xl font-semibold">Confirme seu e-mail</h2>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Enviamos um link para{" "}
          <span className="font-medium text-foreground">{pendingEmail}</span>. A
          conta só entra depois dessa confirmação.
        </p>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li>1. Abra a caixa de entrada. Se não aparecer, olhe o spam.</li>
          <li>2. Clique no link de confirmação.</li>
          <li>3. Volte e entre com o mesmo e-mail e senha.</li>
        </ol>
        <Button asChild className="w-full">
          <Link href="/login">Ir para o login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Criar conta</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Comece a organizar seus estudos agora.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input id="name" autoComplete="name" {...register("name")} />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Já tem uma conta?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
