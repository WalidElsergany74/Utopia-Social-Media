"use client"
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Pages, Routes } from "@/constants/enums";

export  const UnAuthenticatedSidebar = () => {
 const router = useRouter()
    return (
      <div className="sticky top-20">
      <Card className="bg-background'">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">Welcome Back!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground mb-4">
            Login to access your profile and connect with others.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => router.push(`/${Routes.AUTH}/${Pages.LOGIN}`)} variant={"outline"}>Login</Button>
            <Button onClick={() => router.push(`/${Routes.AUTH}/${Pages.Register}`)} variant={"default"}>Sign Up</Button>
          </div>
        </CardContent>
      </Card>
    </div>
    );

 }