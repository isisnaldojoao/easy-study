"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/schemas/auth";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RecuperarSenhaPage() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await resetPassword(data.email);
      toast.success("Enviamos o link para redefinir a senha.");
      router.push("/login");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível redefinir a senha."
      );
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Recuperar senha</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Informe o e-mail da conta. O Supabase manda um link para você criar uma
          senha nova.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar link"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Lembrou a senha?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Voltar ao login
        </Link>
      </p>
    </div>
  );
}
