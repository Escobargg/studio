
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { ArrowLeft, CalendarIcon, Loader2 } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { getHierarquiaOpcoes, getAtivosByCentro, getGruposByCentroEFase } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { TeamSelector, type SelectedTeam } from "@/components/team-selector";

const equipeSchema = z.object({
  id: z.string(),
  especialidade: z.string().min(1, "Especialidade é obrigatória."),
  capacidade: z.union([z.string(), z.number()]),
  hh: z.union([z.string(), z.number()]),
  hh_dia: z.union([z.string(), z.number()]),
});

const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const stopFormSchema = z.object({
  nomeParada: z.string().min(1, "O nome da parada é obrigatório."),
  centroLocalizacao: z.string({ required_error: "Selecione o centro de localização." }).min(1, "Selecione o centro de localização."),
  fase: z.string({ required_error: "Selecione a fase." }).min(1, "Selecione a fase."),
  tipoSelecao: z.enum(["grupo", "ativo"], { required_error: "Selecione o tipo."}),
  grupoAtivos: z.string().optional(),
  ativo: z.string().optional(),
  dataInicioPlanejada: z.date({ required_error: "A data de início planejada é obrigatória." }),
  horaInicioPlanejada: z.string({ required_error: "A hora de início é obrigatória." }).regex(horaRegex, "Formato de hora inválido."),
  dataFimPlanejada: z.date({ required_error: "A data de fim planejada é obrigatória." }),
  horaFimPlanejada: z.string({ required_error: "A hora de fim é obrigatória." }).regex(horaRegex, "Formato de hora inválido."),
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
  descricao: z.string().optional(),
  equipes: z.array(equipeSchema).optional().default([]),
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
}).refine(data => {
    if (data.tipoSelecao === "grupo") {
        return !!data.grupoAtivos;
    }
    return true;
}, {
    message: "Selecione o grupo de ativos.",
    path: ["grupoAtivos"],
}).refine(data => {
    if (data.tipoSelecao === "ativo") {
        return !!data.ativo;
    }
    return true;
}, {
    message: "Selecione o ativo.",
    path: ["ativo"],
});


type StopFormValues = z.infer<typeof stopFormSchema>;

const combineDateTime = (date: Date | null | undefined, time: string | null | undefined): Date | null => {
  if (!date || !time || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [hours, minutes] = time.split(':').map(Number);
  return set(date, { hours, minutes, seconds: 0, milliseconds: 0 });
};


export default function CriarParadaPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [centrosLocalizacao, setCentrosLocalizacao] = useState<string[]>([]);
  const [fases, setFases] = useState<string[]>([]);
  const [ativos, setAtivos] = useState<string[]>([]);
  const [gruposDeAtivos, setGruposDeAtivos] = useState<string[]>([]);

  const [loadingCentros, setLoadingCentros] = useState(true);
  const [loadingFases, setLoadingFases] = useState(false);
  const [loadingAtivos, setLoadingAtivos] = useState(false);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  
  const form = useForm<StopFormValues>({
    resolver: zodResolver(stopFormSchema),
    defaultValues: {
      nomeParada: "",
      centroLocalizacao: "",
      fase: "",
      tipoSelecao: "grupo",
      grupoAtivos: "",
      ativo: "",
      horaInicioPlanejada: "",
      horaFimPlanejada: "",
      dataInicioPlanejada: undefined,
      dataFimPlanejada: undefined,
      dataInicioRealizado: null,
      horaInicioRealizado: "",
      dataFimRealizado: null,
      horaFimRealizado: "",
      descricao: "",
      equipes: [],
    },
  });

  const { watch, control, setValue, getValues } = form;

  const [duracaoPlanejada, setDuracaoPlanejada] = useState<number | null>(null);
  const [duracaoRealizada, setDuracaoRealizada] = useState<number | null>(null);
  
  const watchedFields = watch([
      "dataInicioPlanejada", "horaInicioPlanejada", "dataFimPlanejada", "horaFimPlanejada",
      "dataInicioRealizado", "horaInicioRealizado", "dataFimRealizado", "horaFimRealizado"
  ]);
  const watchedCentro = watch("centroLocalizacao");
  const watchedFase = watch("fase");
  const watchedTipoSelecao = watch("tipoSelecao");

  useEffect(() => {
    async function fetchCentros() {
      setLoadingCentros(true);
      const data = await getHierarquiaOpcoes("centro_de_localizacao");
      setCentrosLocalizacao(data);
      setLoadingCentros(false);
    }
    fetchCentros();
  }, []);

  useEffect(() => {
    const fetchDataForCentro = async () => {
      if (watchedCentro) {
        setLoadingFases(true);
        setLoadingAtivos(true);
        setValue("fase", ""); 
        setValue("grupoAtivos", "");
        setValue("ativo", "");
        setValue("equipes", []);

        const [fasesData, ativosData] = await Promise.all([
          getHierarquiaOpcoes("fase", { centro_de_localizacao: watchedCentro }),
          getAtivosByCentro(watchedCentro)
        ]);

        setFases(fasesData);
        setAtivos(ativosData);
        setLoadingFases(false);
        setLoadingAtivos(false);
      } else {
        setFases([]);
        setAtivos([]);
        setGruposDeAtivos([]);
        setValue("equipes", []);
      }
    };
    fetchDataForCentro();
  }, [watchedCentro, setValue]);

  useEffect(() => {
    const fetchDependentData = async () => {
        if (watchedCentro && watchedFase) {
            setLoadingGrupos(true);
            setValue("grupoAtivos", "");
            setValue("equipes", []);

            const gruposData = await getGruposByCentroEFase(watchedCentro, watchedFase);
            
            setGruposDeAtivos(gruposData);
            setLoadingGrupos(false);
        } else {
            setGruposDeAtivos([]);
            setValue("equipes", []);
        }
    };
    fetchDependentData();
  }, [watchedCentro, watchedFase, setValue]);

  useEffect(() => {
    const [
      dataInicioPlanejada, horaInicioPlanejada, dataFimPlanejada, horaFimPlanejada,
      dataInicioRealizado, horaInicioRealizado, dataFimRealizado, horaFimRealizado
    ] = watchedFields;

    const startPlanejado = combineDateTime(dataInicioPlanejada, horaInicioPlanejada);
    const endPlanejado = combineDateTime(dataFimPlanejada, horaFimPlanejada);

    if (startPlanejado && endPlanejado && endPlanejado > startPlanejado) {
        setDuracaoPlanejada(differenceInHours(endPlanejado, startPlanejado));
    } else {
        setDuracaoPlanejada(null);
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
          centro_de_localizacao: data.centroLocalizacao,
          fase: data.fase,
          tipo_selecao: data.tipoSelecao,
          grupo_de_ativos: data.tipoSelecao === 'grupo' ? data.grupoAtivos : null,
          ativo_unico: data.tipoSelecao === 'ativo' ? data.ativo : null,
          data_inicio_planejada: dataInicioPlanejadaCompleta.toISOString(),
          data_fim_planejada: dataFimPlanejadaCompleta.toISOString(),
          duracao_planejada_horas: duracaoPlanejadaHoras,
          data_inicio_realizado: dataInicioRealizadoCompleta?.toISOString() || null,
          data_fim_realizado: dataFimRealizadoCompleta?.toISOString() || null,
          duracao_realizada_horas: duracaoRealizadaHoras,
          descricao: data.descricao,
          status: 'PLANEJADA',
        };

        const { data: paradaResult, error: paradaError } = await supabase
            .from('paradas_de_manutencao')
            .insert(paradaData)
            .select('id')
            .single();
        
        if (paradaError) throw paradaError;
        
        const paradaId = paradaResult.id;

        if (data.equipes && data.equipes.length > 0) {
            const recursosData = data.equipes.map(equipe => ({
                parada_id: paradaId,
                equipe: equipe.especialidade,
                capacidade: Number(equipe.capacidade),
                hh: Number(equipe.hh),
                hh_dia: Number(equipe.hh_dia),
            }));

            const { error: recursosError } = await supabase
                .from('recursos_parada')
                .insert(recursosData);

            if (recursosError) throw recursosError;
        }

        toast({
            title: "Parada Criada!",
            description: "A nova parada de manutenção e seus recursos foram salvos com sucesso.",
        });
        router.push(`/paradas`);

    } catch(error: any) {
        console.error("Error inserting data:", error);
        toast({
            title: "Erro ao criar parada",
            description: "Ocorreu um erro ao salvar a parada. Verifique os dados e tente novamente. Detalhes: " + error.message,
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
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
                  <h1 className="text-2xl font-bold">Criar Nova Parada de Manutenção</h1>
                  <p className="text-muted-foreground">
                    Preencha as informações da parada de manutenção
                  </p>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <FormItem>
                      <FormLabel>Conclusão (%)</FormLabel>
                      <FormControl>
                        <Input disabled value="Calculado automaticamente" />
                      </FormControl>
                       <p className="text-[0.8rem] text-muted-foreground">
                          Automático para paradas antes de jul/25
                        </p>
                    </FormItem>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField
                      control={control}
                      name="centroLocalizacao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Centro de Localização</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={loadingCentros}>
                            <FormControl>
                                <SelectTrigger>
                                    {loadingCentros ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SelectValue placeholder="Selecionar Centro" />}
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {centrosLocalizacao.map(centro => (
                                <SelectItem key={centro} value={centro}>{centro}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                          <Select onValueChange={field.onChange} value={field.value} disabled={!watchedCentro || loadingFases}>
                            <FormControl>
                              <SelectTrigger>
                                {loadingFases ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SelectValue placeholder="Selecionar Fase" />}
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {fases.map(fase => (
                                <SelectItem key={fase} value={fase}>{fase}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                              onValueChange={(value) => {
                                field.onChange(value);
                                if (value === 'ativo') {
                                    setValue('grupoAtivos', '');
                                } else if (value === 'grupo') {
                                    setValue('ativo', '');
                                }
                              }}
                              defaultValue={field.value}
                              className="flex space-x-4"
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

                    {watchedTipoSelecao === "grupo" && (
                        <FormField
                            control={control}
                            name="grupoAtivos"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Grupo de Ativos</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={!watchedCentro || !watchedFase || loadingGrupos}>
                                    <FormControl>
                                        <SelectTrigger>
                                            {loadingGrupos ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SelectValue placeholder="Selecionar Grupo de Ativos" />}
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {gruposDeAtivos.map(grupo => (
                                            <SelectItem key={grupo} value={grupo}>{grupo}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    )}

                    {watchedTipoSelecao === "ativo" && (
                         <FormField
                            control={control}
                            name="ativo"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ativo</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={!watchedCentro || loadingAtivos}>
                                <FormControl>
                                  <SelectTrigger>
                                    {loadingAtivos ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SelectValue placeholder="Selecionar Ativo" />}
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {ativos.map(ativo => (
                                        <SelectItem key={ativo} value={ativo}>{ativo}</SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
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
                    <CardDescription>Selecione as equipes e defina a capacidade para esta parada.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField
                      control={control}
                      name="equipes"
                      render={({ field }) => (
                        <TeamSelector
                          value={field.value}
                          onChange={field.onChange}
                          centroLocalizacao={watchedCentro}
                          fase={watchedFase}
                        />
                      )}
                    />
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
                  {isSubmitting ? "Criando..." : "Criar Parada"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </MainLayout>
  );
}

    