import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ThermometerSnowflake, Phone, Navigation, Star, CheckCircle2, AlertCircle, XCircle, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { ColdStorage } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Godowns() {
    const [search, setSearch] = useState("");

    const { data: godowns = [], isLoading } = useQuery<ColdStorage[]>({
        queryKey: ["/api/cold-storages"],
    });

    const filtered = godowns.filter(g =>
        g.state.toLowerCase().includes(search.toLowerCase()) ||
        g.district.toLowerCase().includes(search.toLowerCase()) ||
        g.name.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "available": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "limited": return "bg-amber-100 text-amber-700 border-amber-200";
            case "full": return "bg-rose-100 text-rose-700 border-rose-200";
            default: return "bg-slate-100 text-slate-700";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "available": return <CheckCircle2 className="h-3.5 w-3.5 mr-1" />;
            case "limited": return <AlertCircle className="h-3.5 w-3.5 mr-1" />;
            case "full": return <XCircle className="h-3.5 w-3.5 mr-1" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">AC Godowns & Cold Storage</h1>
                    <p className="text-muted-foreground mt-1">Find state-of-the-art cold storages to protect your harvest.</p>
                </div>
            </div>

            <Card className="border-blue-100 shadow-sm bg-white/50 backdrop-blur-md">
                <CardContent className="p-4 sm:p-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
                        <Input
                            placeholder="Search 50+ facilities by state, district, or godown name..."
                            className="pl-10 h-14 text-lg bg-white border-blue-200 focus-visible:ring-blue-500 rounded-xl shadow-inner"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {isLoading ? (
                    Array(4).fill(0).map((_, i) => (
                        <Card key={i} className="overflow-hidden border border-blue-100/50 shadow-md">
                            <Skeleton className="h-2 w-full" />
                            <CardHeader className="pb-3">
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-20 w-full rounded-lg" />
                                <div className="mt-5 flex gap-3">
                                    <Skeleton className="h-10 flex-1" />
                                    <Skeleton className="h-10 w-1/4" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : filtered.map(godown => (
                    <Card key={godown.id} className="hover-elevate overflow-hidden border border-blue-100/50 shadow-md">
                        <div className="h-2 bg-gradient-to-r from-blue-400 to-indigo-500" />
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className={`font-bold capitalize flex items-center ${getStatusColor(godown.status)}`}>
                                            {getStatusIcon(godown.status)}
                                            {godown.status}
                                        </Badge>
                                        <div className="flex items-center text-amber-500 text-xs font-bold">
                                            <Star className="h-3 w-3 fill-current mr-0.5" /> {godown.rating}
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl text-blue-900">{godown.name}</CardTitle>
                                    <CardDescription className="flex items-center gap-1 mt-1 font-medium text-slate-600">
                                        <MapPin className="h-4 w-4 text-blue-500" /> {godown.district}, {godown.state}
                                    </CardDescription>
                                </div>
                                <div className="text-right">
                                    <Badge className="bg-blue-600 text-white border-none px-3 py-1 shadow-sm font-bold">
                                        {godown.capacity}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 text-xs text-slate-500 italic bg-blue-50/50 p-2 rounded border border-blue-100/50">
                                <span className="font-bold">Locality:</span> {godown.address}
                            </div>
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-lg p-4">
                                <div>
                                    <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider font-bold">Temp Range</p>
                                    <p className="font-bold text-sm flex items-center gap-2 text-indigo-700">
                                        <ThermometerSnowflake className="h-4 w-4" /> {godown.temperatureRange}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider font-bold">Pricing Est.</p>
                                    <p className="font-bold text-sm text-slate-900">{godown.price}</p>
                                </div>
                            </div>
                            <div className="mt-5 flex gap-3">
                                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md font-bold transition-all hover:scale-[1.02] active:scale-[0.98]" asChild>
                                    <a href={`tel:${godown.phone}`}>
                                        <Phone className="h-4 w-4 mr-2" /> {godown.phone}
                                    </a>
                                </Button>
                                <Button variant="outline" className="flex-[0.4] border-blue-200 text-blue-700 hover:bg-blue-50 font-bold" asChild>
                                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(godown.name + " " + godown.address)}`} target="_blank" rel="noopener noreferrer">
                                        <Navigation className="h-4 w-4 mr-2" /> Map
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-200">
                        <ThermometerSnowflake className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                        <p className="text-lg font-medium">No AC Godowns found in {search}.</p>
                        <p className="text-sm">Try searching for a nearby prominent district.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
