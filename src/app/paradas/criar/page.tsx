
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
import { cn, normalizeString } from "@/lib/utils";
import { MainLayout } from "@/components/main-layout";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { getHierarquiaOpcoes, getAtivosByCentro, getGruposByCentroEFase, getEspecialidades, type Especialidade } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { Progress } from "@/components/ui/progress";

const equipeSchema = z.object({
  especialidade: z.string().min(1, "Especialidade é obrigatória."),
  capacidade: z.coerce.number().min(1, "Deve ser > 0.").default(1),
  hh: z.coerce.number().min(0, "HH deve ser preenchido."),
  hh_dia: z.coerce.number().min(0, "HH/Dia deve ser preenchido."),
});


const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const stopFormSchema = z.object({
  nomeParada: z.string().min(1, "O nome da parada é obrigatório."),
  diretoria_executiva: z.string({ required_error: "Selecione a diretoria executiva." }).min(1, "Selecione a diretoria executiva."),
  diretoria: z.string({ required_error: "Selecione a diretoria." }).min(1, "Selecione a diretoria."),
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

const calculateCompletion = (values: Partial<StopFormValues>): number => {
    const now = new Date();

    const dataFimRealizado = combineDateTime(values.dataFimRealizado, values.horaFimRealizado);
    if (dataFimRealizado) {
        return 100;
    }

    const dataInicioRealizado = combineDateTime(values.dataInicioRealizado, values.horaInicioRealizado);
    if (dataInicioRealizado) {
        const dataFimPlanejada = combineDateTime(values.dataFimPlanejada, values.horaFimPlanejada);
        if (!dataFimPlanejada) return 0;

        if (now > dataFimPlanejada) {
            return 99;
        }

        const totalDuration = dataFimPlanejada.getTime() - dataInicioRealizado.getTime();
        if (totalDuration <= 0) return 99;

        const elapsedDuration = now.getTime() - dataInicioRealizado.getTime();
        const percentage = Math.min(99, Math.max(0, (elapsedDuration / totalDuration) * 100));
        
        return Math.round(percentage);
    }
    
    return 0;
};


export default function CriarParadaPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [diretoriasExecutivas, setDiretoriasExecutivas] = useState<string[]>([]);
  const [diretorias, setDiretorias] = useState<string[]>([]);
  const [centrosLocalizacao, setCentrosLocalizacao] = useState<string[]>([]);
  const [fases, setFases] = useState<string[]>([]);
  const [ativos, setAtivos] = useState<string[]>([]);
  const [gruposDeAtivos, setGruposDeAtivos] = useState<string[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);


  const [loadingDiretoriasExecutivas, setLoadingDiretoriasExecutivas] = useState(true);
  const [loadingDiretorias, setLoadingDiretorias] = useState(false);
  const [loadingCentros, setLoadingCentros] = useState(false);
  const [loadingFases, setLoadingFases] = useState(false);
  const [loadingAtivos, setLoadingAtivos] = useState(false);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(false);
  
  const form = useForm<StopFormValues>({
    resolver: zodResolver(stopFormSchema),
    defaultValues: {
      nomeParada: "",
      diretoria_executiva: "",
      diretoria: "",
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

  const { watch, control, setValue, getValues, trigger } = form;

  const { fields, append, remove } = useFieldArray({
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
  const allWatchedFields = watch();

  const watchedDiretoriaExecutiva = watch("diretoria_executiva");
  const watchedDiretoria = watch("diretoria");
  const watchedCentro = watch("centroLocalizacao");
  const watchedFase = watch("fase");
  const watchedTipoSelecao = watch("tipoSelecao");
  const watchedEquipes = watch("equipes");

  const handleEspecialidadeChange = (index: number, espNome: string) => {
    const especialidadeData = especialidades.find(e => e.especialidade === espNome);
    if (especialidadeData) {
        setValue(`equipes.${index}.hh`, especialidadeData.hh);
        const newCapacity = 1;
        setValue(`equipes.${index}.capacidade`, newCapacity);
        setValue(`equipes.${index}.hh_dia`, newCapacity * especialidadeData.hh);
        trigger(`equipes.${index}.capacidade`);
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
    (esp) => !watchedEquipes?.some((equipe) => normalizeString(equipe.especialidade) === normalizeString(esp.especialidade))
  );


  useEffect(() => {
    async function fetchInitialData() {
      setLoadingDiretoriasExecutivas(true);
      const data = await getHierarquiaOpcoes("diretoria_executiva");
      setDiretoriasExecutivas(data);
      setLoadingDiretoriasExecutivas(false);
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    async function fetchDiretorias() {
      if (watchedDiretoriaExecutiva) {
        setLoadingDiretorias(true);
        setValue("diretoria", "");
        setValue("centroLocalizacao", "");
        setValue("fase", "");
        setDiretorias([]);
        setCentrosLocalizacao([]);
        setFases([]);
        const data = await getHierarquiaOpcoes("diretoria", { diretoria_executiva: watchedDiretoriaExecutiva });
        setDiretorias(data);
        setLoadingDiretorias(false);
      }
    }
    fetchDiretorias();
  }, [watchedDiretoriaExecutiva, setValue]);

  useEffect(() => {
    async function fetchCentros() {
      if (watchedDiretoria) {
        setLoadingCentros(true);
        setValue("centroLocalizacao", "");
        setValue("fase", "");
        setCentrosLocalizacao([]);
        setFases([]);
        const data = await getHierarquiaOpcoes("centro_de_localizacao", { diretoria: watchedDiretoria });
        setCentrosLocalizacao(data);
        setLoadingCentros(false);
      }
    }
    fetchCentros();
  }, [watchedDiretoria, setValue]);

  useEffect(() => {
    const fetchDataForCentro = async () => {
      if (watchedCentro) {
        setLoadingFases(true);
        setLoadingAtivos(true);
        setValue("fase", ""); 
        setValue("grupoAtivos", "");
        setValue("ativo", "");
        setFases([]);
        setAtivos([]);

        const [fasesData, ativosData] = await Promise.all([
          getHierarquiaOpcoes("fase", { centro_de_localizacao: watchedCentro }),
          getAtivosByCentro(watchedCentro)
        ]);

        setFases(fasesData);
        setAtivos([...new Set(ativosData)]); // Ensure unique asset keys
        setLoadingFases(false);
        setLoadingAtivos(false);
      } else {
        setFases([]);
        setAtivos([]);
        setGruposDeAtivos([]);
        setEspecialidades([]);
      }
    };
    fetchDataForCentro();
  }, [watchedCentro, setValue]);

  useEffect(() => {
    const fetchDependentData = async () => {
        if (watchedCentro && watchedFase) {
            setLoadingGrupos(true);
            setLoadingEspecialidades(true);
            setValue("grupoAtivos", "");
            setValue("equipes", []); // Reset teams when context changes

            const [gruposData, especialidadesData] = await Promise.all([
                getGruposByCentroEFase(watchedCentro, watchedFase),
                getEspecialidades(watchedCentro, watchedFase)
            ]);
            
            setGruposDeAtivos(gruposData);
            setEspecialidades(especialidadesData);
            setLoadingGrupos(false);
            setLoadingEspecialidades(false);
        } else {
            setGruposDeAtivos([]);
            setEspecialidades([]);
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
    
    setCompletion(calculateCompletion(allWatchedFields));

    const startRealizado = combineDateTime(dataInicioRealizado, horaInicioRealizado);
    const endRealizado = combineDateTime(dataFimRealizado, horaFimRealizado);

    if (startRealizado && endRealizado && endRealizado > startRealizado) {
        setDuracaoRealizada(differenceInHours(endRealizado, startRealizado));
    } else {
        setDuracaoRealizada(null);
    }
    
  }, [watchedFields, allWatchedFields]);

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
          diretoria_executiva: data.diretoria_executiva,
          diretoria: data.diretoria,
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
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
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
                          <Select onValueChange={field.onChange} value={field.value} disabled={loadingDiretoriasExecutivas}>
                            <FormControl>
                                <SelectTrigger>
                                    {loadingDiretoriasExecutivas ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SelectValue placeholder="Selecionar Diretoria Executiva" />}
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {diretoriasExecutivas.map(de => (
                                <SelectItem key={de} value={de}>{de}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                          <Select onValueChange={field.onChange} value={field.value} disabled={!watchedDiretoriaExecutiva || loadingDiretorias}>
                            <FormControl>
                                <SelectTrigger>
                                    {loadingDiretorias ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SelectValue placeholder="Selecionar Diretoria" />}
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {diretorias.map(d => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                          <Select onValueChange={field.onChange} value={field.value} disabled={!watchedDiretoria || loadingCentros}>
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
                                <FormLabel>Ativo Único</FormLabel>
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
