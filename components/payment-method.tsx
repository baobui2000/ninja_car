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
import { CreditCard, Apple, SmartPhone, Wallet, ArrowLeft } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

// Thêm interfaces cho type safety
interface CardInfo {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
}

interface PaymentMethod {
  type: string;
  lastFourDigits?: string;
  expiryDate?: string;
}

export default function PaymentMethod() {
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
  const [errors, setErrors] = useState<Partial<CardInfo>>({});

  // Validation functions
  const validateCardNumber = (number: string) => {
    return /^\d{16}$/.test(number.replace(/\s/g, ""));
  };

  const validateExpiry = (expiry: string) => {
    return /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiry);
  };

  const validateCVV = (cvv: string) => {
    return /^\d{3,4}$/.test(cvv);
  };

  const validateName = (name: string) => {
    return name.trim().length >= 3;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedMethod === "credit") {
      // Reset errors
      setErrors({});
      let hasErrors = false;
      const newErrors: Partial<CardInfo> = {};

      // Validate card info
      if (!validateCardNumber(cardInfo.number)) {
        newErrors.number = "Số thẻ không hợp lệ";
        hasErrors = true;
      }
      if (!validateExpiry(cardInfo.expiry)) {
        newErrors.expiry = "Ngày hết hạn không hợp lệ (MM/YY)";
        hasErrors = true;
      }
      if (!validateCVV(cardInfo.cvv)) {
        newErrors.cvv = "CVV không hợp lệ";
        hasErrors = true;
      }
      if (!validateName(cardInfo.name)) {
        newErrors.name = "Tên chủ thẻ không hợp lệ";
        hasErrors = true;
      }

      if (hasErrors) {
        setErrors(newErrors);
        toast({
          title: "Lỗi!",
          description: "Vui lòng kiểm tra lại thông tin thẻ.",
          variant: "destructive",
        });
        return;
      }
    }

    const paymentMethod: PaymentMethod = {
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
    let formattedValue = value;

    // Format card number with spaces
    if (id === "number") {
      formattedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim();
    }
    // Format expiry date
    else if (id === "expiry") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .slice(0, 5);
    }
    // Format CVV
    else if (id === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setCardInfo((prev) => ({
      ...prev,
      [id]: formattedValue,
    }));

    // Clear error when user starts typing
    if (errors[id as keyof CardInfo]) {
      setErrors((prev) => ({
        ...prev,
        [id]: undefined,
      }));
    }
  };

  const paymentMethods = [
    { id: "credit", label: "Thẻ Credit", icon: CreditCard },
    { id: "apple", label: "Apple Pay", icon: Apple },
    { id: "google", label: "Google Pay", icon: SmartPhone },
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
                setErrors({});
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
                    maxLength={19}
                    required
                    className={errors.number ? "border-red-500" : ""}
                  />
                  {errors.number && (
                    <p className="text-sm text-red-500">{errors.number}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Ngày hết hạn</Label>
                    <Input
                      id="expiry"
                      value={cardInfo.expiry}
                      onChange={handleCardInfoChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      required
                      className={errors.expiry ? "border-red-500" : ""}
                    />
                    {errors.expiry && (
                      <p className="text-sm text-red-500">{errors.expiry}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={cardInfo.cvv}
                      onChange={handleCardInfoChange}
                      placeholder="123"
                      maxLength={4}
                      required
                      className={errors.cvv ? "border-red-500" : ""}
                    />
                    {errors.cvv && (
                      <p className="text-sm text-red-500">{errors.cvv}</p>
                    )}
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
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
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
