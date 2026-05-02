import { cn } from "./StatusBadge";

export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-4 w-full",
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
  value,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  value?: string | React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-md transition duration-200 shadow-sm p-5 border border-slate-200 bg-white flex flex-col justify-between space-y-4",
        className
      )}
    >
      {header}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2 text-slate-500 mb-1">
            {icon}
            <span className="font-sans font-medium text-sm">{title}</span>
          </div>
          <div className="font-sans font-bold text-slate-900 text-3xl mb-1">
            {value}
          </div>
          <div className="font-sans font-normal text-slate-500 text-xs">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
}
