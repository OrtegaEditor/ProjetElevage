// frontend/src/hooks/useStockCheck.ts
import { useState } from 'react';
import { stockAPI } from '../services/api';

interface StockCheckResult {
  available: boolean;
  stock_item: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    status: string;
  } | null;
  message: string;
  shortage: number;
  current_stock: number;
  unit: string;
}

export function useStockCheck() {
  const [checking, setChecking] = useState(false);
  const [stockResult, setStockResult] = useState<StockCheckResult | null>(null);

  const checkStock = async (
    category: string,
    productName: string,
    quantity: number,
    farmId: string
  ): Promise<StockCheckResult> => {
    console.log("useStockCheck.checkStock called:", { category, productName, quantity, farmId });
    setChecking(true);
    try {
      const result = await stockAPI.checkAvailability(category, productName, quantity, farmId);
      console.log("API result:", result);
      setStockResult(result);
      return result;
    } catch (error: any) {
      console.error("Erreur vérification stock:", error);
      const errorMessage = error.response?.data?.detail || error.message;
      
      const fallbackResult: StockCheckResult = {
        available: false,
        stock_item: null,
        message: `Erreur: ${errorMessage}`,
        shortage: quantity,
        current_stock: 0,
        unit: ""
      };
      setStockResult(fallbackResult);
      return fallbackResult;
    } finally {
      setChecking(false);
    }
  };

  const clearResult = () => setStockResult(null);

  return { checkStock, checking, stockResult, clearResult };
}