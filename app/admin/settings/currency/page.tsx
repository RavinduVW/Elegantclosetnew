"use client";

import { useState, useEffect } from "react";
import { RefreshCw, DollarSign, Info, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  CURRENCIES,
  EXCHANGE_RATES,
  fetchExchangeRates,
  formatCurrency,
  convertFromLKR,
  type Currency,
} from "@/lib/currency";

export default function CurrencySettingsPage() {
  const [rates, setRates] = useState(EXCHANGE_RATES);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [testAmount, setTestAmount] = useState("10000");

  useEffect(() => {
    const savedRates = localStorage.getItem("exchangeRates");
    const savedTimestamp = localStorage.getItem("exchangeRatesTimestamp");

    if (savedRates && savedTimestamp) {
      setRates(JSON.parse(savedRates));
      setLastUpdated(new Date(savedTimestamp));
    }
  }, []);

  const handleRefreshRates = async () => {
    setIsRefreshing(true);
    try {
      const newRates = await fetchExchangeRates();
      setRates(newRates);
      const now = new Date();
      setLastUpdated(now);

      localStorage.setItem("exchangeRates", JSON.stringify(newRates));
      localStorage.setItem("exchangeRatesTimestamp", now.toISOString());

      toast.success("Exchange rates updated successfully");
    } catch (error) {
      toast.error("Failed to update exchange rates");
    } finally {
      setIsRefreshing(false);
    }
  };

  const baseCurrency = "LKR";
  const testAmountNum = parseFloat(testAmount) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Currency Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Manage multi-currency support and exchange rates
            </p>
          </div>
          <Button
            onClick={handleRefreshRates}
            disabled={isRefreshing}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Updating..." : "Update Rates"}
          </Button>
        </div>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-purple-900 mb-1">Base Currency: LKR (Sri Lankan Rupee)</h3>
                <p className="text-sm text-purple-800">
                  All product prices are stored in LKR. Exchange rates are used to display prices in other currencies.
                </p>
                {lastUpdated && (
                  <p className="text-sm text-purple-800 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Last updated: {lastUpdated.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              Exchange Rates
            </CardTitle>
            <CardDescription>
              Current exchange rates relative to 1 {baseCurrency}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(CURRENCIES).map(([code, info]) => {
                const rate = rates[code as Currency];
                const isBaseCurrency = code === baseCurrency;

                return (
                  <div
                    key={code}
                    className={`relative overflow-hidden rounded-lg border-2 p-4 transition-all ${
                      isBaseCurrency
                        ? "border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50"
                        : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
                    }`}
                  >
                    {isBaseCurrency && (
                      <Badge className="absolute top-2 right-2 bg-purple-600">
                        Base
                      </Badge>
                    )}
                    <div className="mb-3">
                      <div className="text-3xl mb-1">{info.flag}</div>
                      <h3 className="font-bold text-gray-900 text-lg">{code}</h3>
                      <p className="text-sm text-gray-500">{info.name}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-gray-900">{info.symbol}</span>
                        <span className="text-2xl font-bold text-gray-900">
                          {rate.toFixed(code === "JPY" ? 2 : 4)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        per 1 {baseCurrency}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Currency Converter
            </CardTitle>
            <CardDescription>
              Test currency conversions with current rates
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6">
              <Label htmlFor="testAmount">Amount in {baseCurrency}</Label>
              <Input
                id="testAmount"
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                placeholder="Enter amount"
                className="mt-1 max-w-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(CURRENCIES).map(([code, info]) => {
                if (code === baseCurrency) return null;

                const converted = convertFromLKR(testAmountNum, code as Currency);
                const formatted = formatCurrency(converted, code as Currency);

                return (
                  <div
                    key={code}
                    className="border-2 border-gray-200 rounded-lg p-4 bg-white hover:border-purple-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{info.flag}</span>
                      <span className="font-semibold text-gray-900">{code}</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {formatted}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle>Supported Currencies</CardTitle>
            <CardDescription>
              Currencies available for display on your storefront
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {Object.entries(CURRENCIES).map(([code, info]) => (
                <div
                  key={code}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{info.flag}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {info.name} ({code})
                      </h4>
                      <p className="text-sm text-gray-500">Symbol: {info.symbol}</p>
                    </div>
                  </div>
                  <Badge variant={code === baseCurrency ? "default" : "secondary"}>
                    {code === baseCurrency ? "Base Currency" : "Supported"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-900">How Currency Conversion Works</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>All prices are stored in LKR (base currency) in the database</li>
                  <li>Exchange rates are used to convert and display prices in other currencies</li>
                  <li>Rates can be updated manually or automatically via API</li>
                  <li>For live rates, configure NEXT_PUBLIC_EXCHANGE_RATE_API_KEY in your environment</li>
                  <li>Get a free API key from: https://www.exchangerate-api.com/</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
