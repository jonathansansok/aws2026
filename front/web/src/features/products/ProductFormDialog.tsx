import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { productCreateSchema, type ProductCreateInput } from "./schema"
import { createProduct } from "./api"
import { toastErr, toastOk } from "../../shared/toast"
import { Button } from "../../components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"

export default function ProductFormDialog() {
  const qc = useQueryClient()

  const form = useForm<ProductCreateInput>({
    resolver: zodResolver(productCreateSchema),
    defaultValues: { name: "", price: 0, active: true },
    mode: "onChange",
  })

  const mutation = useMutation({
    mutationFn: async (input: ProductCreateInput) => {
      console.log("[ProductFormDialog] mutate", input)
      const res = await createProduct(input)
      if (!res.ok) throw res.error
      return res.data
    },
    onSuccess: (data) => {
      console.log("[ProductFormDialog] success", data)
      toastOk("Product created")
      qc.invalidateQueries({ queryKey: ["products"] })
      form.reset({ name: "", price: 0, active: true })
    },
    onError: (e: any) => {
      console.error("[ProductFormDialog] error", e)
      toastErr(e?.message || "Failed to create product", e)
    },
  })

  const isBusy = mutation.isPending
  const canSubmit = useMemo(() => form.formState.isValid && !isBusy, [form.formState.isValid, isBusy])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button onClick={() => console.log("[ProductFormDialog] open")}>New product</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Create product</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => {
            console.log("[ProductFormDialog] submit", values)
            mutation.mutate(values)
          })}
        >
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={form.watch("name")}
              onChange={(e) => {
                console.log("[ProductFormDialog] name change", e.target.value)
                form.setValue("name", e.target.value, { shouldValidate: true })
              }}
              placeholder="Coca Cola 500ml"
            />
            {form.formState.errors.name?.message ? (
              <p className="text-sm text-red-600">{String(form.formState.errors.name.message)}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Price</Label>
            <Input
              type="number"
              value={String(form.watch("price") ?? 0)}
              onChange={(e) => {
                console.log("[ProductFormDialog] price change", e.target.value)
                form.setValue("price", e.target.value as any, { shouldValidate: true })
              }}
              placeholder="1200"
            />
            {form.formState.errors.price?.message ? (
              <p className="text-sm text-red-600">{String(form.formState.errors.price.message)}</p>
            ) : null}
          </div>

          <DialogFooter className="gap-2">
            <Button type="submit" disabled={!canSubmit} onClick={() => console.log("[ProductFormDialog] submit click")}>
              {isBusy ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
