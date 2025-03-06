import React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const AvatarGroup = ({ 
  children, 
  max = 3,
  className,
  ...props 
}) => {
  const avatars = React.Children.toArray(children);
  const totalAvatars = avatars.length;
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = totalAvatars - max;

  return (
    <div
      className={cn(
        "flex -space-x-4 rtl:space-x-reverse overflow-hidden",
        className
      )}
      {...props}
    >
      <TooltipProvider>
        {visibleAvatars.map((avatar, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <div
                className="relative inline-block border-2 border-background rounded-full"
                style={{
                  zIndex: totalAvatars - index,
                }}
              >
                {avatar}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {React.isValidElement(avatar) && avatar.props.title}
            </TooltipContent>
          </Tooltip>
        ))}
        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="relative inline-flex items-center justify-center w-8 h-8 text-xs font-medium text-white bg-gray-400 border-2 border-background rounded-full"
                style={{
                  zIndex: 0,
                }}
              >
                +{remainingCount}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {remainingCount} more {remainingCount === 1 ? 'user' : 'users'}
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
};
