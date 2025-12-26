import { apiFetch } from "../../shared/http"
import type { Product } from "./types"
import type { ProductCreateInput } from "./schema"

export async function getProducts() {
  console.log("[products.api] getProducts")
  return apiFetch<Product[]>({ method: "GET", path: "/products" })
}

export async function createProduct(input: ProductCreateInput) {
  console.log("[products.api] createProduct", input)
  return apiFetch<Product>({ method: "POST", path: "/products", body: input })
}
