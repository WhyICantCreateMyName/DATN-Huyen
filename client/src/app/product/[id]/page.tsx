import React from "react";
import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import ProductDetailComponent from "@/components/product-detail";
import { productService } from "@/services/product.service";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await productService.getProduct(id);
    const product = res.data.data;
    
    return {
      title: `${product.name} | Yuki Fashion`,
      description: product.description || `Khám phá ${product.name} - thiết kế đẳng cấp từ Yuki Fashion.`,
      openGraph: {
        title: product.name,
        description: product.description,
        images: product.images,
      },
    };
  } catch (error) {
    return {
      title: "Sản phẩm | Yuki Fashion",
    };
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <ProductDetailComponent id={id} />
    </main>
  );
}
