import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Info, ShieldCheck, ShoppingCart, Eye, Clock, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Helper function for simulated real-time data
function useSimulatedLiveMetrics(productId: string) {
    const [viewers, setViewers] = useState(Math.floor(Math.random() * 25) + 5);
    const [lastBoughtContext, setLastBoughtContext] = useState("");
    const [stockLevel, setStockLevel] = useState("In Stock");

    useEffect(() => {
        // Randomly adjust viewers
        const viewerInterval = setInterval(() => {
            setViewers((prev) => Math.max(2, prev + (Math.floor(Math.random() * 5) - 2)));
        }, 8000);

        // Generate synthetic "purchased 2 min ago" string
        const mins = Math.floor(Math.random() * 59) + 1;
        setLastBoughtContext(`Purchased ${mins} min ago`);

        // Random stock level
        const stockOpts = ["In Stock", "In Stock", "Low Stock", "In Stock", "Selling Fast!"];
        setStockLevel(stockOpts[Math.floor(Math.random() * stockOpts.length)]);

        return () => clearInterval(viewerInterval);
    }, [productId]);

    return { viewers, lastBoughtContext, stockLevel };
}

function ProductCard({ product }: { product: any }) {
    const { viewers, lastBoughtContext, stockLevel } = useSimulatedLiveMetrics(product.id || product.name);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
        >
            <Card className="overflow-hidden hover-elevate border-border/40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg flex flex-col transition-all duration-300 hover:shadow-2xl hover:border-primary/50 relative group h-full">
                {/* Live indicators */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                    <Badge className="bg-red-500/90 hover:bg-red-500 text-white border-none shadow-md backdrop-blur-md flex items-center gap-1.5 animate-in slide-in-from-top-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        {viewers} viewing
                    </Badge>
                    {stockLevel !== "In Stock" && (
                        <Badge className="bg-amber-500/90 text-white border-none shadow-md">{stockLevel}</Badge>
                    )}
                </div>

                <div className="h-[220px] relative flex items-center justify-center bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Badge className="absolute top-3 right-3 bg-white/95 dark:bg-black/90 text-primary hover:bg-white border-primary/20 backdrop-blur-md shadow-lg text-xs font-bold tracking-wider">
                        {product.category}
                    </Badge>
                </div>

                <CardContent className="p-5 flex-1 flex flex-col gap-4">
                    <div>
                        <h3 className="font-bold text-xl leading-tight text-slate-800 dark:text-slate-100 line-clamp-2">{product.name}</h3>
                        <div className="flex items-center justify-between mt-2">
                            <p className="font-black text-3xl text-green-600 dark:text-green-400">₹{product.price.toLocaleString()}</p>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                <Clock className="w-3.5 h-3.5" />
                                {lastBoughtContext}
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 border-b border-border/50 pb-3">{product.description}</p>

                    <div className="space-y-3 pt-1">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Info className="h-3.5 w-3.5 text-blue-500" /> How to Use
                            </p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 bg-blue-50/50 dark:bg-blue-900/20 p-2.5 rounded-lg border border-blue-100/50 dark:border-blue-800/30 leading-relaxed font-medium">
                                {product.usage}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Core Benefits
                            </p>
                            <p className="text-sm text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-900/20 p-2.5 rounded-lg border border-emerald-100/50 dark:border-emerald-800/30 font-medium leading-relaxed">
                                {product.benefits}
                            </p>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="p-5 pt-0 mt-auto">
                    <Button
                        className="w-full gap-2 font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg border-0 transition-all hover:shadow-orange-500/25 h-12 text-sm"
                        onClick={() => window.open(product.buyUrl || "https://www.amazon.in", "_blank")}
                    >
                        <ShoppingCart className="h-4 w-4" /> Shop Now on Retailer
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}

export default function AgriShop() {
    const [selectedCategory, setSelectedCategory] = useState<string>("All");

    const { data: products, isLoading } = useQuery({
        queryKey: ["/api/products"],
        queryFn: async () => {
            const res = await fetch(api.products.list.path);
            return res.json();
        }
    });

    const categories = ["All", "Seeds", "Fertilizers", "Pesticides", "Tools"];
    const filtered = products?.filter((p: any) => selectedCategory === "All" || p.category === selectedCategory);

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-border/50 backdrop-blur-sm"
            >
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="text-green-600 h-6 w-6" />
                        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-400">
                            Smart Kisan Shop
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-lg max-w-xl">
                        Buy authentic seeds, fertilizers, and machinery delivered directly to your farm. Real-time availability for Indian farmers.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button size="lg" className="rounded-full gap-2 shadow-lg hover:shadow-primary/25 bg-primary font-bold">
                        <ShoppingCart className="h-5 w-5" />
                        Cart (0)
                    </Button>
                </div>
            </motion.div>

            {/* Category Filter */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap gap-3"
            >
                {categories.map(c => (
                    <Button
                        key={c}
                        variant={selectedCategory === c ? "default" : "outline"}
                        onClick={() => setSelectedCategory(c)}
                        className={`rounded-full px-6 py-5 text-sm font-semibold transition-all duration-300 shadow-sm ${selectedCategory === c
                                ? "bg-primary text-primary-foreground hover:scale-105"
                                : "hover:border-primary/50 hover:bg-primary/5 bg-background border-border"
                            }`}
                    >
                        {c}
                    </Button>
                ))}
            </motion.div>

            {/* Products Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-[450px] bg-muted/50 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filtered?.map((product: any) => (
                            <ProductCard key={product.id || product.name} product={product} />
                        ))}
                    </AnimatePresence>

                    {filtered?.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full flex flex-col items-center justify-center py-32 text-center bg-white/30 dark:bg-slate-900/30 rounded-2xl border border-dashed border-border"
                        >
                            <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mb-4" />
                            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No products found</h3>
                            <p className="text-muted-foreground mt-2">Try selecting a different category.</p>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </div>
    );
}

