"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Signup() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Thành công!",
      description: "Tài khoản của bạn đã được tạo.",
    });

    router.push("/payment-method");
    setIsLoading(false);
  };

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
          <CardTitle className="text-2xl">Tạo tài khoản</CardTitle>
          <CardDescription>Nhập thông tin để tạo tài khoản mới</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input id="name" placeholder="Nhập họ và tên" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Nhập email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Tạo mật khẩu"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
            </Button>
            <Button
              type="button"
              variant="link"
              className="text-sm"
              onClick={() => router.push("/login")}
            >
              Đã có tài khoản? Đăng nhập
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
