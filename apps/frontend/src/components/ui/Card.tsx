import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>{children}</div>
  );
};

export const CardHeader: React.FC<{ title: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
      {subtitle && (
        <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
      )}
    </div>
  );
};
