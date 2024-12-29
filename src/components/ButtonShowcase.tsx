import React from 'react';
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-primary-foreground hover:bg-primary-hover": variant === "primary",
            "bg-secondary text-secondary-foreground hover:bg-secondary-hover": variant === "secondary",
            "bg-accent text-accent-foreground hover:bg-accent-hover": variant === "accent",
            "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground": variant === "outline",
            "px-3 py-1 text-sm": size === "sm",
            "px-4 py-2 text-base": size === "md",
            "px-6 py-3 text-lg": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

const ButtonShowcase = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Beautiful Button Collection</h1>
        
        <div className="grid gap-12">
          {/* Primary Buttons Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Primary Buttons</h2>
            <div className="flex flex-wrap gap-4">
              <Button size="sm">Small Button</Button>
              <Button>Medium Button</Button>
              <Button size="lg">Large Button</Button>
            </div>
          </div>

          {/* Secondary Buttons Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Secondary Buttons</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="secondary" size="sm">Small Button</Button>
              <Button variant="secondary">Medium Button</Button>
              <Button variant="secondary" size="lg">Large Button</Button>
            </div>
          </div>

          {/* Accent Buttons Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Accent Buttons</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="accent" size="sm">Small Button</Button>
              <Button variant="accent">Medium Button</Button>
              <Button variant="accent" size="lg">Large Button</Button>
            </div>
          </div>

          {/* Outline Buttons Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Outline Buttons</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" size="sm">Small Button</Button>
              <Button variant="outline">Medium Button</Button>
              <Button variant="outline" size="lg">Large Button</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButtonShowcase;