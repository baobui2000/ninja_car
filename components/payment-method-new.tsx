"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { CreditCard, Apple, Smartphone, Wallet, ArrowLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CardInfo {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
}

export default function PaymentMethodNew() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [showCreditCardForm, setShowCreditCardForm] = useState(false);
  const [cardInfo, setCardInfo] = useState<CardInfo>({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const paymentMethod = {
      type: selectedMethod,
      lastFourDigits:
        selectedMethod === "credit" ? cardInfo.number.slice(-4) : undefined,
      expiryDate: selectedMethod === "credit" ? cardInfo.expiry : undefined,
    };

    localStorage.setItem("paymentMethod", JSON.stringify(paymentMethod));

    toast({
      title: "Thành công!",
      description: "Đã thêm phương thức thanh toán.",
    });

    router.push("/rental-app");
  };

  const handleCardInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCardInfo((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const paymentMethods = [
    { id: "credit", label: "Thẻ Credit", icon: CreditCard },
    { id: "apple", label: "Apple Pay", icon: Apple },
    { id: "google", label: "Google Pay", icon: Smartphone }, // Thay đổi ở đây
    { id: "paypay", label: "PayPay", icon: Wallet },
    { id: "mercari", label: "Mercari Pay", icon: Wallet },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-[90%] max-w-md">
        <CardHeader>
          <Button
            variant="ghost"
            className="w-fit h-fit p-0 mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <CardTitle>Phương thức thanh toán</CardTitle>
          <CardDescription>
            Vui lòng chọn phương thức thanh toán bạn muốn sử dụng
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <RadioGroup
              value={selectedMethod}
              onValueChange={(value) => {
                setSelectedMethod(value);
                setShowCreditCardForm(value === "credit");
              }}
              className="space-y-4"
            >
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label
                    htmlFor={method.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <method.icon className="h-5 w-5" />
                    <span>{method.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {showCreditCardForm && (
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Số thẻ</Label>
                  <Input
                    id="number"
                    value={cardInfo.number}
                    onChange={handleCardInfoChange}
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Ngày hết hạn</Label>
                    <Input
                      id="expiry"
                      value={cardInfo.expiry}
                      onChange={handleCardInfoChange}
                      placeholder="MM/YY"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={cardInfo.cvv}
                      onChange={handleCardInfoChange}
                      placeholder="123"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Tên chủ thẻ</Label>
                  <Input
                    id="name"
                    value={cardInfo.name}
                    onChange={handleCardInfoChange}
                    placeholder="NGUYEN VAN A"
                    required
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={!selectedMethod}>
              Xác nhận
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
