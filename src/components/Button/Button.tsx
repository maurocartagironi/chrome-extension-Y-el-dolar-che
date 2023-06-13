import * as React from "react";
import { IconButton } from "@material-tailwind/react";
import { Button as MTWButton } from "@material-tailwind/react";

interface ButtonProps {
   icon?: string;
   text?: string;
   variant?: any;
   size?: any;
   color?: any;
   disabled?: any;
   contentSize?: string;
   className?: string;
   onClick: (e) => void;
}

export default function Button({
   icon,
   text,
   variant,
   size,
   color,
   disabled,
   contentSize,
   className,
   onClick
}: ButtonProps) {
   const handleClick = (e) => {
      e.preventDefault();
      onClick(e);
   };

   return text ? (
      <MTWButton
         disabled={disabled ? true : undefined}
         nonce={undefined}
         onResize={undefined}
         onClick={handleClick}
         className={`cursor-pointer ${className}`} 
         variant={variant}
         color={color}
         size={size}
         onResizeCapture={undefined}>{text}</MTWButton>
   ) : (
      <IconButton
         nonce={undefined}
         onResize={undefined}
         onResizeCapture={undefined}
         className="cursor-pointer"
         onClick={handleClick}
         variant={variant}
         color={color}
         size={size === "sm" ? "sm" : size === "lg" ? "lg" : "md"}>
         <i
            className={`fas fa-${icon} ${
               contentSize === "lg"
                  ? "fa-lg"
                  : contentSize === "md"
                  ? "fa-md"
                  : ""
            }`}
         />
      </IconButton>
   );
}
