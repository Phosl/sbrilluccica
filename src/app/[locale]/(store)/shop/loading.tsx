import { Container } from "@/components/ui/container";
import { ProductGridSkeleton } from "@/components/ui/status";

export default function ShopLoading() {
  return (
    <main id="main-content" className="flex-1 bg-paper py-16" aria-busy="true" aria-label="Caricamento catalogo">
      <Container>
        <ProductGridSkeleton count={8} />
      </Container>
    </main>
  );
}
