import React from "react";
import Link from "../link";
import { Routes } from "@/constants/enums";

const Logo = () => {
  return (
    <Link className="text-primary font-extrabold text-4xl tracking-wider" href={Routes.ROOT}>
      Utopia
    </Link>
  );
};

export default Logo;
