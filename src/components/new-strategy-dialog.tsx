
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useTransition } from "react";
import { CalendarIcon, Loader2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { Grupo } from "./asset-group-card";
import { PlusCircle } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

// TODO: Definir schema no supabase e implementar a lógica de submit
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

interface NewStrategyDialogProps {
  grupo: Grupo;
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // onStrategyCreated: (newStrategy: any) => void;
}

export function NewStrategyDialog({ grupo, children, open, onOpenChange }: NewStrategyDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  async function onSubmit(data: StrategyFormValues) {
    setIsSubmitting(true);
    console.log("Submitting new strategy:", data);
    // TODO: Implementar a lógica de submit para o Supabase
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    onOpenChange(false);
    // onStrategyCreated(data); // Notificar o pai sobre a nova estratégia
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        {children}
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Nova Estratégia</DialogTitle>
          <DialogDescription>
            Grupo: {grupo.nome_grupo} | {grupo.unidade} | {grupo.centro_de_localizacao}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 min-h-0">
             <ScrollArea className="h-full pr-6">
                <div className="space-y-4 py-4">
                    <div className="space-y-2 p-1">
                      <h3 className="text-lg font-medium">Informações Básicas</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <FormField
                          control={form.control}
                          name="nomeEstrategia"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Nome da Estratégia *</FormLabel>
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
                              <FormLabel>Prioridade *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
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
                      </div>
                      <FormField
                        control={form.control}
                        name="descricao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Descreva os detalhes da estratégia de manutenção..."
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-2 p-1">
                      <h3 className="text-lg font-medium">Frequência da Parada</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                         <FormField
                          control={form.control}
                          name="frequenciaValor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>A cada quantos *</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name="frequenciaUnidade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unidade *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
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
                              <FormControl>
                                <Input type="number" {...field} placeholder="Ex: 2" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                     <div className="space-y-2 p-1">
                      <h3 className="text-lg font-medium">Duração da Parada</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                         <FormField
                          control={form.control}
                          name="duracaoValor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duração *</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name="duracaoUnidade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unidade *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
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
                    </div>

                    <div className="space-y-2 p-1">
                        <h3 className="text-lg font-medium">Período de Vigência</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-start">
                            <FormField
                            control={form.control}
                            name="dataInicio"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Data de Início *</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value, "PPP", { locale: ptBR })
                                        ) : (
                                            <span>Escolha uma data</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                        date < new Date(new Date().setDate(new Date().getDate() -1))
                                        }
                                        initialFocus
                                    />
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
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value, "PPP", { locale: ptBR })
                                        ) : (
                                            <span>Indefinida</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                         form.getValues("dataInicio") ? date < form.getValues("dataInicio") : false
                                        }
                                        initialFocus
                                    />
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
                                <FormItem className="flex flex-row items-center justify-start space-x-3 space-y-0 rounded-md pt-4">
                                    <FormControl>
                                        <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                     <FormLabel className="font-normal mb-0">
                                        Estratégia ativa
                                    </FormLabel>
                                </FormItem>
                            )}
                            />
                    </div>
                </div>
            </ScrollArea>

            <DialogFooter className="pt-4 border-t">
              <Button variant="ghost" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Salvando..." : "Salvar Estratégia"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    
