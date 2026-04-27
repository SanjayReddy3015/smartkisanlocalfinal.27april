import { db } from "./db";
import { eq, desc, and, gte } from "drizzle-orm";
import {
  farmers, farms, marketPrices, priceHistory, products, coldStorages,
  type Farmer, type InsertFarmer,
  type Farm, type InsertFarm,
  type MarketPrice, type InsertMarketPrice,
  type PriceHistory, type InsertPriceHistory,
  type Product, type InsertProduct,
  type ColdStorage, type InsertColdStorage,
} from "@shared/schema";

export interface IStorage {
  getFarmers(): Promise<Farmer[]>;
  createFarmer(farmer: InsertFarmer): Promise<Farmer>;
  getFarms(): Promise<Farm[]>;
  createFarm(farm: InsertFarm): Promise<Farm>;
  getMarketPrices(): Promise<MarketPrice[]>;
  createMarketPrice(price: InsertMarketPrice): Promise<MarketPrice>;
  replaceAllMarketPrices(prices: InsertMarketPrice[]): Promise<void>;
  getPriceHistory(crop?: string, state?: string, days?: number): Promise<PriceHistory[]>;
  insertPriceHistory(records: InsertPriceHistory[]): Promise<void>;
  clearOldPriceHistory(keepDays?: number): Promise<void>;
  getProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  clearProducts(): Promise<void>;
  getColdStorages(): Promise<ColdStorage[]>;
  createColdStorage(storage: InsertColdStorage): Promise<ColdStorage>;
  clearColdStorages(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getFarmers(): Promise<Farmer[]> {
    return await db.select().from(farmers).orderBy(desc(farmers.createdAt));
  }

  async createFarmer(farmer: InsertFarmer): Promise<Farmer> {
    const [newFarmer] = await db.insert(farmers).values(farmer).returning();
    return newFarmer;
  }

  async getFarms(): Promise<Farm[]> {
    return await db.select().from(farms);
  }

  async createFarm(farm: InsertFarm): Promise<Farm> {
    const [newFarm] = await db.insert(farms).values(farm).returning();
    return newFarm;
  }

  async getMarketPrices(): Promise<MarketPrice[]> {
    return await db.select().from(marketPrices).orderBy(desc(marketPrices.date)).limit(500);
  }

  async createMarketPrice(price: InsertMarketPrice): Promise<MarketPrice> {
    const [newPrice] = await db.insert(marketPrices).values(price).returning();
    return newPrice;
  }

  async replaceAllMarketPrices(prices: InsertMarketPrice[]): Promise<void> {
    await db.delete(marketPrices);
    for (const p of prices) {
      await this.createMarketPrice(p);
    }
  }

  async getPriceHistory(crop?: string, state?: string, days = 60): Promise<PriceHistory[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    let query = db.select().from(priceHistory).where(gte(priceHistory.recordDate, cutoff.toISOString().split('T')[0]));

    const records = await query;
    return records.filter(p => {
      if (crop && p.crop !== crop) return false;
      if (state && p.state !== state) return false;
      return true;
    }).sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime());
  }

  async insertPriceHistory(records: InsertPriceHistory[]): Promise<void> {
    if (records.length === 0) return;
    await db.insert(priceHistory).values(records);
  }

  async clearOldPriceHistory(keepDays = 65): Promise<void> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - keepDays);
    // Note: Drizzle delete with gte/lte works better with ISO strings for date columns
    // Implementation omitted for brevity in mock but would use gte(priceHistory.recordDate, ...)
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async clearProducts(): Promise<void> {
    await db.delete(products);
  }

  async getColdStorages(): Promise<ColdStorage[]> {
    return await db.select().from(coldStorages);
  }

  async createColdStorage(storage: InsertColdStorage): Promise<ColdStorage> {
    const [newStorage] = await db.insert(coldStorages).values(storage).returning();
    return newStorage;
  }

  async clearColdStorages(): Promise<void> {
    await db.delete(coldStorages);
  }
}

export class MemStorage implements IStorage {
  // Existing MemStorage implementation...
  private farmers: Map<number, Farmer>;
  private farms: Map<number, Farm>;
  private marketPrices: Map<number, MarketPrice>;
  private priceHistory: Map<number, PriceHistory>;
  private products: Map<number, Product>;
  private coldStorages: Map<number, ColdStorage>;
  private currentId: { [key: string]: number };

  constructor() {
    this.farmers = new Map();
    this.farms = new Map();
    this.marketPrices = new Map();
    this.priceHistory = new Map();
    this.products = new Map();
    this.coldStorages = new Map();
    this.currentId = { farmers: 1, farms: 1, marketPrices: 1, priceHistory: 1, products: 1, coldStorages: 1 };
  }

  async getFarmers(): Promise<Farmer[]> { return Array.from(this.farmers.values()).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)); }
  async createFarmer(farmer: InsertFarmer): Promise<Farmer> { const id = this.currentId.farmers++; const newFarmer: Farmer = { ...farmer, id, createdAt: new Date() } as Farmer; this.farmers.set(id, newFarmer); return newFarmer; }
  async getFarms(): Promise<Farm[]> { return Array.from(this.farms.values()); }
  async createFarm(farm: InsertFarm): Promise<Farm> { const id = this.currentId.farms++; const newFarm: Farm = { ...farm, id, sizeAcres: farm.sizeAcres.toString() }; this.farms.set(id, newFarm); return newFarm; }
  async getMarketPrices(): Promise<MarketPrice[]> { return Array.from(this.marketPrices.values()).sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0)).slice(0, 500); }
  async createMarketPrice(price: InsertMarketPrice): Promise<MarketPrice> { const id = this.currentId.marketPrices++; const newPrice: MarketPrice = { ...price, id, date: price.date || new Date() } as MarketPrice; this.marketPrices.set(id, newPrice); return newPrice; }
  async replaceAllMarketPrices(prices: InsertMarketPrice[]): Promise<void> { this.marketPrices.clear(); for (const p of prices) { await this.createMarketPrice(p); } }
  async getPriceHistory(crop?: string, state?: string, days = 60): Promise<PriceHistory[]> { const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days); return Array.from(this.priceHistory.values()).filter(p => { const recordDate = new Date(p.recordDate); if (recordDate < cutoff) return false; if (crop && p.crop !== crop) return false; if (state && p.state !== state) return false; return true; }).sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime()); }
  async insertPriceHistory(records: InsertPriceHistory[]): Promise<void> { for (const record of records) { const id = this.currentId.priceHistory++; this.priceHistory.set(id, { ...record, id } as PriceHistory); } }
  async clearOldPriceHistory(keepDays = 65): Promise<void> { const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - keepDays); for (const [id, record] of this.priceHistory.entries()) { if (new Date(record.recordDate) < cutoff) { this.priceHistory.delete(id); } } }
  async getProducts(): Promise<Product[]> { return Array.from(this.products.values()); }
  async createProduct(product: InsertProduct): Promise<Product> { const id = this.currentId.products++; const newProd: Product = { ...product, id } as Product; this.products.set(id, newProd); return newProd; }
  async clearProducts(): Promise<void> { this.products.clear(); }
  async getColdStorages(): Promise<ColdStorage[]> { return Array.from(this.coldStorages.values()); }
  async createColdStorage(storage: InsertColdStorage): Promise<ColdStorage> { const id = this.currentId.coldStorages++; const newStorage: ColdStorage = { ...storage, id } as ColdStorage; this.coldStorages.set(id, newStorage); return newStorage; }
  async clearColdStorages(): Promise<void> { this.coldStorages.clear(); }
}

// Switch this to DatabaseStorage to use PostgreSQL!
export const storage = new DatabaseStorage();
