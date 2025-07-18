"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
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
import { HierarquiaData, getAtivosByCentro } from "@/lib/data";
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
  centroLocalizacao: z.string({
    required_error: "Selecione o centro de localização.",
  }),
  fase: z.string({ required_error: "Selecione a fase." }),
  diretoriaExecutiva: z.string({ required_error: "Selecione a diretoria executiva." }),
  diretoria: z.string({ required_error: "Selecione a diretoria." }),
  unidade: z.string({ required_error: "Selecione a unidade." }),
  categoria: z.string({ required_error: "Selecione a categoria." }),
  ativos: z.array(z.string()).min(1, { message: "Selecione pelo menos um ativo." }),
});

type AssetFormValues = z.infer<typeof formSchema>;

interface AssetRegistrationFormProps {
  hierarquiaData: HierarquiaData;
}

export function AssetRegistrationForm({ hierarquiaData }: AssetRegistrationFormProps) {
  const { toast } = useToast();
  const [availableAssets, setAvailableAssets] = useState<string[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeGrupo: "",
      ativos: [],
    },
  });

  const selectedCentro = form.watch("centroLocalizacao");

  useEffect(() => {
    if (selectedCentro) {
      setIsLoadingAssets(true);
      form.setValue("ativos", []); // Reset assets when center changes
      getAtivosByCentro(selectedCentro)
        .then((assets) => {
          setAvailableAssets(assets);
        })
        .finally(() => {
          setIsLoadingAssets(false);
        });
    } else {
      setAvailableAssets([]);
      form.setValue("ativos", []);
    }
  }, [selectedCentro, form]);

  async function onSubmit(data: AssetFormValues) {
    setIsSubmitting(true);
    // In a real app, you would send this data to your backend/database
    console.log("Form data submitted:", data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
        title: "Sucesso!",
        description: "O grupo de ativos foi registrado com sucesso.",
        variant: "default",
    });

    form.reset();
    setIsSubmitting(false);
  }
  
  return (
    <Card className="w-full shadow-lg border-2 border-border/60">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Criar Novo Grupo de Ativos</CardTitle>
        <CardDescription>
          Preencha os detalhes abaixo para cadastrar um novo grupo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="nomeGrupo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Grupo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Frota de Caminhões - N4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tipoGrupo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo do Grupo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Frota">Frota</SelectItem>
                        <SelectItem value="Rota">Rota</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="centroLocalizacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Centro de Localização</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o centro" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {hierarquiaData.centros.map((centro) => (
                          <SelectItem key={centro} value={centro}>
                            {centro}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fase</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a fase" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {hierarquiaData.fases.map((fase) => (
                          <SelectItem key={fase} value={fase}>
                            {fase}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="diretoriaExecutiva"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diretoria Executiva</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a diretoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {hierarquiaData.diretoriasExecutivas.map((dir) => (
                          <SelectItem key={dir} value={dir}>
                            {dir}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="diretoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diretoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a diretoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {hierarquiaData.diretorias.map((dir) => (
                          <SelectItem key={dir} value={dir}>
                            {dir}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a unidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {hierarquiaData.unidades.map((unidade) => (
                          <SelectItem key={unidade} value={unidade}>
                            {unidade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {hierarquiaData.categorias.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator className="my-8" />
            
            <FormField
              control={form.control}
              name="ativos"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ativos</FormLabel>
                  <Popover>
                      <PopoverTrigger asChild>
                         <FormControl>
                           <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between h-10"
                                disabled={!selectedCentro || isLoadingAssets}
                            >
                                <span className="truncate">
                                {isLoadingAssets ? 'Carregando...' : field.value?.length > 0 ? `${field.value.length} ativos selecionados` : 'Selecione os ativos'}
                                </span>
                                {isLoadingAssets ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
                           </Button>
                         </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <ScrollArea className="h-72">
                              {availableAssets.length > 0 ? availableAssets.map((asset) => (
                                  <div key={asset} className="flex items-center px-4 py-2 space-x-3 hover:bg-muted/50 transition-colors rounded-md">
                                      <Checkbox
                                          id={asset}
                                          checked={field.value?.includes(asset)}
                                          onCheckedChange={(checked) => {
                                              const updatedValue = checked
                                              ? [...(field.value || []), asset]
                                              : (field.value || []).filter(
                                                  (value) => value !== asset
                                                );
                                              field.onChange(updatedValue);
                                          }}
                                      />
                                      <label
                                          htmlFor={asset}
                                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                                      >
                                          {asset}
                                      </label>
                                  </div>
                              )) : <p className="p-4 text-sm text-center text-muted-foreground">{!selectedCentro ? 'Selecione um centro de localização primeiro.' : 'Nenhum ativo encontrado.'}</p>}
                          </ScrollArea>
                      </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Os ativos são carregados com base no Centro de Localização selecionado.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <CardFooter className="px-0 pt-8 justify-end">
              <Button type="submit" disabled={isSubmitting} size="lg">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Registrando...' : 'Registrar Grupo'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
