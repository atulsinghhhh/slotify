"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { BusinessCard } from "@/components/BusinessCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Business {
    id: string;
    name: string;
    description?: string;
    address?: string;
    phone?: string;
}

export default function Business() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchBusinesses = async () => {
        try {
            const data = await api.get("/api/customer");
            setBusinesses(data);
        } catch (error) {
            console.error("Failed to fetch businesses", error);
            // Fallback for demo if API fails/doesn't exist yet
            setBusinesses([]); 
        } finally {
            setLoading(false);
        }
        };
        fetchBusinesses();
    }, []);

const filtered = businesses.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase())
);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                <h1 className="text-4xl font-bold tracking-tight">Find & Book Services</h1>
                <p className="text-muted-foreground mt-2">Discover local professionals and book appointments instantly.</p>
                </div>
                <div className="relative w-full md:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    type="search" 
                    placeholder="Search businesses..." 
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                    </div>
                ))}
                </div>
            ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((business) => (
                    <BusinessCard key={business.id} business={business} />
                ))}
                </div>
            ) : (
                <div className="text-center py-12">
                <h3 className="text-lg font-semibold">No businesses found</h3>
                <p className="text-muted-foreground">Try adjusting your search terms.</p>
                </div>
            )}
    </div>
  );
}
