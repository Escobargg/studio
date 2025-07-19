
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect, useCallback, useTransition } from "react";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAtivosByCentro, getHierarquiaOpcoes } from "@/lib/data";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  nomeGrupo: z.string().min(2, {
    message: "O nome do grupo deve ter pelo menos 2 caracteres.",
  }).max(100, { message: "O nome do grupo deve ter no máximo 100 caracteres." }),
  tipoGrupo: z.enum(["Frota", "Rota"], {
    required_error: "Selecione o tipo do grupo.",
  }),
  diretoria_executiva: z.string({ required_error: "Selecione a diretoria executiva." }),
  diretoria: z.string({ required_error: "Selecione a diretoria." }),
  unidade: z.string({ required_error: "Selecione a unidade." }),
  centro_de_localizacao: z.string({ required_error: "Selecione o centro de localização." }),
  fase: z.string({ required_error: "Selecione a fase." }),
  categoria: z.string({ required_error: "Selecione a categoria." }),
  ativos: z.array(z.string()).min(1, { message: "Selecione pelo menos um ativo." }),
});

type AssetFormValues = z.infer<typeof formSchema>;

interface AssetRegistrationFormProps {
  initialDiretoriasExecutivas: string[];
  isLoadingInitial: boolean;
}

type OptionsState = {
  diretoriasExecutivas: string[];
  diretorias: string[];
  unidades: string[];
  centrosLocalizacao: string[];
  fases: string[];
  categorias: string[];
  ativos: string[];
};

export function AssetRegistrationForm({ initialDiretoriasExecutivas, isLoadingInitial }: AssetRegistrationFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [options, setOptions] = useState<OptionsState>({
    diretoriasExecutivas: initialDiretoriasExecutivas || [],
    diretorias: [],
    unidades: [],
    centrosLocalizacao: [],
    fases: [],
    categorias: [],
    ativos: [],
  });
  const [isLoading, setIsLoading] = useState({
    diretorias: false,
    unidades: false,
    centrosLocalizacao: false,
    fases: false,
    categorias: false,
    ativos: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeGrupo: "",
      ativos: [],
    },
  });

  const watch = form.watch;

   useEffect(() => {
    if (initialDiretoriasExecutivas.length > 0) {
      setOptions(prev => ({...prev, diretoriasExecutivas: initialDiretoriasExecutivas}));
    }
  }, [initialDiretoriasExecutivas]);

  const handleFieldChange = useCallback(
    (fieldName: keyof AssetFormValues, nextFieldName: keyof OptionsState | null, resetFields: (keyof AssetFormValues)[]) => {
      startTransition(() => {
        resetFields.forEach(field => form.setValue(field, "" as any, { shouldValidate: true }));
        const emptyOptions: Partial<OptionsState> = {};
        if (resetFields.includes("diretoria")) emptyOptions.diretorias = [];
        if (resetFields.includes("unidade")) emptyOptions.unidades = [];
        if (resetFields.includes("centro_de_localizacao")) emptyOptions.centrosLocalizacao = [];
        if (resetFields.includes("fase")) emptyOptions.fases = [];
        if (resetFields.includes("categoria")) emptyOptions.categorias = [];
        if (resetFields.includes("ativos")) emptyOptions.ativos = [];
        setOptions(prev => ({ ...prev, ...emptyOptions }));

        const currentFilters = {
          diretoria_executiva: form.getValues("diretoria_executiva"),
          diretoria: form.getValues("diretoria"),
          unidade: form.getValues("unidade"),
          centro_de_localizacao: form.getValues("centro_de_localizacao"),
        };

        if (nextFieldName) {
            const apiFieldName = nextFieldName === 'centrosLocalizacao' ? 'centro_de_localizacao' : nextFieldName.slice(0, -1);
            setIsLoading(prev => ({ ...prev, [nextFieldName]: true }));
            getHierarquiaOpcoes(apiFieldName as any, currentFilters)
                .then(newOptions => {
                    setOptions(prev => ({ ...prev, [nextFieldName]: newOptions }));
                })
                .finally(() => {
                    setIsLoading(prev => ({ ...prev, [nextFieldName]: false }));
                });
        }
      });
    },
    [form, startTransition]
  );
  
  useEffect(() => {
    const subscription = watch((value, { name }) => {
        const resetAndFetch = (
            currentField: keyof AssetFormValues, 
            nextField: keyof OptionsState, 
            fieldsToReset: (keyof AssetFormValues)[]
        ) => {
             if (form.getValues(currentField)) {
                handleFieldChange(currentField, nextField, fieldsToReset);
            }
        };

        if (name === "diretoria_executiva") {
            resetAndFetch("diretoria_executiva", "diretorias", ["diretoria", "unidade", "centro_de_localizacao", "fase", "categoria", "ativos"]);
        } else if (name === "diretoria") {
            resetAndFetch("diretoria", "unidades", ["unidade", "centro_de_localizacao", "fase", "categoria", "ativos"]);
        } else if (name === "unidade") {
            resetAndFetch("unidade", "centrosLocalizacao", ["centro_de_localizacao", "fase", "categoria", "ativos"]);
        } else if (name === "centro_de_localizacao") {
            const centro = value.centro_de_localizacao;
            form.setValue("fase", "", { shouldValidate: true });
            form.setValue("categoria", "", { shouldValidate: true });
            form.setValue("ativos", [], { shouldValidate: true });
            
            if (centro) {
                setIsLoading(prev => ({ ...prev, fases: true, categorias: true, ativos: true }));

                startTransition(() => {
                    getHierarquiaOpcoes("fase", { centro_de_localizacao: centro }).then(newOptions => {
                        setOptions(prev => ({ ...prev, fases: newOptions }));
                    }).finally(() => setIsLoading(prev => ({ ...prev, fases: false })));

                    getHierarquiaOpcoes("categoria", { centro_de_localizacao: centro }).then(newOptions => {
                        setOptions(prev => ({ ...prev, categorias: newOptions }));
                    }).finally(() => setIsLoading(prev => ({ ...prev, categorias: false })));

                    getAtivosByCentro(centro).then(newAssets => {
                        setOptions(prev => ({ ...prev, ativos: newAssets }));
                    }).finally(() => setIsLoading(prev => ({...prev, ativos: false})));
                });
            } else {
                 setOptions(prev => ({...prev, ativos: [], categorias: [], fases: []}));
            }
        }
    });
    return () => subscription.unsubscribe();
  }, [watch, handleFieldChange, form]);
  
  async function onSubmit(data: AssetFormValues) {
    setIsSubmitting(true);
    
    // 1. Inserir o grupo na tabela principal e obter o ID
    const { data: grupoData, error: grupoError } = await supabase
      .from('grupos_de_ativos')
      .insert({ 
        nome_grupo: data.nomeGrupo,
        tipo_grupo: data.tipoGrupo,
        diretoria_executiva: data.diretoria_executiva,
        diretoria: data.diretoria,
        unidade: data.unidade,
        centro_de_localizacao: data.centro_de_localizacao,
        fase: data.fase,
        categoria: data.categoria,
        // O campo 'ativos' (array) não é mais inserido aqui
      })
      .select('id')
      .single();

    if (grupoError || !grupoData) {
      console.error("Error inserting group:", grupoError);
      toast({
        title: "Erro ao registrar!",
        description: `Ocorreu um erro ao salvar o grupo: ${grupoError?.message}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const grupoId = grupoData.id;

    // 2. Preparar e inserir os ativos na nova tabela relacional
    const ativosParaInserir = data.ativos.map(ativo => ({
      grupo_id: grupoId,
      ativo: ativo,
    }));

    const { error: ativosError } = await supabase
      .from('grupo_ativos_relacao')
      .insert(ativosParaInserir);

    if (ativosError) {
      console.error("Error inserting assets:", ativosError);
      // Idealmente, aqui você poderia deletar o grupo criado no passo 1 para consistência
      toast({
        title: "Erro ao registrar ativos!",
        description: `O grupo foi criado, mas houve um erro ao salvar os ativos: ${ativosError.message}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Sucesso
    setIsSubmitting(false);
    toast({
      title: "Sucesso!",
      description: "O grupo de ativos e seus ativos foram registrados com sucesso.",
      variant: "default",
    });
    router.push("/grupos");
  }

  const renderSelect = (name: keyof AssetFormValues, label: string, placeholder: string, items: string[], disabled: boolean, loading: boolean) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ""} disabled={disabled || loading || isPending}>
            <FormControl>
              <SelectTrigger>
                {(loading || (isPending && form.getFieldState(name).isDirty)) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SelectValue placeholder={placeholder} />}
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {items.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
  
  return (
     <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/grupos">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Criar Novo Grupo de Ativos</h1>
                    <p className="text-muted-foreground">Preencha os detalhes abaixo para cadastrar um novo grupo.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informações Básicas</CardTitle>
                    <CardDescription>Defina o nome e o tipo do grupo.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="nomeGrupo" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nome do Grupo</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: Frota de Caminhões - N4" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="tipoGrupo" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tipo do Grupo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione um tipo" /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="Frota">Frota</SelectItem><SelectItem value="Rota">Rota</SelectItem></SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}/>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Hierarquia</CardTitle>
                    <CardDescription>Especifique a localização hierárquica do grupo.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderSelect("diretoria_executiva", "Diretoria Executiva", "Selecione", options.diretoriasExecutivas, isLoadingInitial, isLoadingInitial)}
                    {renderSelect("diretoria", "Diretoria", "Selecione", options.diretorias, !watch("diretoria_executiva"), isLoading.diretorias)}
                    {renderSelect("unidade", "Unidade", "Selecione", options.unidades, !watch("diretoria"), isLoading.unidades)}
                    {renderSelect("centro_de_localizacao", "Centro de Localização", "Selecione", options.centrosLocalizacao, !watch("unidade"), isLoading.centrosLocalizacao)}
                    {renderSelect("fase", "Fase", "Selecione", options.fases, !watch("centro_de_localizacao"), isLoading.fases)}
                    {renderSelect("categoria", "Categoria", "Selecione", options.categorias, !watch("centro_de_localizacao"), isLoading.categorias)}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Ativos do Grupo</CardTitle>
                    <CardDescription>Selecione os ativos que pertencem a este grupo. Eles são carregados com base no Centro de Localização.</CardDescription>
                </CardHeader>
                <CardContent>
                     <FormField control={form.control} name="ativos" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant="outline" role="combobox" className="w-full justify-between h-10" disabled={!watch("centro_de_localizacao") || isLoading.ativos || isPending}>
                                        <span className="truncate">
                                        {isLoading.ativos ? 'Carregando...' : field.value?.length > 0 ? `${field.value.length} ativos selecionados` : 'Selecione os ativos'}
                                        </span>
                                        {(isLoading.ativos || isPending) ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <ScrollArea className="h-72">
                                        {options.ativos.length > 0 ? options.ativos.map((asset) => (
                                            <div key={asset} className="flex items-center px-4 py-2 space-x-3 hover:bg-muted/50 transition-colors rounded-md">
                                                <Checkbox id={asset} checked={field.value?.includes(asset)}
                                                    onCheckedChange={(checked) => {
                                                        const updatedValue = checked ? [...(field.value || []), asset] : (field.value || []).filter((value) => value !== asset);
                                                        field.onChange(updatedValue);
                                                    }}
                                                />
                                                <label htmlFor={asset} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer">{asset}</label>
                                            </div>
                                        )) : <p className="p-4 text-sm text-center text-muted-foreground">{!watch("centro_de_localizacao") ? 'Selecione um centro de localização primeiro.' : 'Nenhum ativo encontrado.'}</p>}
                                    </ScrollArea>
                                </PopoverContent>
                            </Popover>
                            <FormMessage className="pt-2"/>
                        </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
            
            <div className="flex justify-end gap-2">
                <Button variant="ghost" type="button" asChild>
                    <Link href="/grupos">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting || isPending}>
                {(isSubmitting || isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Registrando...' : (isPending ? 'Atualizando...' : 'Registrar Grupo')}
                </Button>
            </div>
        </form>
    </Form>
  );
}
