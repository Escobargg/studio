
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { ArrowLeft, CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type { Grupo } from "@/components/asset-group-card";
import { MainLayout } from "@/components/main-layout";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useParams } from "next/navigation";


const strategyFormSchema = z.object({
  nomeEstrategia: z.string().min(1, "O nome da estratégia é obrigatório."),
  prioridade: z.enum(["BAIXA", "MEDIA", "ALTA"], { required_error: "Selecione a prioridade." }),
  descricao: z.string().optional(),
  frequenciaValor: z.coerce.number().min(1, "O valor deve ser maior que zero."),
  frequenciaUnidade: z.enum(["DIAS", "SEMANAS", "MESES", "ANOS"], { required_error: "Selecione a unidade." }),
  tolerancia: z.coerce.number().min(0, "A tolerância não pode ser negativa.").optional(),
  duracaoValor: z.coerce.number().min(1, "O valor deve ser maior que zero."),
  duracaoUnidade: z.enum(["HORAS", "DIAS"], { required_error: "Selecione a unidade." }),
  dataInicio: z.date({ required_error: "A data de início é obrigatória." }),
  dataFim: z.date().optional(),
  ativa: z.boolean().default(true),
});

type StrategyFormValues = z.infer<typeof strategyFormSchema>;

async function getGroupDetails(groupId: string): Promise<Grupo | null> {
  const { data, error } = await supabase
    .from("grupos_de_ativos")
    .select("nome_grupo, unidade, centro_de_localizacao")
    .eq("id", groupId)
    .single();

  if (error) {
    console.error("Error fetching group details:", error);
    return null;
  }
  return data as Grupo;
}

export default function NovaEstrategiaPage() {
  const params = useParams();
  const groupId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<StrategyFormValues>({
    resolver: zodResolver(strategyFormSchema),
    defaultValues: {
      nomeEstrategia: "",
      descricao: "",
      frequenciaValor: 1,
      tolerancia: 0,
      duracaoValor: 1,
      ativa: true,
    },
  });

  useEffect(() => {
    if (!groupId) return;

    const fetchGroup = async () => {
      setLoading(true);
      const groupDetails = await getGroupDetails(groupId);
      setGrupo(groupDetails);
      setLoading(false);
    };

    fetchGroup();
  }, [groupId]);


  async function onSubmit(data: StrategyFormValues) {
    setIsSubmitting(true);
    if (!groupId) {
        toast({
            title: "Erro",
            description: "ID do grupo não encontrado.",
            variant: "destructive",
        });
        setIsSubmitting(false);
        return;
    }
    
    const { error } = await supabase
        .from('estrategias')
        .insert({
            grupo_id: groupId,
            nome: data.nomeEstrategia,
            prioridade: data.prioridade,
            descricao: data.descricao,
            frequencia_valor: data.frequenciaValor,
            frequencia_unidade: data.frequenciaUnidade,
            tolerancia_dias: data.tolerancia,
            duracao_valor: data.duracaoValor,
            duracao_unidade: data.duracaoUnidade,
            data_inicio: data.dataInicio.toISOString(),
            data_fim: data.dataFim?.toISOString() || null,
            ativa: data.ativa,
            status: data.ativa ? "ATIVA" : "INATIVA",
        });

    if (error) {
        console.error("Error creating strategy:", error);
        toast({
            title: "Erro ao criar estratégia",
            description: "Ocorreu um erro ao salvar a nova estratégia.",
            variant: "destructive",
        });
    } else {
        toast({
            title: "Estratégia Criada!",
            description: "A nova estratégia foi salva com sucesso.",
        });
        router.push(`/grupos/${groupId}/estrategias`);
    }

    setIsSubmitting(false);
  }
  
  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!grupo) {
    return (
      <MainLayout>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xl text-muted-foreground">Grupo não encontrado.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
             <div className="max-w-4xl mx-auto">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="flex items-center gap-4 mb-6">
                            <Button variant="outline" size="icon" asChild>
                                <Link href={`/grupos/${groupId}/estrategias`}>
                                    <ArrowLeft className="h-4 w-4" />
                                    <span className="sr-only">Voltar</span>
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold">Criar Nova Estratégia</h1>
                                <p className="text-muted-foreground">
                                    Para o grupo: {grupo.nome_grupo}
                                </p>
                            </div>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Informações Básicas</CardTitle>
                                <CardDescription>Defina o nome, prioridade e descrição da estratégia.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="nomeEstrategia"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome da Estratégia</FormLabel>
                                        <FormControl>
                                        <Input placeholder="Ex: Manutenção Preventiva Quinzenal" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="prioridade"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Prioridade</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Selecione a prioridade" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="BAIXA">Baixa</SelectItem>
                                            <SelectItem value="MEDIA">Média</SelectItem>
                                            <SelectItem value="ALTA">Alta</SelectItem>
                                        </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="descricao"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descrição</FormLabel>
                                        <FormControl>
                                        <Textarea
                                            placeholder="Descreva os detalhes da estratégia..."
                                            className="resize-none"
                                            {...field}
                                        />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                             <CardHeader>
                                <CardTitle>Frequência e Duração</CardTitle>
                                <CardDescription>Configure o intervalo e a duração das paradas de manutenção.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="frequenciaValor"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Frequência</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="frequenciaUnidade"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unidade de Frequência</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="DIAS">Dias</SelectItem>
                                                <SelectItem value="SEMANAS">Semanas</SelectItem>
                                                <SelectItem value="MESES">Meses</SelectItem>
                                                <SelectItem value="ANOS">Anos</SelectItem>
                                            </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="tolerancia"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tolerância (dias)</FormLabel>
                                            <FormControl><Input type="number" placeholder="Ex: 2" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <FormField
                                        control={form.control}
                                        name="duracaoValor"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Duração da Parada</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="duracaoUnidade"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unidade de Duração</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="HORAS">Horas</SelectItem>
                                                <SelectItem value="DIAS">Dias</SelectItem>
                                            </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                             <CardHeader>
                                <CardTitle>Período e Status</CardTitle>
                                <CardDescription>Defina quando a estratégia estará ativa.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="dataInicio"
                                        render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Data de Início</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                    {field.value ? (format(field.value, "PPP", { locale: ptBR })) : (<span>Escolha uma data</span>)}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="dataFim"
                                        render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Data de Fim (Opcional)</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
                                                    {field.value ? (format(field.value, "PPP", { locale: ptBR })) : (<span>Indefinida</span>)}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => form.getValues("dataInicio") ? date < form.getValues("dataInicio") : false} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="ativa"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-start space-x-3 space-y-0 rounded-md pt-2">
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                                <FormLabel className="font-normal mb-0">
                                                Estratégia ativa
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                        
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" type="button" asChild>
                                <Link href={`/grupos/${groupId}/estrategias`}>Cancelar</Link>
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? "Salvando..." : "Salvar Estratégia"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    </MainLayout>
  );
}
