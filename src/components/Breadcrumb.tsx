import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbProps {
  items: {
    label: string;
    path?: string;
  }[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center text-xs font-black uppercase tracking-widest text-brand-muted" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 hover:text-brand-primary text-brand-muted transition-colors duration-200"
          >
            <Home size={14} />
            Home
          </Link>
        </li>
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="inline-flex items-center">
              <ChevronRight size={12} className="mx-1.5 md:mx-2 text-brand-muted/40" />
              {isLast || !item.path ? (
                <span className="text-brand-primary truncate max-w-[150px] sm:max-w-xs font-black">
                  {item.label}
                </span>
              ) : (
                <Link 
                  to={item.path} 
                  className="hover:text-brand-primary text-brand-muted transition-colors duration-200"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
