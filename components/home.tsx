"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[90%] max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Ninja</CardTitle>
          <CardDescription>Giải pháp thuê xe một chạm</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button onClick={() => router.push("/login")} className="w-full">
            Đã có tài khoản? Đăng nhập
          </Button>
          <Button
            onClick={() => router.push("/signup")}
            variant="outline"
            className="w-full"
          >
            Tạo tài khoản mới
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
