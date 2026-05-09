import { ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ANIM_STYLES, HorizontalCarousel } from '../dashboard/BusinessCarousel';
import { getProductsByBusiness } from '../../services/product/product.service';
import ProductPreviewCard from './ProductPreviewCard';

function LoadingSkeleton() {
  return (
    <div className="bg-card-bg rounded-2xl shadow p-5 sm:p-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-36 bg-edge rounded-full" />
        <div className="h-4 w-24 bg-edge rounded-full" />
      </div>
      <div className="flex gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="shrink-0 w-[80vw] sm:w-[calc(50%-6px)] lg:w-[calc(33.333%-8px)] h-48 bg-edge rounded-2xl"
          />
        ))}
      </div>
    </div>
  );
}

export default function BusinessProductsCarousel({ businessId }) {
  const [products, setProducts] = useState(null);

  useEffect(() => {
    if (!businessId) return;
    getProductsByBusiness(businessId)
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setProducts(list);
      })
      .catch(() => setProducts([]));
  }, [businessId]);

  if (products === null) return <LoadingSkeleton />;

  return (
    <>
      <style>{ANIM_STYLES}</style>
      <HorizontalCarousel
        items={products}
        title="Mis productos"
        TitleIcon={ShoppingBag}
        iconClassName="text-primary-mid"
        linkTo="/dashboardBusiness/productos"
        linkLabel="Gestionar →"
        emptyMsg="Aún no tienes productos. ¡Agrega tu primero!"
        renderItem={(product, i) => (
          <ProductPreviewCard
            product={product}
            delay={i * 55}
          />
        )}
      />
    </>
  );
}
