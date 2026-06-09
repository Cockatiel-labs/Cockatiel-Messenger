"use client";

import { ChevronLeft, ChevronRight, Code2, HeartHandshake, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Activity, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { CarouselApi } from "@/components/ui/carousel";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const OnboardingContents = [
  {
    index: 0,
    title: "Welcome to Cockatiel Messenger",
    desc: "A modern messaging platform built around privacy, transparency, and meaningful communication.",
  },
  {
    index: 1,
    title: "Privacy by Design",
    desc: "Experience messaging built around privacy from the start. Your conversations deserve protection, clarity, and respect without unnecessary compromises.",
    icon: <Shield className="mx-auto mb-6 size-16 text-muted-foreground" />,
  },
  {
    index: 2,
    title: "Open Source for Everyone",
    desc: "Explore a platform developed in the open. Community contributions and transparent development help create a stronger and more trustworthy experience.",
    icon: <Code2 className="mx-auto mb-6 size-16 text-muted-foreground" />,
  },
  {
    index: 3,
    title: "People Before Platforms",
    desc: "Communication should serve people, not the other way around. Enjoy a clean experience focused on usability, reliability, and meaningful connections.",
    icon: <HeartHandshake className="mx-auto mb-6 size-16 text-muted-foreground" />,
  },
];

export default function Onboarding() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const isFirstSlide = current === 0;
  const isLastSlide = current === OnboardingContents.length - 1;

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect();

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-lg">
        <Card className="w-full">
          <CardHeader className="border-b">
            <CardTitle>
              <div className="flex items-center gap-4">
                <Image src="/images/logo.png" height={56} width={56} alt="Logo" className="size-12 sm:size-14" />
                <div className="flex flex-col">
                  <h1 className="text-xl sm:text-2xl font-bold">Cockatiel Messenger</h1>
                  <CardDescription className="text-xs sm:text-sm leading-relaxed font-medium">
                    An encrypted chat service that puts your privacy first
                  </CardDescription>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <Carousel
            setApi={setApi}
            opts={{
              dragFree: false,
              watchDrag: false,
            }}
          >
            <CarouselContent>
              {OnboardingContents.map((item) => (
                <CarouselItem key={item.title}>
                  <CardContent className="flex flex-col justify-center items-center h-64 text-center">
                    {item.icon}
                    <h2 className="mb-3 text-xl font-semibold tracking-tight">{item.title}</h2>
                    <p className="text-sm leading-6 text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <div className="flex justify-center gap-2 pb-6">
            {OnboardingContents.map((item) => (
              <span
                key={item.index}
                className={cn(
                  "h-2 rounded-full transition-all duration-300 bg-muted-foreground",
                  current === item.index ? "w-8 bg-primary" : "w-2",
                )}
              />
            ))}
          </div>

          <CardFooter className="flex w-full">
            <div className="h-12 w-full relative">
              <Activity mode={current === 0 ? "hidden" : "visible"}>
                <Button type="button" className="absolute top-0 left-0 h-12 w-1/3" onClick={() => api?.scrollPrev()}>
                  <ChevronLeft className="translate-y-px" />
                  Back
                </Button>
              </Activity>
              {isLastSlide ? (
                <Link href="/signup" className="absolute top-0 right-0 h-12 w-2/3">
                  <Button type="button" className="h-12 w-full">
                    Let's Begin
                  </Button>
                </Link>
              ) : (
                <Button
                  type="button"
                  className={`absolute top-0 right-0 h-12 ${current === 0 ? "w-full" : "w-2/3"}`}
                  onClick={() => api?.scrollNext()}
                >
                  {isFirstSlide ? "Get Started" : "Next"}
                  <ChevronRight className="translate-y-px" />
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
