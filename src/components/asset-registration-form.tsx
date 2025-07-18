"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect, useCallback, useTransition } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  nomeGrupo: z.string().min(2, {
    message: "O nome do grupo deve ter pelo menos 2 caracteres.",
  }),
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

export function AssetRegistrationForm({ initialDiretoriasExecutivas }: AssetRegistrationFormProps) {
  const { toast } = useToast();
  const [options, setOptions] = useState<OptionsState>({
    diretoriasExecutivas: initialDiretoriasExecutivas,
    diretorias: [],
    unidades: [],
    centrosLocalizacao: [],
    fases: [],
    categorias: [],
    ativos: [],
  });
  const [isLoading, setIsLoading] = useState({
    diretoriasExecutivas: !initialDiretoriasExecutivas || initialDiretoriasExecutivas.length === 0,
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
    // Busca as diretorias executivas se não forem passadas inicialmente.
    if (!initialDiretoriasExecutivas || initialDiretoriasExecutivas.length === 0) {
      setIsLoading(prev => ({...prev, diretoriasExecutivas: true}));
      getHierarquiaOpcoes("diretoria_executiva")
        .then(newOptions => {
          setOptions(prev => ({...prev, diretoriasExecutivas: newOptions}));
        })
        .finally(() => {
          setIsLoading(prev => ({...prev, diretoriasExecutivas: false}));
        });
    }
  }, [initialDiretoriasExecutivas]);

  const handleFieldChange = useCallback(
    (fieldName: keyof AssetFormValues, nextFieldName: keyof OptionsState | null, resetFields: (keyof AssetFormValues)[]) => {
      startTransition(() => {
        // Reseta os campos filhos e suas opções
        resetFields.forEach(field => form.setValue(field, "" as any, { shouldValidate: true }));
        const emptyOptions: Partial<OptionsState> = {};
        if (resetFields.includes("diretoria")) emptyOptions.diretorias = [];
        if (resetFields.includes("unidade")) emptyOptions.unidades = [];
        if (resetFields.includes("centro_de_localizacao")) emptyOptions.centrosLocalizacao = [];
        if (resetFields.includes("fase")) emptyOptions.fases = [];
        if (resetFields.includes("categoria")) emptyOptions.categorias = [];
        if (resetFields.includes("ativos")) emptyOptions.ativos = [];
        setOptions(prev => ({ ...prev, ...emptyOptions }));

        // Monta os filtros com os valores atuais
        const currentFilters = {
          diretoria_executiva: form.getValues("diretoria_executiva"),
          diretoria: form.getValues("diretoria"),
          unidade: form.getValues("unidade"),
          centro_de_localizacao: form.getValues("centro_de_localizacao"),
          fase: form.getValues("fase"),
        };
        
        // Busca novas opções para o próximo campo
        if (nextFieldName) {
            const apiFieldName = nextFieldName === 'centrosLocalizacao' ? 'centro_de_localizacao' : nextFieldName;
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
        if (name === "diretoria_executiva") {
            handleFieldChange("diretoria_executiva", "diretorias", ["diretoria", "unidade", "centro_de_localizacao", "fase", "categoria", "ativos"]);
        } else if (name === "diretoria") {
            handleFieldChange("diretoria", "unidades", ["unidade", "centro_de_localizacao", "fase", "categoria", "ativos"]);
        } else if (name === "unidade") {
            handleFieldChange("unidade", "centrosLocalizacao", ["centro_de_localizacao", "fase", "categoria", "ativos"]);
        } else if (name === "centro_de_localizacao") {
            handleFieldChange("centro_de_localizacao", "fases", ["fase", "categoria", "ativos"]);
            const centro = value.centro_de_localizacao;
            if (centro) {
                setIsLoading(prev => ({ ...prev, categorias: true, ativos: true }));
                getHierarquiaOpcoes("categoria", { centro_de_localizacao: centro }).then(newOptions => {
                    setOptions(prev => ({ ...prev, categorias: newOptions }));
                }).finally(() => setIsLoading(prev => ({ ...prev, categorias: false })));

                getAtivosByCentro(centro).then(newAssets => {
                    setOptions(prev => ({ ...prev, ativos: newAssets }));
                }).finally(() => setIsLoading(prev => ({...prev, ativos: false})));
            } else {
                setOptions(prev => ({...prev, ativos: [], categorias: [], fases: []}));
            }
        }
    });
    return () => subscription.unsubscribe();
  }, [watch, handleFieldChange]);
  
  async function onSubmit(data: AssetFormValues) {
    setIsSubmitting(true);
    console.log("Form data submitted:", data);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
        title: "Sucesso!",
        description: "O grupo de ativos foi registrado com sucesso.",
        variant: "default",
    });

    form.reset();
    setOptions(prev => ({ ...prev, diretorias: [], unidades: [], centrosLocalizacao: [], fases: [], categorias: [], ativos: [] }));
    setIsSubmitting(false);
  }

  const renderSelect = (name: keyof AssetFormValues, label: string, placeholder: string, items: string[], disabled: boolean, loading: boolean) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ""} disabled={disabled || loading}>
            <FormControl>
              <SelectTrigger>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SelectValue placeholder={placeholder} />}
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
    <Card className="w-full shadow-lg border-2 border-border/60">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Criar Novo Grupo de Ativos</CardTitle>
        <CardDescription>Preencha os detalhes abaixo para cadastrar um novo grupo.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
              {renderSelect("diretoria_executiva", "Diretoria Executiva", "Selecione a diretoria", options.diretoriasExecutivas, isLoading.diretoriasExecutivas, isLoading.diretoriasExecutivas)}
              {renderSelect("diretoria", "Diretoria", "Selecione a diretoria", options.diretorias, !watch("diretoria_executiva"), isLoading.diretorias)}
              {renderSelect("unidade", "Unidade", "Selecione a unidade", options.unidades, !watch("diretoria"), isLoading.unidades)}
              {renderSelect("centro_de_localizacao", "Centro de Localização", "Selecione o centro", options.centrosLocalizacao, !watch("unidade"), isLoading.centrosLocalizacao)}
              {renderSelect("fase", "Fase", "Selecione a fase", options.fases, !watch("centro_de_localizacao"), isLoading.fases)}
              {renderSelect("categoria", "Categoria", "Selecione a categoria", options.categorias, !watch("centro_de_localizacao"), isLoading.categorias)}
            </div>
            
            <Separator className="my-8" />
            
            <FormField control={form.control} name="ativos" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ativos</FormLabel>
                   <Popover>
                      <PopoverTrigger asChild>
                         <FormControl>
                           <Button variant="outline" role="combobox" className="w-full justify-between h-10" disabled={!watch("centro_de_localizacao") || isLoading.ativos}>
                               <span className="truncate">
                                {isLoading.ativos ? 'Carregando...' : field.value?.length > 0 ? `${field.value.length} ativos selecionados` : 'Selecione os ativos'}
                               </span>
                               {isLoading.ativos ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
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
                  <FormDescription>Os ativos são carregados com base no Centro de Localização selecionado.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <CardFooter className="px-0 pt-8 justify-end">
              <Button type="submit" disabled={isSubmitting || isPending} size="lg">
                {(isSubmitting || isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Registrando...' : (isPending ? 'Atualizando...' : 'Registrar Grupo')}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
