"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import {
  MapPin,
  Car,
  Bike,
  Menu,
  Search,
  User,
  ChevronRight,
  X,
  CreditCard,
  Calendar,
  Crosshair,
  Battery,
  BatteryCharging,
  Loader2,
  CheckCircle,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Image from "next/image";
import Link from "next/link";

// Placeholder images (replace with actual imports)
import BuggyCar from "../app/images/buggy-car.jpg";
import BuggyCar2 from "../app/images/buggy-car2.jpg";
import BuggyCar3 from "../app/images/buggy-car.jpg";
import Tandem from "../app/images/tandem.jpg";
import Tandem2 from "../app/images/tandem.jpg";
import Tandem3 from "../app/images/tandem.jpg";

const customIconStyle = `
  .custom-icon {
    background: none;
    border: none;
  }
`;

const createCustomIcon = (IconComponent: React.ElementType) => {
  return L.divIcon({
    className: "custom-icon",
    html: '<div id="custom-icon-container"></div>',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

const renderCustomIcon = (
  container: HTMLElement,
  IconComponent: React.ElementType
) => {
  const root = createRoot(container);
  root.render(<IconComponent className="w-8 h-8 text-primary" />);
};

const calculateRange = (batteryPercentage: number, maxRange: number) => {
  return Math.round((batteryPercentage / 100) * maxRange);
};

export default function Component() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRentDialogOpen, setIsRentDialogOpen] = useState(false);
  const [rentType, setRentType] = useState<"car" | "bike" | null>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [currentLocation, setCurrentLocation] =
    useState<L.LatLngExpression | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const [rentalStatus, setRentalStatus] = useState<
    "idle" | "loading" | "success" | "guide" | "timer"
  >("idle");
  const [currentGuideStep, setCurrentGuideStep] = useState(0);
  const [rentalTimer, setRentalTimer] = useState(0);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const openRentDialog = (type: "car" | "bike") => {
    setRentType(type);
    setIsRentDialogOpen(true);
  };

  const initializeMap = useCallback(() => {
    if (mapRef.current && !map) {
      const initialLocation: L.LatLngExpression = [34.6422403, 135.1103229]; // Osaka coordinates
      const newMap = L.map(mapRef.current).setView(initialLocation, 17);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(newMap);
      setMap(newMap);
    }
  }, [map]);

  useEffect(() => {
    initializeMap();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [initializeMap, map]);

  const centerMapOnCurrentLocation = useCallback(() => {
    if (map) {
      map.locate({ setView: true, maxZoom: 16 });
      map.on("locationfound", (e: L.LocationEvent) => {
        setCurrentLocation(e.latlng);
        const customIcon = createCustomIcon(MapPin);
        const marker = L.marker(e.latlng, { icon: customIcon }).addTo(map);
        marker.bindPopup("Your current location").openPopup();

        const container = marker
          .getElement()
          .querySelector("#custom-icon-container");
        if (container) {
          renderCustomIcon(container, MapPin);
        }
      });
      map.on("locationerror", () => {
        console.log("Error: The Geolocation service failed.");
      });
    }
  }, [map]);

  const handleSearch = useCallback(async () => {
    if (searchQuery && map) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}`
        );
        const data = await response.json();
        setSearchResults(data);
        if (data.length > 0) {
          const { lat, lon } = data[0];
          map.setView([lat, lon], 13);
          const customIcon = createCustomIcon(MapPin);
          const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
          marker.bindPopup(data[0].display_name).openPopup();

          const container = marker
            .getElement()
            .querySelector("#custom-icon-container");
          if (container) {
            renderCustomIcon(container, MapPin);
          }
        }
      } catch (error) {
        console.error("Error searching for location:", error);
      }
    }
  }, [searchQuery, map]);

  const cars = [
    {
      name: "ビーチバギー [B01]",
      image: BuggyCar,
      batteryPercentage: 100,
      maxRange: 100,
    },
    {
      name: "ビーチバギー [B02]",
      image: BuggyCar2,
      batteryPercentage: 65,
      maxRange: 65,
    },
    {
      name: "ビーチバギー [B03]",
      image: BuggyCar3,
      batteryPercentage: 90,
      maxRange: 90,
    },
  ];

  const bikes = [
    {
      name: "タンデム T01",
      image: Tandem,
      batteryPercentage: 75,
      maxRange: 30,
    },
    {
      name: "タンデム T02",
      image: Tandem2,
      batteryPercentage: 85,
      maxRange: 30,
    },
    {
      name: "タンデム T03",
      image: Tandem3,
      batteryPercentage: 95,
      maxRange: 30,
    },
  ];

  const handleConfirmRental = () => {
    setRentalStatus("loading");
    setIsRentDialogOpen(false);
    setTimeout(() => {
      setRentalStatus("success");
      setTimeout(() => {
        setRentalStatus("guide");
      }, 2000);
    }, 2000);
  };

  const guideSteps = [
    "アプリのマップを使用して車両を見つけます",
    "車両のQRコードをスキャンしてロックを解除します",
    "シートを調整し、安全装備を着用します",
    "乗車を開始し、楽しんでください！",
  ];

  const handleNextGuideStep = () => {
    if (currentGuideStep < guideSteps.length - 1) {
      setCurrentGuideStep(currentGuideStep + 1);
    } else {
      setRentalStatus("timer");
      setRentalTimer(0);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (rentalStatus === "timer") {
      interval = setInterval(() => {
        setRentalTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [rentalStatus]);

  return (
    <div className="flex flex-col min-h-screen">
      <style>{customIconStyle}</style>
      <header className="flex items-center justify-between p-4 bg-primary text-primary-foreground sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleMenu}>
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-4">
                <Link href="/" className="text-lg hover:underline">
                  Home
                </Link>
                <Link href="/my-rentals" className="text-lg hover:underline">
                  My Rentals
                </Link>
                <Link href="/help" className="text-lg hover:underline">
                  Help
                </Link>
                <Link href="/settings" className="text-lg hover:underline">
                  Settings
                </Link>
                <Link
                  href="/payment-method"
                  className="text-lg hover:underline"
                >
                  Thêm phương thức thanh toán
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <h1 className="text-xl font-bold">NINJA</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar>
                  <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Calendar className="mr-2 h-4 w-4" />
                <span>My Rentals</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <X className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="mb-4 h-[calc(100vh-8rem)] max-h-[600px] rounded-lg relative overflow-hidden">
          <div ref={mapRef} className="w-full h-full z-0"></div>
          <div className="absolute bottom-4 left-4 right-4 flex items-center space-x-2 z-10">
            <div className="flex-grow flex items-center bg-background rounded-md shadow-lg">
              <Input
                placeholder="Search location"
                className="border-none flex-grow"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button
                variant="ghost"
                size="icon"
                className="rounded-l-none"
                onClick={handleSearch}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="secondary"
              size="icon"
              onClick={centerMapOnCurrentLocation}
            >
              <Crosshair className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="cars" className="mb-4">
          <TabsList className="grid w-full max-w-[200px] mx-auto grid-cols-2 shadow-md rounded-lg overflow-hidden mb-4">
            <TabsTrigger
              value="cars"
              className="flex items-center justify-center p-2 data-[state=active]:shadow-inner"
            >
              <Car className="h-6 w-6" />
              <span className="sr-only">Cars</span>
            </TabsTrigger>
            <TabsTrigger
              value="bikes"
              className="flex items-center justify-center p-2 data-[state=active]:shadow-inner"
            >
              <Bike className="h-6 w-6" />
              <span className="sr-only">E-Bikes</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="cars">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cars.map((vehicle) => (
                <Card key={vehicle.name}>
                  <CardContent className="p-4">
                    <div className="aspect-video bg-muted rounded-md mb-2 overflow-hidden">
                      <Image
                        src={vehicle.image}
                        alt={`${vehicle.name} car`}
                        width={300}
                        height={200}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <h3 className="font-semibold">{vehicle.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center">
                        {vehicle.batteryPercentage >= 80 ? (
                          <BatteryCharging className="h-5 w-5 text-green-500 mr-1" />
                        ) : (
                          <Battery className="h-5 w-5 text-yellow-500 mr-1" />
                        )}
                        <span className="text-sm">
                          {vehicle.batteryPercentage}%
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ~
                        {calculateRange(
                          vehicle.batteryPercentage,
                          vehicle.maxRange
                        )}{" "}
                        km range
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => openRentDialog("car")}
                    >
                      Rent Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="bikes">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bikes.map((bike) => (
                <Card key={bike.name}>
                  <CardContent className="p-4">
                    <div className="aspect-video bg-muted rounded-md mb-2  overflow-hidden">
                      <Image
                        src={bike.image}
                        alt={`${bike.name}`}
                        width={300}
                        height={200}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <h3 className="font-semibold">{bike.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center">
                        {bike.batteryPercentage >= 80 ? (
                          <BatteryCharging className="h-5 w-5 text-green-500 mr-1" />
                        ) : (
                          <Battery className="h-5 w-5 text-yellow-500 mr-1" />
                        )}
                        <span className="text-sm">
                          {bike.batteryPercentage}%
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ~{calculateRange(bike.batteryPercentage, bike.maxRange)}{" "}
                        km range
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => openRentDialog("bike")}
                    >
                      Rent Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-muted p-4 text-center text-sm text-muted-foreground">
        <p>&copy; 2023 RentGo. All rights reserved.</p>
        <nav className="mt-2">
          <a href="#" className="hover:underline">
            Terms of Service
          </a>
          {" | "}
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          {" | "}
          <a href="#" className="hover:underline">
            Contact Us
          </a>
        </nav>
      </footer>

      <Dialog open={isRentDialogOpen} onOpenChange={setIsRentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Rent a {rentType === "car" ? "Car" : "E-Bike"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details to rent your{" "}
              {rentType === "car" ? "car" : "e-bike"}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rental-type" className="text-right">
                Type
              </Label>
              <Select defaultValue={rentType || undefined}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-background border">
                  {rentType === "car" ? (
                    <>
                      <SelectItem
                        className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        value="hatchback"
                      >
                        ビーチバギー
                      </SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem
                        className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        value="folding"
                      >
                        タンデム
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rental-duration" className="text-right">
                Duration
              </Label>
              <Select defaultValue="1">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-background border">
                  <SelectItem
                    className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    value="1"
                  >
                    1時間
                  </SelectItem>
                  <SelectItem
                    className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    value="2"
                  >
                    2時間
                  </SelectItem>
                  <SelectItem
                    className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    value="4"
                  >
                    4時間
                  </SelectItem>
                  <SelectItem
                    className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text:accent-foreground"
                    value="8"
                  >
                    8時間
                  </SelectItem>
                  <SelectItem
                    className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    value="24"
                  >
                    一日
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pickup-location" className="text-right">
                Pickup
              </Label>
              <Select defaultValue="">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select pickup location" />
                </SelectTrigger>
                <SelectContent className="bg-background border">
                  <SelectItem value="location1">
                    <span>Osaka Station</span>
                    <span className="ml-5 text-muted-foreground">0.5 km</span>
                  </SelectItem>
                  <SelectItem value="location2">
                    <span>Namba Parks</span>
                    <span className="ml-5 text-muted-foreground">1.2 km</span>
                  </SelectItem>
                  <SelectItem value="location3">
                    <span>Osaka Castle</span>
                    <span className="ml-5 text-muted-foreground">2.5 km</span>
                  </SelectItem>
                  <SelectItem value="location4">
                    <span>Universal Studios Japan</span>
                    <span className="ml-5 text-muted-foreground">5.8 km</span>
                  </SelectItem>
                  <SelectItem value="location5">
                    <span>Osaka Aquarium Kaiyukan</span>
                    <span className="ml-5 text-muted-foreground">7.3 km</span>
                  </SelectItem>
                  <SelectItem value="location6">
                    <span>Itami Airport</span>
                    <span className="ml-5 text-muted-foreground">12.6 km</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleConfirmRental}>
              確認してライドする
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loading Dialog */}
      <Dialog open={rentalStatus === "loading"}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex flex-col items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="mt-4">レンタルリクエストを処理中...</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={rentalStatus === "success"}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex flex-col items-center justify-center h-40">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <p className="mt-4">レンタルが正常に確認されました！</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Guide Dialog */}
      <Dialog open={rentalStatus === "guide"}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>車両のレンタル方法</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              ステップ {currentGuideStep + 1} / {guideSteps.length}
            </p>
            <p>{guideSteps[currentGuideStep]}</p>
          </div>
          <DialogFooter>
            <Button onClick={handleNextGuideStep}>
              {currentGuideStep < guideSteps.length - 1 ? (
                <>
                  次へ <ChevronRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                "レンタル開始"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Timer Dialog */}
      <Dialog open={rentalStatus === "timer"}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>レンタルがアクティブです</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-2xl font-bold text-center">
              {Math.floor(rentalTimer / 3600)
                .toString()
                .padStart(2, "0")}
              :
              {Math.floor((rentalTimer % 3600) / 60)
                .toString()
                .padStart(2, "0")}
              :{(rentalTimer % 60).toString().padStart(2, "0")}
            </p>
          </div>
          <div className="h-[300px] relative">
            {mapRef.current && (
              <div id="rental-map" className="w-full h-full"></div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRentalStatus("idle")}>
              レンタル終了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
