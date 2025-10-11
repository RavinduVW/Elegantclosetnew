"use client";

import { useState, useEffect } from "react";
import { Tag, Save, Info, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface PricingRules {
  roundPrices: boolean;
  roundingMethod: "up" | "down" | "nearest";
  roundToNearest: number;
  minimumPrice: number;
  markupPercentage: number;
  bulkDiscountEnabled: boolean;
  bulkDiscountThreshold: number;
  bulkDiscountPercentage: number;
}

export default function PricingSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  const [pricingRules, setPricingRules] = useState<PricingRules>({
    roundPrices: true,
    roundingMethod: "nearest",
    roundToNearest: 10,
    minimumPrice: 100,
    markupPercentage: 50,
    bulkDiscountEnabled: false,
    bulkDiscountThreshold: 5,
    bulkDiscountPercentage: 10,
  });

  useEffect(() => {
    const saved = localStorage.getItem("pricingRules");
    if (saved) {
      setPricingRules(JSON.parse(saved));
    }
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      localStorage.setItem("pricingRules", JSON.stringify(pricingRules));

      toast.success("Pricing settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const calculateExamplePrice = () => {
    let price = 4567;

    if (pricingRules.roundPrices) {
      const factor = pricingRules.roundToNearest;
      if (pricingRules.roundingMethod === "up") {
        price = Math.ceil(price / factor) * factor;
      } else if (pricingRules.roundingMethod === "down") {
        price = Math.floor(price / factor) * factor;
      } else {
        price = Math.round(price / factor) * factor;
      }
    }

    return { price };
  };

  const example = calculateExamplePrice();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Pricing Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Configure pricing rules and calculations
            </p>
          </div>
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Save className={`w-4 h-4 mr-2 ${isSaving ? "animate-pulse" : ""}`} />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-600" />
              Price Display Example
            </CardTitle>
            <CardDescription>
              Preview how prices will be displayed with current settings
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">Original Price: Rs. 4,567.00</p>
                <div className="text-4xl font-bold text-purple-600">
                  Rs. {example.price.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  After applying {pricingRules.roundPrices ? "rounding rules" : "no rounding"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              Pricing Rules
            </CardTitle>
            <CardDescription>
              Configure how prices are calculated and displayed
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
              <div className="space-y-0.5">
                <Label htmlFor="round-prices" className="text-base font-semibold">
                  Enable Price Rounding
                </Label>
                <p className="text-sm text-gray-500">
                  Automatically round prices to cleaner numbers
                </p>
              </div>
              <Switch
                id="round-prices"
                checked={pricingRules.roundPrices}
                onCheckedChange={(checked) =>
                  setPricingRules({ ...pricingRules, roundPrices: checked })
                }
              />
            </div>

            {pricingRules.roundPrices && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rounding-method">Rounding Method</Label>
                  <Select
                    value={pricingRules.roundingMethod}
                    onValueChange={(value: "up" | "down" | "nearest") =>
                      setPricingRules({ ...pricingRules, roundingMethod: value })
                    }
                  >
                    <SelectTrigger id="rounding-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="up">Round Up</SelectItem>
                      <SelectItem value="down">Round Down</SelectItem>
                      <SelectItem value="nearest">Round to Nearest</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">
                    Choose how to round calculated prices
                  </p>
                </div>

                <div>
                  <Label htmlFor="round-to">Round to Nearest</Label>
                  <Select
                    value={pricingRules.roundToNearest.toString()}
                    onValueChange={(value) =>
                      setPricingRules({ ...pricingRules, roundToNearest: parseInt(value) })
                    }
                  >
                    <SelectTrigger id="round-to">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Rs. 1</SelectItem>
                      <SelectItem value="5">Rs. 5</SelectItem>
                      <SelectItem value="10">Rs. 10</SelectItem>
                      <SelectItem value="50">Rs. 50</SelectItem>
                      <SelectItem value="100">Rs. 100</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">
                    Round to the nearest increment
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min-price">Minimum Price (LKR)</Label>
                <Input
                  id="min-price"
                  type="number"
                  value={pricingRules.minimumPrice}
                  onChange={(e) =>
                    setPricingRules({ ...pricingRules, minimumPrice: parseInt(e.target.value) || 0 })
                  }
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Products cannot be priced below this amount
                </p>
              </div>

              <div>
                <Label htmlFor="markup">Default Markup Percentage</Label>
                <Input
                  id="markup"
                  type="number"
                  value={pricingRules.markupPercentage}
                  onChange={(e) =>
                    setPricingRules({ ...pricingRules, markupPercentage: parseInt(e.target.value) || 0 })
                  }
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Standard markup applied to cost prices
                </p>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white mb-4">
                <div className="space-y-0.5">
                  <Label htmlFor="bulk-discount" className="text-base font-semibold">
                    Enable Bulk Discounts
                  </Label>
                  <p className="text-sm text-gray-500">
                    Automatic discounts for bulk purchases
                  </p>
                </div>
                <Switch
                  id="bulk-discount"
                  checked={pricingRules.bulkDiscountEnabled}
                  onCheckedChange={(checked) =>
                    setPricingRules({ ...pricingRules, bulkDiscountEnabled: checked })
                  }
                />
              </div>

              {pricingRules.bulkDiscountEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bulk-threshold">Minimum Quantity</Label>
                    <Input
                      id="bulk-threshold"
                      type="number"
                      value={pricingRules.bulkDiscountThreshold}
                      onChange={(e) =>
                        setPricingRules({ ...pricingRules, bulkDiscountThreshold: parseInt(e.target.value) || 1 })
                      }
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Minimum items for bulk discount
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="bulk-percentage">Bulk Discount %</Label>
                    <Input
                      id="bulk-percentage"
                      type="number"
                      value={pricingRules.bulkDiscountPercentage}
                      onChange={(e) =>
                        setPricingRules({ ...pricingRules, bulkDiscountPercentage: parseInt(e.target.value) || 0 })
                      }
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Discount percentage for bulk orders
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Important Notes</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Pricing rules apply to all products unless overridden at the product level</li>
                  <li>Rounding helps maintain clean, easy-to-read prices across your store</li>
                  <li>Minimum prices prevent accidental underpricing of products</li>
                  <li>Bulk discounts are automatically applied at checkout when quantity threshold is met</li>
                  <li>Always test pricing changes before applying to live products</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
