
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { ArrowLeft, CalendarIcon, Loader2, PlusCircle, Trash2 } from "lucide-react";
import { format, differenceInHours, set } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { MainLayout } from "@/components/main-layout";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useParams } from "next/navigation";
import { getEspecialidades, type Especialidade } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { Progress } from "@/components/ui/progress";

const equipeSchema = z.object({
  id: z.string().optional(), // For existing records
  especialidade: z.string().min(1, "Especialidade é obrigatória."),
  capacidade: z.coerce.number().min(1, "Deve ser > 0.").default(1),
  hh: z.coerce.number().min(0, "HH deve ser preenchido."),
  hh_dia: z.coerce.number().min(0, "HH/Dia deve ser preenchido."),
});


const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const stopFormSchema = z.object({
  nomeParada: z.string().min(1, "O nome da parada é obrigatório."),
  // Hierarquia - não editável, mas precisa estar no schema para validação
  diretoria_executiva: z.string(),
  diretoria: z.string(),
  centroLocalizacao: z.string(),
  fase: z.string(),
  tipoSelecao: z.enum(["grupo", "ativo"]),
  grupoAtivos: z.string().optional(),
  ativo: z.string().optional(),
  // Planejamento
  dataInicioPlanejada: z.date({ required_error: "A data de início planejada é obrigatória." }),
  horaInicioPlanejada: z.string({ required_error: "A hora de início é obrigatória." }).regex(horaRegex, "Formato de hora inválido."),
  dataFimPlanejada: z.date({ required_error: "A data de fim planejada é obrigatória." }),
  horaFimPlanejada: z.string({ required_error: "A hora de fim é obrigatória." }).regex(horaRegex, "Formato de hora inválido."),
  // Realizado
  dataInicioRealizado: z.date().optional().nullable(),
  horaInicioRealizado: z.string().optional().nullable()
    .refine((val) => val === null || val === undefined || val === "" || horaRegex.test(val), {
        message: "Formato de hora inválido.",
    }),
  dataFimRealizado: z.date().optional().nullable(),
  horaFimRealizado: z.string().optional().nullable()
    .refine((val) => val === null || val === undefined || val === "" || horaRegex.test(val), {
        message: "Formato de hora inválido.",
    }),
  // Outros
  descricao: z.string().optional(),
  equipes: z.array(equipeSchema).optional(),
}).refine(data => {
    if (data.dataInicioPlanejada && data.horaInicioPlanejada && data.dataFimPlanejada && data.horaFimPlanejada) {
      const start = set(data.dataInicioPlanejada, { hours: parseInt(data.horaInicioPlanejada.split(':')[0]), minutes: parseInt(data.horaInicioPlanejada.split(':')[1]) });
      const end = set(data.dataFimPlanejada, { hours: parseInt(data.horaFimPlanejada.split(':')[0]), minutes: parseInt(data.horaFimPlanejada.split(':')[1]) });
      return end > start;
    }
    return true;
}, {
    message: "A data/hora final planejada deve ser posterior à data/hora inicial.",
    path: ["dataFimPlanejada"],
}).refine(data => {
    if (data.dataInicioRealizado && data.horaInicioRealizado && data.dataFimRealizado && data.horaFimRealizado) {
        if(!data.horaInicioRealizado || !data.horaFimRealizado) return true;
        const start = set(data.dataInicioRealizado, { hours: parseInt(data.horaInicioRealizado.split(':')[0]), minutes: parseInt(data.horaInicioRealizado.split(':')[1]) });
        const end = set(data.dataFimRealizado, { hours: parseInt(data.horaFimRealizado.split(':')[0]), minutes: parseInt(data.horaFimRealizado.split(':')[1]) });
        return end > start;
    }
    return true;
}, {
    message: "A data/hora final realizada deve ser posterior à data/hora inicial.",
    path: ["dataFimRealizado"],
});


type StopFormValues = z.infer<typeof stopFormSchema>;

const combineDateTime = (date: Date | null | undefined, time: string | null | undefined): Date | null => {
  if (!date || !time || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [hours, minutes] = time.split(':').map(Number);
  return set(date, { hours, minutes, seconds: 0, milliseconds: 0 });
};

const splitDateTime = (dateTime: string | null | undefined): { date: Date | null, time: string | null } => {
    if (!dateTime) return { date: null, time: null };
    try {
        const d = new Date(dateTime);
        const date = d;
        const time = format(d, 'HH:mm');
        return { date, time };
    } catch (e) {
        return { date: null, time: null };
    }
}

const calculateCompletion = (start: Date | null | undefined, end: Date | null | undefined): number => {
    if (!start || !end) return 0;
    const now = new Date();
    const startDate = start;
    const endDate = end;

    if (now < startDate) return 0;
    if (now > endDate) return 100;

    const totalDuration = endDate.getTime() - startDate.getTime();
    if (totalDuration <= 0) return 100;

    const elapsedDuration = now.getTime() - startDate.getTime();
    const percentage = Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));
    
    return Math.round(percentage);
};


export default function EditarParadaPage() {
  const params = useParams();
  const stopId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(false);
  
  const form = useForm<StopFormValues>({
    resolver: zodResolver(stopFormSchema),
  });

  const { watch, control, setValue, getValues, trigger, reset } = form;

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "equipes",
  });

  const [duracaoPlanejada, setDuracaoPlanejada] = useState<number | null>(null);
  const [duracaoRealizada, setDuracaoRealizada] = useState<number | null>(null);
  const [completion, setCompletion] = useState(0);

  
  const watchedFields = watch([
      "dataInicioPlanejada", "horaInicioPlanejada", "dataFimPlanejada", "horaFimPlanejada",
      "dataInicioRealizado", "horaInicioRealizado", "dataFimRealizado", "horaFimRealizado"
  ]);

  const watchedEquipes = watch("equipes");
  const watchedCentro = watch("centroLocalizacao");
  const watchedFase = watch("fase");

  const handleEspecialidadeChange = (index: number, espNome: string) => {
    const especialidadeData = especialidades.find(e => e.especialidade === espNome);
    if (especialidadeData) {
        update(index, {
            ...getValues(`equipes.${index}`),
            especialidade: espNome,
            hh: especialidadeData.hh,
            capacidade: 1, // Reset capacidade to 1
            hh_dia: 1 * especialidadeData.hh
        });
        trigger(`equipes.${index}`);
    }
  };

  const handleCapacidadeChange = (index: number, capacidadeStr: string) => {
      const capacidade = parseInt(capacidadeStr, 10);
      const hh = getValues(`equipes.${index}.hh`) || 0;
      if (!isNaN(capacidade)) {
          setValue(`equipes.${index}.hh_dia`, capacidade * hh);
      }
  };

  const getCapacidadeOptions = (especialidadeNome: string | undefined): number[] => {
      if (!especialidadeNome) return [];
      const especialidade = especialidades.find(e => e.especialidade === especialidadeNome);
      if (!especialidade || !especialidade.capacidade) return [];
      return Array.from({ length: especialidade.capacidade }, (_, i) => i + 1);
  };
  
  const availableEspecialidades = especialidades.filter(
    (esp) => !watchedEquipes?.some((equipe) => equipe.especialidade === esp.especialidade)
  );

  useEffect(() => {
    async function fetchStopData() {
        if (!stopId) return;

        setLoading(true);
        const { data: stopData, error } = await supabase
            .from('paradas_de_manutencao')
            .select('*, recursos_parada(*)')
            .eq('id', stopId)
            .single();
        
        if (error || !stopData) {
            console.error("Error fetching stop data:", error);
            toast({ title: "Erro", description: "Parada não encontrada.", variant: "destructive" });
            router.push("/paradas");
            return;
        }
        
        const { date: dataInicioPlanejada, time: horaInicioPlanejada } = splitDateTime(stopData.data_inicio_planejada);
        const { date: dataFimPlanejada, time: horaFimPlanejada } = splitDateTime(stopData.data_fim_planejada);
        const { date: dataInicioRealizado, time: horaInicioRealizado } = splitDateTime(stopData.data_inicio_realizado);
        const { date: dataFimRealizado, time: horaFimRealizado } = splitDateTime(stopData.data_fim_realizado);

        reset({
            nomeParada: stopData.nome_parada,
            diretoria_executiva: stopData.diretoria_executiva,
            diretoria: stopData.diretoria,
            centroLocalizacao: stopData.centro_de_localizacao,
            fase: stopData.fase,
            tipoSelecao: stopData.tipo_selecao,
            grupoAtivos: stopData.grupo_de_ativos || "",
            ativo: stopData.ativo_unico || "",
            dataInicioPlanejada,
            horaInicioPlanejada,
            dataFimPlanejada,
            horaFimPlanejada,
            dataInicioRealizado,
            horaInicioRealizado,
            dataFimRealizado,
            horaFimRealizado,
            descricao: stopData.descricao || "",
            equipes: stopData.recursos_parada.map(r => ({
                id: r.id,
                especialidade: r.equipe,
                capacidade: r.capacidade,
                hh: r.hh,
                hh_dia: r.hh_dia,
            })),
        });

        // Fetch specialities after setting the context
        if (stopData.centro_de_localizacao && stopData.fase) {
            setLoadingEspecialidades(true);
            const especialidadesData = await getEspecialidades(stopData.centro_de_localizacao, stopData.fase);
            setEspecialidades(especialidadesData);
            setLoadingEspecialidades(false);
        }

        setLoading(false);
    }
    fetchStopData();
  }, [stopId, reset, toast, router]);


  useEffect(() => {
    const [
      dataInicioPlanejada, horaInicioPlanejada, dataFimPlanejada, horaFimPlanejada,
      dataInicioRealizado, horaInicioRealizado, dataFimRealizado, horaFimRealizado
    ] = watchedFields;

    const startPlanejado = combineDateTime(dataInicioPlanejada, horaInicioPlanejada);
    const endPlanejado = combineDateTime(dataFimPlanejada, horaFimPlanejada);

    if (startPlanejado && endPlanejado && endPlanejado > startPlanejado) {
        setDuracaoPlanejada(differenceInHours(endPlanejado, startPlanejado));
        setCompletion(calculateCompletion(startPlanejado, endPlanejado));
    } else {
        setDuracaoPlanejada(null);
        setCompletion(0);
    }

    const startRealizado = combineDateTime(dataInicioRealizado, horaInicioRealizado);
    const endRealizado = combineDateTime(dataFimRealizado, horaFimRealizado);

    if (startRealizado && endRealizado && endRealizado > startRealizado) {
        setDuracaoRealizada(differenceInHours(endRealizado, startRealizado));
    } else {
        setDuracaoRealizada(null);
    }
    
  }, [watchedFields]);

  async function onSubmit(data: StopFormValues) {
    setIsSubmitting(true);
    
    try {
        const dataInicioPlanejadaCompleta = combineDateTime(data.dataInicioPlanejada, data.horaInicioPlanejada);
        const dataFimPlanejadaCompleta = combineDateTime(data.dataFimPlanejada, data.horaFimPlanejada);
        
        if (!dataInicioPlanejadaCompleta || !dataFimPlanejadaCompleta) {
            throw new Error("Datas de planejamento inválidas.");
        }
        
        const duracaoPlanejadaHoras = differenceInHours(dataFimPlanejadaCompleta, dataInicioPlanejadaCompleta);
        
        const dataInicioRealizadoCompleta = combineDateTime(data.dataInicioRealizado, data.horaInicioRealizado);
        const dataFimRealizadoCompleta = combineDateTime(data.dataFimRealizado, data.horaFimRealizado);
        
        let duracaoRealizadaHoras = null;
        if (dataInicioRealizadoCompleta && dataFimRealizadoCompleta && dataFimRealizadoCompleta > dataInicioRealizadoCompleta) {
            duracaoRealizadaHoras = differenceInHours(dataFimRealizadoCompleta, dataInicioRealizadoCompleta);
        }
        
        const paradaData = {
          nome_parada: data.nomeParada,
          data_inicio_planejada: dataInicioPlanejadaCompleta.toISOString(),
          data_fim_planejada: dataFimPlanejadaCompleta.toISOString(),
          duracao_planejada_horas: duracaoPlanejadaHoras,
          data_inicio_realizado: dataInicioRealizadoCompleta?.toISOString() || null,
          data_fim_realizado: dataFimRealizadoCompleta?.toISOString() || null,
          duracao_realizada_horas: duracaoRealizadaHoras,
          descricao: data.descricao,
        };

        const { error: paradaError } = await supabase
            .from('paradas_de_manutencao')
            .update(paradaData)
            .eq('id', stopId);
        
        if (paradaError) throw paradaError;
        
        // Handle resources (equipes)
        // For simplicity, we delete all existing resources and re-insert them.
        // A more complex implementation could diff the arrays.
        const { error: deleteError } = await supabase
            .from('recursos_parada')
            .delete()
            .eq('parada_id', stopId);
        
        if(deleteError) throw deleteError;

        if (data.equipes && data.equipes.length > 0) {
            const recursosData = data.equipes.map(equipe => ({
                parada_id: stopId,
                equipe: equipe.especialidade,
                capacidade: equipe.capacidade,
                hh: equipe.hh,
                hh_dia: equipe.hh_dia,
            }));

            const { error: recursosError } = await supabase
                .from('recursos_parada')
                .insert(recursosData);

            if (recursosError) throw recursosError;
        }

        toast({
            title: "Parada Atualizada!",
            description: "A parada de manutenção foi atualizada com sucesso.",
        });
        router.push(`/paradas`);

    } catch(error: any) {
        console.error("Error updating data:", error);
        toast({
            title: "Erro ao atualizar parada",
            description: "Ocorreu um erro ao salvar a parada. Verifique os dados e tente novamente. Detalhes: " + error.message,
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
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

  return (
    <MainLayout>
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" asChild>
                  <Link href="/paradas">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Voltar</span>
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Editar Parada de Manutenção</h1>
                  <p className="text-muted-foreground">
                    Modifique as informações da parada de manutenção
                  </p>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                      control={control}
                      name="nomeParada"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Parada</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Parada Geral Transportadores" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center mb-1">
                            <FormLabel>Progresso</FormLabel>
                            <span className="text-sm font-semibold text-primary">{completion}%</span>
                        </div>
                        <Progress value={completion} className="h-2"/>
                    </div>


                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={control}
                      name="diretoria_executiva"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diretoria Executiva</FormLabel>
                          <FormControl><Input {...field} disabled /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={control}
                      name="diretoria"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diretoria</FormLabel>
                          <FormControl><Input {...field} disabled /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField
                      control={control}
                      name="centroLocalizacao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Centro de Localização</FormLabel>
                          <FormControl><Input {...field} disabled /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={control}
                      name="fase"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fase</FormLabel>
                          <FormControl><Input {...field} disabled /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                      control={control}
                      name="tipoSelecao"
                      render={({ field }) => (
                        <FormItem className="space-y-3 pt-2">
                          <FormLabel>Criar parada para:</FormLabel>
                          <FormControl>
                            <RadioGroup
                              value={field.value}
                              className="flex space-x-4"
                              disabled
                            >
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="grupo" />
                                </FormControl>
                                <FormLabel className="font-normal">Grupo de Ativo</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="ativo" />
                                </FormControl>
                                <FormLabel className="font-normal">Ativo Único</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watch("tipoSelecao") === "grupo" && (
                        <FormField
                            control={control}
                            name="grupoAtivos"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Grupo de Ativos</FormLabel>
                                <FormControl><Input {...field} disabled /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    )}

                    {watch("tipoSelecao") === "ativo" && (
                         <FormField
                            control={control}
                            name="ativo"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ativo Único</FormLabel>
                                <FormControl><Input {...field} disabled /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                    <CardTitle>Planejamento</CardTitle>
                    <CardDescription>Datas e horários planejados para a parada.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <FormField
                      control={control}
                      name="dataInicioPlanejada"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data Início Planejada</FormLabel>
                          <div className="flex gap-2">
                             <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button variant={"outline"} className={cn("flex-1 pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                      {field.value ? (format(field.value, "PPP", { locale: ptBR })) : (<span>dd/mm/aaaa</span>)}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar mode="single" selected={field.value ?? undefined} onSelect={field.onChange} initialFocus />
                                </PopoverContent>
                             </Popover>
                             <FormField
                                control={control}
                                name="horaInicioPlanejada"
                                render={({ field }) => (
                                    <FormItem className="flex-grow">
                                      <FormControl>
                                        <Input type="time" {...field} className="w-full"/>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                )}
                              />
                          </div>
                          <FormMessage className="pt-2"/>
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={control}
                      name="dataFimPlanejada"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data Fim Planejada</FormLabel>
                          <div className="flex gap-2">
                             <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button variant={"outline"} className={cn("flex-1 pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                      {field.value ? (format(field.value, "PPP", { locale: ptBR })) : (<span>dd/mm/aaaa</span>)}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar mode="single" selected={field.value ?? undefined} onSelect={field.onChange} disabled={(date) => getValues("dataInicioPlanejada") ? date < getValues("dataInicioPlanejada") : false} initialFocus />
                                </PopoverContent>
                              </Popover>
                              <FormField
                                control={control}
                                name="horaFimPlanejada"
                                render={({ field }) => (
                                    <FormItem className="flex-grow">
                                      <FormControl>
                                        <Input type="time" {...field} className="w-full"/>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                )}
                              />
                          </div>
                          <FormMessage className="pt-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormItem>
                    <FormLabel>Duração planejada (horas)</FormLabel>
                    <FormControl>
                        <Input type="number" disabled value={duracaoPlanejada ?? ""} placeholder="Calculado automaticamente"/>
                    </FormControl>
                  </FormItem>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                    <CardTitle>Realizado</CardTitle>
                    <CardDescription>Datas e horários em que a parada realmente ocorreu.</CardDescription>
                </CardHeader>
                 <CardContent className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                     <FormField
                      control={control}
                      name="dataInicioRealizado"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data Início Realizado</FormLabel>
                           <div className="flex gap-2">
                             <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button variant={"outline"} className={cn("flex-1 pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                      {field.value ? (format(field.value, "PPP", { locale: ptBR })) : (<span>dd/mm/aaaa</span>)}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar mode="single" selected={field.value ?? undefined} onSelect={field.onChange} initialFocus />
                                </PopoverContent>
                              </Popover>
                               <FormField
                                control={control}
                                name="horaInicioRealizado"
                                render={({ field }) => (
                                     <FormItem className="flex-grow">
                                        <FormControl>
                                            <Input type="time" {...field} value={field.value ?? ''} className="w-full"/>
                                        </FormControl>
                                        <FormMessage />
                                     </FormItem>
                                )}
                              />
                           </div>
                           <FormMessage className="pt-2" />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={control}
                      name="dataFimRealizado"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data Fim Realizado</FormLabel>
                          <div className="flex gap-2">
                           <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant={"outline"} className={cn("flex-1 pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                  {field.value ? (format(field.value, "PPP", { locale: ptBR })) : (<span>dd/mm/aaaa</span>)}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value ?? undefined} onSelect={field.onChange} disabled={(date) => getValues("dataInicioRealizado") ? date < getValues("dataInicioRealizado") : false} initialFocus />
                            </PopoverContent>
                           </Popover>
                            <FormField
                                control={control}
                                name="horaFimRealizado"
                                render={({ field }) => (
                                    <FormItem className="flex-grow">
                                        <FormControl>
                                            <Input type="time" {...field} value={field.value ?? ''} className="w-full"/>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                              />
                          </div>
                          <FormMessage className="pt-2" />
                        </FormItem>
                      )}
                    />
                    </div>
                     <FormItem>
                        <FormLabel>Duração realizada (horas)</FormLabel>
                        <FormControl>
                            <Input type="number" disabled value={duracaoRealizada ?? ""} placeholder="Calculado automaticamente" />
                        </FormControl>
                    </FormItem>
                </CardContent>
              </Card>
              
               <Card>
                <CardHeader>
                    <CardTitle>Recursos (Opcional)</CardTitle>
                    <CardDescription>Adicione as equipes necessárias para esta parada. As especialidades são carregadas com base no centro e fase selecionados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {fields.map((field, index) => {
                             const selectedEspecialidade = watchedEquipes && watchedEquipes[index]?.especialidade;
                             const capacidadeOptions = getCapacidadeOptions(selectedEspecialidade);

                             return (
                                <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end p-4 border rounded-lg relative">
                                    <FormField
                                        control={control}
                                        name={`equipes.${index}.especialidade`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Especialidade</FormLabel>
                                                <Select
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        handleEspecialidadeChange(index, value);
                                                    }}
                                                    value={field.value}
                                                    disabled={loadingEspecialidades || !watchedCentro || !watchedFase}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            {loadingEspecialidades ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SelectValue placeholder="Selecione" />}
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {selectedEspecialidade && (
                                                            <SelectItem key={selectedEspecialidade} value={selectedEspecialidade}>
                                                                {selectedEspecialidade}
                                                            </SelectItem>
                                                        )}
                                                        {availableEspecialidades.map(esp => (
                                                            <SelectItem key={esp.especialidade} value={esp.especialidade}>{esp.especialidade}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name={`equipes.${index}.capacidade`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Capacidade</FormLabel>
                                                 <Select
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        handleCapacidadeChange(index, value);
                                                    }}
                                                    value={field.value?.toString() ?? ""}
                                                    disabled={!selectedEspecialidade}
                                                >
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {capacidadeOptions.map(cap => (
                                                            <SelectItem key={cap} value={cap.toString()}>{cap}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name={`equipes.${index}.hh`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>HH</FormLabel>
                                                <FormControl><Input type="number" {...field} readOnly disabled className="bg-muted/50" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name={`equipes.${index}.hh_dia`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>HH/Dia</FormLabel>
                                                <FormControl><Input type="number" {...field} readOnly disabled className="bg-muted/50"/></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                        <span className="sr-only">Remover Equipe</span>
                                    </Button>
                                </div>
                             );
                        })}
                         <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => append({ especialidade: "", capacidade: 1, hh: 0, hh_dia: 0 })}
                            disabled={!watchedCentro || !watchedFase || loadingEspecialidades || availableEspecialidades.length === 0}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Equipe
                        </Button>
                        {availableEspecialidades.length === 0 && watchedCentro && watchedFase && !loadingEspecialidades && (
                            <p className="text-sm text-muted-foreground mt-2">Todas as especialidades disponíveis já foram adicionadas.</p>
                        )}
                    </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                    <CardTitle>Descrição</CardTitle>
                    <CardDescription>Adicione informações adicionais sobre a parada.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField
                        control={control}
                        name="descricao"
                        render={({ field }) => (
                        <FormItem>
                            <FormControl>
                            <Textarea
                                placeholder="Descreva os detalhes da parada de manutenção..."
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


              <div className="flex justify-end gap-2">
                <Button variant="ghost" type="button" asChild>
                  <Link href="/paradas">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </MainLayout>
  );
}
