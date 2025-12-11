"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    orientador: "",
    laboratorio: "",
    bolsa: "",
    weeklyWorkloadHours: "20",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          weeklyWorkloadHours: Number(formData.weeklyWorkloadHours),
        }),
      });

      if (res.ok) {
        router.push("/entrar?registered=true");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.message || "Erro ao criar conta. Tente novamente.");
      }
    } catch (err) {
      setError("Ocorreu um erro ao tentar criar a conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4 lg:p-8 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
      </div>

      <Card className="w-full max-w-lg shadow-2xl border-border/50 bg-card/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo_clips.svg"
              alt="Logo"
              width={400}
              height={120}
              className="h-auto w-auto max-h-12"
              priority
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Criar Conta</CardTitle>
          <CardDescription>Preencha os dados para começar a usar o sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-3">
              <Label htmlFor="name">Nome Completo (Bolsista)</Label>
              <Input
                id="name"
                name="name"
                placeholder="Seu nome"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="orientador">Orientador</Label>
                <Input
                  id="orientador"
                  name="orientador"
                  placeholder="Nome do orientador"
                  value={formData.orientador}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="laboratorio">Laboratório</Label>
                <Input
                  id="laboratorio"
                  name="laboratorio"
                  placeholder="Nome do laboratório"
                  value={formData.laboratorio}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="bolsa">Bolsa</Label>
                <Input
                  id="bolsa"
                  name="bolsa"
                  placeholder="Tipo de bolsa"
                  value={formData.bolsa}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="weeklyWorkloadHours">Carga Horária Semanal</Label>
                <Input
                  id="weeklyWorkloadHours"
                  name="weeklyWorkloadHours"
                  type="number"
                  placeholder="20"
                  value={formData.weeklyWorkloadHours}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium animate-in fade-in slide-in-from-top-1 flex items-center justify-center">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Criar Conta
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/entrar" className="text-primary hover:underline font-medium">
              Fazer login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
