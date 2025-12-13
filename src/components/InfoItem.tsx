// Простой компонент InfoItem
const InfoItem = ({
  label,
  value,
  icon,
  actions,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}) => (
  <div className="p-4 rounded-lg bg-gradient-to-r from-slate-50 to-white border border-color">
    <div className="flex items-start space-x-3">
      {icon && <div className="p-2 rounded-lg bg-accent/10">{icon}</div>}
      <div className="flex-1">
        <p className="text-sm text-secondary mb-1">{label}</p>
        <div className="font-medium text-primary">{value}</div>
      </div>
      {actions && <div className="ml-3 flex items-start">{actions}</div>}
    </div>
  </div>
);
